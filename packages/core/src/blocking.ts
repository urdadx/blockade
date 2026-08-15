import { getDomain } from "tldts";

import { blockCategories, categoryIds, type CategoryId } from "./categories";
import { defaultAdultKeywords } from "./default-adult-keywords";

export type BlockingSettings = {
  version: number;
  enabledCategoryIds: CategoryId[];
  excludedDomains: string[];
  customBlockedDomains: string[];
  blockedKeywords: string[];
  dailyLimits: Record<string, string>;
};

export const blockingSettingsVersion = 5;

export const defaultBlockingSettings: BlockingSettings = {
  version: blockingSettingsVersion,
  enabledCategoryIds: ["adult", "gambling"],
  excludedDomains: [],
  customBlockedDomains: [],
  blockedKeywords: [...defaultAdultKeywords],
  dailyLimits: {},
};

export function normalizeHostname(value: string): string | null {
  const input = value.trim();
  if (!input || input.includes("*")) return null;

  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password || url.port) return null;

    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    if (!hostname || hostname === "localhost" || !hostname.includes(".")) return null;
    return hostname;
  } catch {
    return null;
  }
}

export function getRegistrableDomain(value: string): string | null {
  const hostname = normalizeHostname(value);
  if (!hostname) return null;
  return getDomain(hostname, { allowPrivateDomains: true }) ?? hostname;
}

export function normalizeWebsiteDomain(value: string): string | null {
  const hostname = normalizeHostname(value);
  if (!hostname) return null;
  return getDomain(hostname, { allowPrivateDomains: true }) ? hostname : null;
}

export function domainMatches(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

export function sanitizeBlockingSettings(value: Partial<BlockingSettings>): BlockingSettings {
  const validCategoryIds = new Set<CategoryId>(categoryIds);
  const configuredCategoryIds = (() => {
    if (value.version === blockingSettingsVersion) {
      return value.enabledCategoryIds ?? defaultBlockingSettings.enabledCategoryIds;
    }
    if (value.version === 2) {
      return [...(value.enabledCategoryIds ?? []), "gambling" as const];
    }
    if (value.version === 3 || value.version === 4) {
      return value.enabledCategoryIds ?? defaultBlockingSettings.enabledCategoryIds;
    }
    return defaultBlockingSettings.enabledCategoryIds;
  })();
  const enabledCategoryIds = Array.from(
    new Set(configuredCategoryIds.filter((id): id is CategoryId => validCategoryIds.has(id))),
  );
  const configuredKeywords =
    value.version === blockingSettingsVersion
      ? (value.blockedKeywords ?? defaultBlockingSettings.blockedKeywords)
      : [...(value.blockedKeywords ?? []), ...defaultAdultKeywords];

  return {
    version: blockingSettingsVersion,
    enabledCategoryIds,
    excludedDomains: normalizeDomainList(value.excludedDomains ?? []),
    customBlockedDomains: normalizeDomainList(value.customBlockedDomains ?? []),
    blockedKeywords: normalizeKeywordList(configuredKeywords),
    dailyLimits: normalizeDailyLimits(value.dailyLimits),
  };
}

export function getCategoryDomains(settings: BlockingSettings): string[] {
  const enabled = new Set(settings.enabledCategoryIds);
  return Array.from(
    new Set(
      blockCategories
        .filter((category) => enabled.has(category.id))
        .flatMap((category) => category.domains),
    ),
  ).sort();
}

export function getEffectiveBlockedDomains(settings: BlockingSettings): string[] {
  return Array.from(
    new Set([...getCategoryDomains(settings), ...settings.customBlockedDomains]),
  ).sort();
}

export function isHostnameBlocked(hostnameValue: string, settings: BlockingSettings): boolean {
  const hostname = normalizeHostname(hostnameValue);
  if (!hostname) return false;

  if (settings.excludedDomains.some((domain) => domainMatches(hostname, domain))) return false;
  return getEffectiveBlockedDomains(settings).some((domain) => domainMatches(hostname, domain));
}

export function getMatchingBlockedDomain(
  hostnameValue: string,
  settings: BlockingSettings,
): string | null {
  const hostname = normalizeHostname(hostnameValue);
  if (!hostname || settings.excludedDomains.some((domain) => domainMatches(hostname, domain))) {
    return null;
  }

  return (
    getEffectiveBlockedDomains(settings)
      .filter((domain) => domainMatches(hostname, domain))
      .sort((a, b) => b.length - a.length)[0] ?? null
  );
}

export function getDomainCategoryIds(domain: string): CategoryId[] {
  return blockCategories
    .filter((category) =>
      category.domains.some(
        (categoryDomain) =>
          domainMatches(domain, categoryDomain) || domainMatches(categoryDomain, domain),
      ),
    )
    .map((category) => category.id);
}

function normalizeDomainList(domains: readonly string[]): string[] {
  return Array.from(
    new Set(domains.map(normalizeHostname).filter((domain): domain is string => domain !== null)),
  ).sort();
}

export function normalizeKeyword(value: string): string | null {
  const keyword = value.trim().toLowerCase().replace(/\s+/g, " ");
  return keyword.length >= 2 && keyword.length <= 100 ? keyword : null;
}

export function urlMatchesKeyword(urlValue: string, keywordValue: string): boolean {
  const keyword = normalizeMatchText(keywordValue);
  if (!keyword) return false;

  const searchableText = (() => {
    try {
      const url = new URL(urlValue);
      return [
        url.hostname,
        decodeUrlPart(url.pathname),
        ...Array.from(url.searchParams.values()),
        decodeUrlPart(url.hash),
      ].join(" ");
    } catch {
      return decodeUrlPart(urlValue);
    }
  })();

  return ` ${normalizeMatchText(searchableText)} `.includes(` ${keyword} `);
}

export function createKeywordUrlRegex(keywordValue: string): string | null {
  const words = normalizeMatchText(keywordValue).match(/[a-z0-9]+/g);
  if (!words?.length) return null;

  const separator = "(?:%[0-9a-f]{2}|[^a-z0-9])";
  const keywordPattern = words.map(escapeRegex).join(`${separator}+`);
  return `(?:^|${separator})${keywordPattern}(?:$|${separator})`;
}

function normalizeKeywordList(keywords: readonly string[]): string[] {
  return Array.from(
    new Set(
      keywords.map(normalizeKeyword).filter((keyword): keyword is string => keyword !== null),
    ),
  ).sort();
}

function normalizeMatchText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function decodeUrlPart(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeDailyLimits(value: Record<string, string> | undefined): Record<string, string> {
  if (!value) return {};

  return Object.fromEntries(
    Object.entries(value).filter(([, limit]) => {
      if (limit === "none") return true;
      const minutes = Number(limit);
      return Number.isInteger(minutes) && minutes >= 5 && minutes <= 24 * 60;
    }),
  );
}
