import { getDomain } from "tldts";

import {
  alwaysBlockedCategoryIds,
  blockCategories,
  categoryIds,
  type CategoryId,
} from "./categories";
import { defaultAdultKeywords } from "./default-adult-keywords";

export type BlockingSettings = {
  readonly version: number;
  readonly enabledCategoryIds: readonly CategoryId[];
  readonly excludedDomains: readonly string[];
  readonly customBlockedDomains: readonly string[];
  readonly blockedKeywords: readonly string[];
  readonly dailyLimits: Readonly<Record<string, string>>;
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

type DomainIndex = {
  domains: readonly string[];
  domainSet: ReadonlySet<string>;
};

type SettingsDomainIndexes = {
  enabledCategoryIds?: readonly CategoryId[];
  customBlockedDomains?: readonly string[];
  effective?: DomainIndex;
  excludedDomains?: readonly string[];
  excluded?: DomainIndex;
};

const hostnameCacheSizeLimit = 256;
const domainIndexCacheSizeLimit = 32;
const maximumCachedHostnameLength = 2_048;
const maximumDomainListSize = 10_000;
const maximumBlockedKeywords = 900;
const normalizedHostnameCache = new Map<string, string | null>();
const effectiveDomainIndexCache = new Map<string, DomainIndex>();
const excludedDomainIndexCache = new Map<string, DomainIndex>();
// Identity handles steady-state lookups; bounded content caches reuse equivalent storage snapshots.
const settingsDomainIndexCache = new WeakMap<BlockingSettings, SettingsDomainIndexes>();
const categoryDomainsByMask = new Map<number, readonly string[]>();
const validCategoryIds = new Set<CategoryId>(categoryIds);
const categoryBitById = new Map<CategoryId, number>(
  categoryIds.map((id, index) => [id, 1 << index] as const),
);
const categoryMaskByDomain = new Map<string, number>();

// Category bitmasks turn category classification into suffix lookups instead of full dataset scans.
for (const category of blockCategories) {
  const categoryBit = categoryBitById.get(category.id);
  if (categoryBit === undefined) continue;

  for (const domain of category.domains) {
    addCategoryMask(categoryMaskByDomain, domain, categoryBit);
  }
}

export function normalizeHostname(value: string): string | null {
  const input = value.trim();
  if (!input || input.includes("*")) return null;

  if (input.length <= maximumCachedHostnameLength && normalizedHostnameCache.has(input)) {
    return getCachedValue(normalizedHostnameCache, input);
  }

  const hostname = normalizeHostnameUncached(input);
  if (input.length <= maximumCachedHostnameLength) {
    setCachedValue(normalizedHostnameCache, input, hostname, hostnameCacheSizeLimit);
  }
  return hostname;
}

function normalizeHostnameUncached(input: string): string | null {
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
  if (hostname === domain) return true;
  const boundaryIndex = hostname.length - domain.length - 1;
  return boundaryIndex >= 0 && hostname[boundaryIndex] === "." && hostname.endsWith(domain);
}

export function sanitizeBlockingSettings(value: unknown): BlockingSettings {
  const settings = isRecord(value) ? value : {};
  const version = typeof settings.version === "number" ? settings.version : undefined;
  const configuredIds = Array.isArray(settings.enabledCategoryIds)
    ? settings.enabledCategoryIds
    : undefined;
  const configuredCategoryIds = (() => {
    if (version === blockingSettingsVersion) {
      return configuredIds ?? defaultBlockingSettings.enabledCategoryIds;
    }
    if (version === 2) {
      return [...(configuredIds ?? []), "gambling" as const];
    }
    if (version === 3 || version === 4) {
      return configuredIds ?? defaultBlockingSettings.enabledCategoryIds;
    }
    return defaultBlockingSettings.enabledCategoryIds;
  })();
  const enabledCategoryIds = Array.from(
    new Set([
      ...configuredCategoryIds.filter(
        (id): id is CategoryId => typeof id === "string" && validCategoryIds.has(id as CategoryId),
      ),
      ...alwaysBlockedCategoryIds,
    ]),
  );
  const storedKeywords = Array.isArray(settings.blockedKeywords) ? settings.blockedKeywords : [];
  const configuredKeywords =
    version === blockingSettingsVersion
      ? Array.isArray(settings.blockedKeywords)
        ? storedKeywords
        : defaultBlockingSettings.blockedKeywords
      : [...storedKeywords, ...defaultAdultKeywords];
  const excludedDomains = normalizeDomainList(settings.excludedDomains);
  const customBlockedDomains = normalizeDomainList(settings.customBlockedDomains);
  const blockedKeywords = normalizeKeywordList(configuredKeywords);

  return {
    version: blockingSettingsVersion,
    enabledCategoryIds,
    excludedDomains,
    customBlockedDomains,
    blockedKeywords,
    dailyLimits: normalizeDailyLimits(
      settings.dailyLimits,
      enabledCategoryIds,
      customBlockedDomains,
    ),
  };
}

export function getCategoryDomains(settings: BlockingSettings): string[] {
  return [...getCategoryDomainsByMask(getEnabledCategoryMask(settings.enabledCategoryIds))];
}

export function getEffectiveBlockedDomains(settings: BlockingSettings): string[] {
  return [...getEffectiveDomainIndex(settings).domains];
}

export function isHostnameBlocked(hostnameValue: string, settings: BlockingSettings): boolean {
  const hostname = normalizeHostname(hostnameValue);
  if (!hostname) return false;

  if (findMatchingDomain(hostname, getExcludedDomainIndex(settings).domainSet)) return false;
  return findMatchingDomain(hostname, getEffectiveDomainIndex(settings).domainSet) !== null;
}

export function isHostnameExcluded(hostnameValue: string, settings: BlockingSettings): boolean {
  const hostname = normalizeHostname(hostnameValue);
  return hostname
    ? findMatchingDomain(hostname, getExcludedDomainIndex(settings).domainSet) !== null
    : false;
}

export function getMatchingBlockedDomain(
  hostnameValue: string,
  settings: BlockingSettings,
): string | null {
  const hostname = normalizeHostname(hostnameValue);
  if (!hostname || findMatchingDomain(hostname, getExcludedDomainIndex(settings).domainSet)) {
    return null;
  }

  return findMatchingDomain(hostname, getEffectiveDomainIndex(settings).domainSet);
}

export function getMatchingBlockedDomains(
  hostnameValue: string,
  settings: BlockingSettings,
): string[] {
  const hostname = normalizeHostname(hostnameValue);
  if (!hostname || findMatchingDomain(hostname, getExcludedDomainIndex(settings).domainSet)) {
    return [];
  }

  return findMatchingDomains(hostname, getEffectiveDomainIndex(settings).domainSet);
}

export function getDomainCategoryIds(domain: string): CategoryId[] {
  let categoryMask = 0;
  forEachDomainSuffix(domain, (suffix) => {
    categoryMask |= categoryMaskByDomain.get(suffix) ?? 0;
  });

  return categoryIds.filter((id) => (categoryMask & (categoryBitById.get(id) ?? 0)) !== 0);
}

function getEnabledCategoryMask(enabledCategoryIds: readonly CategoryId[]): number {
  let categoryMask = 0;
  for (const id of enabledCategoryIds) categoryMask |= categoryBitById.get(id) ?? 0;
  return categoryMask;
}

function getCategoryDomainsByMask(categoryMask: number): readonly string[] {
  const cachedDomains = categoryDomainsByMask.get(categoryMask);
  if (cachedDomains) return cachedDomains;

  const domains = new Set<string>();
  for (const category of blockCategories) {
    const categoryBit = categoryBitById.get(category.id) ?? 0;
    if ((categoryMask & categoryBit) === 0) continue;
    for (const domain of category.domains) domains.add(domain);
  }

  const sortedDomains = Array.from(domains).sort();
  categoryDomainsByMask.set(categoryMask, sortedDomains);
  return sortedDomains;
}

function getEffectiveDomainIndex(settings: BlockingSettings): DomainIndex {
  const settingsIndexes = settingsDomainIndexCache.get(settings);
  if (
    settingsIndexes?.enabledCategoryIds === settings.enabledCategoryIds &&
    settingsIndexes.customBlockedDomains === settings.customBlockedDomains &&
    settingsIndexes.effective
  ) {
    return settingsIndexes.effective;
  }

  const categoryMask = getEnabledCategoryMask(settings.enabledCategoryIds);
  const cacheKey = `${categoryMask}:${JSON.stringify(settings.customBlockedDomains)}`;
  const index = getOrCreateDomainIndex(effectiveDomainIndexCache, cacheKey, () => [
    ...getCategoryDomainsByMask(categoryMask),
    ...settings.customBlockedDomains,
  ]);
  settingsDomainIndexCache.set(settings, {
    ...settingsIndexes,
    enabledCategoryIds: settings.enabledCategoryIds,
    customBlockedDomains: settings.customBlockedDomains,
    effective: index,
  });
  return index;
}

function getExcludedDomainIndex(settings: BlockingSettings): DomainIndex {
  const settingsIndexes = settingsDomainIndexCache.get(settings);
  if (settingsIndexes?.excludedDomains === settings.excludedDomains && settingsIndexes.excluded) {
    return settingsIndexes.excluded;
  }

  const cacheKey = JSON.stringify(settings.excludedDomains);
  const index = getOrCreateDomainIndex(
    excludedDomainIndexCache,
    cacheKey,
    () => settings.excludedDomains,
  );
  settingsDomainIndexCache.set(settings, {
    ...settingsIndexes,
    excludedDomains: settings.excludedDomains,
    excluded: index,
  });
  return index;
}

function getOrCreateDomainIndex(
  cache: Map<string, DomainIndex>,
  cacheKey: string,
  getDomains: () => readonly string[],
): DomainIndex {
  if (cache.has(cacheKey)) return getCachedValue(cache, cacheKey);

  const index = createDomainIndex(getDomains());
  setCachedValue(cache, cacheKey, index, domainIndexCacheSizeLimit);
  return index;
}

function createDomainIndex(domains: readonly string[]): DomainIndex {
  const uniqueDomains = Array.from(new Set(domains)).sort();
  return { domains: uniqueDomains, domainSet: new Set(uniqueDomains) };
}

function findMatchingDomain(hostname: string, domains: ReadonlySet<string>): string | null {
  let suffixStart = 0;
  while (suffixStart < hostname.length) {
    const suffix = hostname.slice(suffixStart);
    if (domains.has(suffix)) return suffix;

    const nextDot = hostname.indexOf(".", suffixStart);
    if (nextDot === -1) return null;
    suffixStart = nextDot + 1;
  }
  return null;
}

function findMatchingDomains(hostname: string, domains: ReadonlySet<string>): string[] {
  const matchingDomains: string[] = [];
  forEachDomainSuffix(hostname, (suffix) => {
    if (domains.has(suffix)) matchingDomains.push(suffix);
  });
  return matchingDomains;
}

function forEachDomainSuffix(domain: string, visit: (suffix: string) => void): void {
  let suffixStart = 0;
  while (suffixStart < domain.length) {
    visit(domain.slice(suffixStart));
    const nextDot = domain.indexOf(".", suffixStart);
    if (nextDot === -1) return;
    suffixStart = nextDot + 1;
  }
}

function addCategoryMask(index: Map<string, number>, domain: string, categoryBit: number): void {
  index.set(domain, (index.get(domain) ?? 0) | categoryBit);
}

function getCachedValue<T>(cache: Map<string, T>, key: string): T {
  const value = cache.get(key) as T;
  cache.delete(key);
  cache.set(key, value);
  return value;
}

function setCachedValue<T>(cache: Map<string, T>, key: string, value: T, sizeLimit: number): void {
  cache.set(key, value);
  if (cache.size <= sizeLimit) return;

  const oldestKey = cache.keys().next().value;
  if (oldestKey !== undefined) cache.delete(oldestKey);
}

function normalizeDomainList(value: unknown): string[] {
  const domains = Array.isArray(value) ? value : [];
  return Array.from(
    new Set(
      domains
        .filter((domain): domain is string => typeof domain === "string")
        .map(normalizeHostname)
        .filter((domain): domain is string => domain !== null),
    ),
  )
    .sort()
    .slice(0, maximumDomainListSize);
}

export function normalizeKeyword(value: string): string | null {
  const keyword = value.trim().toLowerCase().replace(/\s+/g, " ");
  return keyword.length >= 2 && keyword.length <= 100 ? keyword : null;
}

export function urlMatchesKeyword(urlValue: string, keywordValue: string): boolean {
  const keyword = normalizeMatchText(keywordValue);
  if (!keyword) return false;

  return containsNormalizedKeyword(getSearchableUrlText(urlValue), keyword);
}

export function getMatchingUrlKeyword(
  urlValue: string,
  keywordValues: readonly string[],
): string | null {
  const searchableText = getSearchableUrlText(urlValue);
  for (const keywordValue of keywordValues) {
    const keyword = normalizeMatchText(keywordValue);
    if (keyword && containsNormalizedKeyword(searchableText, keyword)) return keywordValue;
  }
  return null;
}

function getSearchableUrlText(urlValue: string): string {
  try {
    const url = new URL(urlValue);
    return normalizeMatchText(
      [
        url.hostname,
        decodeUrlPart(url.pathname),
        ...Array.from(url.searchParams.values()),
        decodeUrlPart(url.hash),
      ].join(" "),
    );
  } catch {
    return normalizeMatchText(decodeUrlPart(urlValue));
  }
}

function containsNormalizedKeyword(searchableText: string, keyword: string): boolean {
  return ` ${searchableText} `.includes(` ${keyword} `);
}

export function createKeywordUrlRegex(keywordValue: string): string | null {
  const words = normalizeMatchText(keywordValue).match(/[a-z0-9]+/g);
  if (!words?.length) return null;

  const separator = "(?:%[0-9a-f]{2}|[^a-z0-9])";
  const keywordPattern = words.map(escapeRegex).join(`${separator}+`);
  return `(?:^|${separator})${keywordPattern}(?:$|${separator})`;
}

function normalizeKeywordList(keywords: readonly unknown[]): string[] {
  return Array.from(
    new Set(
      keywords
        .filter((keyword): keyword is string => typeof keyword === "string")
        .map(normalizeKeyword)
        .filter((keyword): keyword is string => keyword !== null),
    ),
  )
    .sort()
    .slice(0, maximumBlockedKeywords);
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

function normalizeDailyLimits(
  value: unknown,
  enabledCategoryIds: readonly CategoryId[],
  customBlockedDomains: readonly string[],
): Record<string, string> {
  if (!isRecord(value)) return {};

  const allowedIds = new Set([
    ...enabledCategoryIds.map((id) => `category:${id}`),
    ...customBlockedDomains.map((domain) => `website:${domain}`),
  ]);
  const limits: Record<string, string> = {};

  for (const [itemId, limit] of Object.entries(value)) {
    if (!allowedIds.has(itemId) || typeof limit !== "string") continue;
    const minutes = Number(limit);
    if (limit === "none" || (Number.isInteger(minutes) && minutes >= 5 && minutes <= 24 * 60)) {
      limits[itemId] = limit;
    }
  }
  return limits;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
