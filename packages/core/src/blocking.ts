import { getDomain } from "tldts";

import { blockCategories, categoryIds, type CategoryId } from "./categories";

export type BlockingSettings = {
  version: number;
  enabledCategoryIds: CategoryId[];
  excludedDomains: string[];
  customBlockedDomains: string[];
  blockedKeywords: string[];
  dailyLimits: Record<string, string>;
};

export const blockingSettingsVersion = 3;

export const defaultBlockingSettings: BlockingSettings = {
  version: blockingSettingsVersion,
  enabledCategoryIds: ["adult", "gambling"],
  excludedDomains: [],
  customBlockedDomains: [],
  blockedKeywords: [],
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
    return defaultBlockingSettings.enabledCategoryIds;
  })();
  const enabledCategoryIds = Array.from(
    new Set(configuredCategoryIds.filter((id): id is CategoryId => validCategoryIds.has(id))),
  );

  return {
    version: blockingSettingsVersion,
    enabledCategoryIds,
    excludedDomains: normalizeDomainList(value.excludedDomains ?? []),
    customBlockedDomains: normalizeDomainList(value.customBlockedDomains ?? []),
    blockedKeywords: normalizeKeywordList(value.blockedKeywords ?? []),
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

function normalizeKeywordList(keywords: readonly string[]): string[] {
  return Array.from(
    new Set(
      keywords.map(normalizeKeyword).filter((keyword): keyword is string => keyword !== null),
    ),
  ).sort();
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
