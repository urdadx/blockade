import {
  defaultBlockingSettings,
  createKeywordUrlRegex,
  defaultAdultKeywordDomains,
  domainMatches,
  getDomainCategoryIds,
  getMatchingUrlKeyword,
  getMatchingBlockedDomains,
  isHostnameExcluded,
  isBlockingScheduleActive,
  isAlwaysBlockedCategory,
  isDefaultAdultKeyword,
  getCategoryDomains,
  getEffectiveBlockedDomains,
  normalizeKeyword,
  normalizeWebsiteDomain,
  sanitizeBlockingSettings,
  type BlockingSettings,
  type CategoryId,
} from "@blockade/core";
import { browser } from "wxt/browser";

import { getDailyAnalytics } from "./analytics-storage";
import { getRedirectSettings } from "./redirect-settings-storage";
import { getScheduleSettings } from "./schedule-settings-storage";

const STORAGE_KEY = "blockingSettings";
const BLOCKING_LOCK_NAME = "blockade:blocking-settings";
const DOMAIN_RULE_ID = 1;
const MAXIMUM_KEYWORD_RULES = 900;
const LAST_BLOCKING_RULE_ID = DOMAIN_RULE_ID + MAXIMUM_KEYWORD_RULES;
const regexSupportCache = new Map<string, boolean>();
let updateQueue = Promise.resolve();

export async function getBlockingSettings(): Promise<BlockingSettings> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  const value = stored[STORAGE_KEY];
  if (!value || typeof value !== "object") return structuredClone(defaultBlockingSettings);
  return sanitizeBlockingSettings(value as Partial<BlockingSettings>);
}

export async function updateBlockingSettings(
  update: (current: BlockingSettings) => BlockingSettings,
): Promise<BlockingSettings> {
  const operation = updateQueue.then(() =>
    withBlockingSettingsLock(async () => {
      const current = await getBlockingSettings();
      const updated = update(current);
      if (updated === current) return current;

      const next = sanitizeBlockingSettings(updated);
      await browser.storage.local.set({ [STORAGE_KEY]: next });
      return next;
    }),
  );
  updateQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export async function initializeBlockingSettings(): Promise<BlockingSettings> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  if (stored[STORAGE_KEY]) return getBlockingSettings();

  const settings = structuredClone(defaultBlockingSettings);
  await browser.storage.local.set({ [STORAGE_KEY]: settings });
  return settings;
}

export async function setCategoryEnabled(categoryId: CategoryId, enabled: boolean) {
  return updateBlockingSettings((current) => {
    if (
      (!enabled && isAlwaysBlockedCategory(categoryId)) ||
      current.enabledCategoryIds.includes(categoryId) === enabled
    ) {
      return current;
    }

    return {
      ...current,
      enabledCategoryIds: enabled
        ? [...current.enabledCategoryIds, categoryId]
        : current.enabledCategoryIds.filter((id) => id !== categoryId),
      dailyLimits: enabled
        ? current.dailyLimits
        : omitRecordKey(current.dailyLimits, `category:${categoryId}`),
    };
  });
}

export async function blockDomain(domain: string) {
  const normalizedDomain = normalizeWebsiteDomain(domain);
  if (!normalizedDomain) return getBlockingSettings();

  return updateBlockingSettings((current) => {
    const isBlockedByCategory = getCategoryDomains(current).some((categoryDomain) =>
      domainMatches(normalizedDomain, categoryDomain),
    );
    const isBlockedByCustomDomain = current.customBlockedDomains.some((item) =>
      domainMatches(normalizedDomain, item),
    );
    if (
      (isBlockedByCategory || isBlockedByCustomDomain) &&
      !current.excludedDomains.some((item) => domainMatches(normalizedDomain, item))
    ) {
      return current;
    }

    return {
      ...current,
      excludedDomains: current.excludedDomains.filter(
        (item) => !domainMatches(normalizedDomain, item),
      ),
      customBlockedDomains:
        isBlockedByCategory || isBlockedByCustomDomain
          ? current.customBlockedDomains
          : [...current.customBlockedDomains, normalizedDomain],
    };
  });
}

export async function unblockDomain(domain: string) {
  const normalizedDomain = normalizeWebsiteDomain(domain);
  if (!normalizedDomain) return getBlockingSettings();

  return updateBlockingSettings((current) => {
    const isBlockedByCategory = getCategoryDomains(current).some((categoryDomain) =>
      domainMatches(normalizedDomain, categoryDomain),
    );
    const remainingCustomDomains = current.customBlockedDomains.filter(
      (item) => item !== normalizedDomain,
    );
    const remainsBlockedByCustomDomain = remainingCustomDomains.some((item) =>
      domainMatches(normalizedDomain, item),
    );
    const removesCustomDomain =
      remainingCustomDomains.length !== current.customBlockedDomains.length;
    if (!isBlockedByCategory && !remainsBlockedByCustomDomain && !removesCustomDomain)
      return current;

    return {
      ...current,
      excludedDomains:
        isBlockedByCategory || remainsBlockedByCustomDomain
          ? [...current.excludedDomains, normalizedDomain]
          : current.excludedDomains,
      customBlockedDomains: remainingCustomDomains,
      dailyLimits: omitRecordKey(current.dailyLimits, `website:${normalizedDomain}`),
    };
  });
}

export async function restoreDomain(domain: string) {
  const normalizedDomain = normalizeWebsiteDomain(domain);
  if (!normalizedDomain) return getBlockingSettings();

  return updateBlockingSettings((current) => {
    if (!current.excludedDomains.includes(normalizedDomain)) return current;
    return {
      ...current,
      excludedDomains: current.excludedDomains.filter((item) => item !== normalizedDomain),
    };
  });
}

export async function blockKeyword(keyword: string) {
  const normalizedKeyword = normalizeKeyword(keyword);
  if (!normalizedKeyword) return getBlockingSettings();

  return updateBlockingSettings((current) => {
    if (current.blockedKeywords.includes(normalizedKeyword)) return current;
    return {
      ...current,
      blockedKeywords: [...current.blockedKeywords, normalizedKeyword],
    };
  });
}

export async function unblockKeyword(keyword: string) {
  const normalizedKeyword = normalizeKeyword(keyword);
  if (!normalizedKeyword) return getBlockingSettings();

  return updateBlockingSettings((current) => {
    if (!current.blockedKeywords.includes(normalizedKeyword)) return current;
    return {
      ...current,
      blockedKeywords: current.blockedKeywords.filter((item) => item !== normalizedKeyword),
    };
  });
}

export async function setDailyLimit(itemId: string, dailyLimit: string) {
  const minutes = Number(dailyLimit);
  if (dailyLimit !== "none" && (!Number.isInteger(minutes) || minutes < 5 || minutes > 24 * 60)) {
    return getBlockingSettings();
  }

  return updateBlockingSettings((current) => {
    const isConfiguredItem = itemId.startsWith("category:")
      ? current.enabledCategoryIds.some((id) => itemId === `category:${id}`)
      : current.customBlockedDomains.some((domain) => itemId === `website:${domain}`);
    if (!isConfiguredItem || current.dailyLimits[itemId] === dailyLimit) return current;

    return {
      ...current,
      dailyLimits: {
        ...current.dailyLimits,
        [itemId]: dailyLimit,
      },
    };
  });
}

export function subscribeToBlockingSettings(listener: (settings: BlockingSettings) => void) {
  const onChanged = (changes: Record<string, Browser.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local" || !(STORAGE_KEY in changes)) return;
    listener(sanitizeBlockingSettings(changes[STORAGE_KEY]?.newValue ?? defaultBlockingSettings));
  };

  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
}

export async function rebuildBlockingRule() {
  const [settings, analytics, redirectSettings, schedule] = await Promise.all([
    getBlockingSettings(),
    getDailyAnalytics(),
    getRedirectSettings(),
    getScheduleSettings(),
  ]);
  const scheduleActive = isBlockingScheduleActive(schedule);
  const usage = analytics.usageMsByItem;
  const requestDomains = scheduleActive
    ? getEffectiveBlockedDomains(settings).filter((domain) =>
        isDomainEnforced(domain, settings, usage),
      )
    : [];
  const customRedirectHostname = getHostname(redirectSettings.customRedirectUrl);
  const excludedRequestDomains = [
    ...new Set([
      ...settings.excludedDomains,
      ...(customRedirectHostname ? [customRedirectHostname] : []),
    ]),
  ];
  const redirect = redirectSettings.customRedirectUrl
    ? { url: redirectSettings.customRedirectUrl }
    : { extensionPath: "/redirect.html" };
  const keywordRegexes = await getSupportedKeywordRegexes(
    scheduleActive ? settings.blockedKeywords : [],
  );
  const dynamicRules = await browser.declarativeNetRequest.getDynamicRules();
  const managedRules = dynamicRules.filter(
    (rule) => rule.id >= DOMAIN_RULE_ID && rule.id <= LAST_BLOCKING_RULE_ID,
  );
  const rules: Browser.declarativeNetRequest.Rule[] = [
    ...(requestDomains.length === 0
      ? []
      : [
          {
            id: DOMAIN_RULE_ID,
            priority: 1,
            action: {
              type: "redirect" as const,
              redirect,
            },
            condition: {
              requestDomains,
              excludedRequestDomains,
              resourceTypes: ["main_frame" as const],
            },
          },
        ]),
    ...keywordRegexes.map(({ keyword, regexFilter }, index) => ({
      id: DOMAIN_RULE_ID + index + 1,
      priority: 1,
      action: {
        type: "redirect" as const,
        redirect,
      },
      condition: {
        regexFilter,
        isUrlFilterCaseSensitive: false,
        excludedRequestDomains,
        ...(isDefaultAdultKeyword(keyword)
          ? { requestDomains: [...defaultAdultKeywordDomains] }
          : {}),
        resourceTypes: ["main_frame" as const],
      },
    })),
  ];

  if (JSON.stringify(managedRules) === JSON.stringify(rules)) return;

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: managedRules.map((rule) => rule.id),
    addRules: rules,
  });
}

function getHostname(value: string) {
  try {
    return value ? new URL(value).hostname : null;
  } catch {
    return null;
  }
}

export async function getBlockedNavigation(url: string) {
  const hostname = (() => {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return null;
    }
  })();
  if (!hostname) return null;

  const [settings, analytics, schedule, redirectSettings] = await Promise.all([
    getBlockingSettings(),
    getDailyAnalytics(),
    getScheduleSettings(),
    getRedirectSettings(),
  ]);
  if (!isBlockingScheduleActive(schedule)) return null;
  const redirectHostname = getHostname(redirectSettings.customRedirectUrl);
  if (
    isHostnameExcluded(hostname, settings) ||
    (redirectHostname && domainMatches(hostname, redirectHostname))
  ) {
    return null;
  }

  const usage = analytics.usageMsByItem;
  let domain: string | null = null;
  let matchedCategoryIds: CategoryId[] = [];
  for (const candidate of getMatchingBlockedDomains(hostname, settings)) {
    const enforcement = getDomainEnforcement(candidate, settings, usage);
    if (!enforcement.enforced) continue;
    domain = candidate;
    matchedCategoryIds = enforcement.matchedCategoryIds;
    break;
  }
  const isDefaultKeywordDomain = defaultAdultKeywordDomains.some((candidate) =>
    domainMatches(hostname, candidate),
  );
  const keyword = getMatchingUrlKeyword(
    url,
    isDefaultKeywordDomain
      ? settings.blockedKeywords
      : settings.blockedKeywords.filter((item) => !isDefaultAdultKeyword(item)),
  );
  if (!domain && !keyword) return null;

  const categoryIds = matchedCategoryIds.length
    ? matchedCategoryIds
    : getEnabledCategoryIds(hostname, settings);

  return {
    hostname,
    blockedByKeywordOnly: Boolean(keyword && !domain),
    categoryIds,
  };
}

function getEnabledCategoryIds(domain: string, settings: BlockingSettings): CategoryId[] {
  return getDomainCategoryIds(domain).filter((id) => settings.enabledCategoryIds.includes(id));
}

function isDomainEnforced(
  domain: string,
  settings: BlockingSettings,
  usageMsByItem: Record<string, number>,
): boolean {
  return getDomainEnforcement(domain, settings, usageMsByItem).enforced;
}

function getDomainEnforcement(
  domain: string,
  settings: BlockingSettings,
  usageMsByItem: Record<string, number>,
) {
  const matchedCategoryIds = getEnabledCategoryIds(domain, settings);
  const enforcingCategoryIds = matchedCategoryIds.filter(
    (id) =>
      isAlwaysBlockedCategory(id) || isItemEnforced(`category:${id}`, settings, usageMsByItem),
  );
  const websiteEnforced =
    settings.customBlockedDomains.includes(domain) &&
    isItemEnforced(`website:${domain}`, settings, usageMsByItem);

  return {
    enforced: websiteEnforced || enforcingCategoryIds.length > 0,
    categoryIds: enforcingCategoryIds,
    matchedCategoryIds,
  };
}

function isItemEnforced(
  itemId: string,
  settings: BlockingSettings,
  usageMsByItem: Record<string, number>,
): boolean {
  const limit = settings.dailyLimits[itemId];
  if (!limit || limit === "none") return true;
  return (usageMsByItem[itemId] ?? 0) >= Number(limit) * 60 * 1000;
}

async function getSupportedKeywordRegexes(keywords: readonly string[]) {
  const candidates = keywords.slice(0, MAXIMUM_KEYWORD_RULES).flatMap((keyword) => {
    const regexFilter = createKeywordUrlRegex(keyword);
    return regexFilter ? [{ keyword, regexFilter }] : [];
  });
  const supported = await Promise.all(
    candidates.map(async ({ regexFilter }) => {
      const cached = regexSupportCache.get(regexFilter);
      if (cached !== undefined) return cached;

      const result = await browser.declarativeNetRequest.isRegexSupported({
        regex: regexFilter,
        isCaseSensitive: false,
      });
      regexSupportCache.set(regexFilter, result.isSupported);
      return result.isSupported;
    }),
  );
  return candidates.filter((_, index) => supported[index]);
}

function omitRecordKey(
  record: Readonly<Record<string, string>>,
  omittedKey: string,
): Record<string, string> {
  if (!Object.hasOwn(record, omittedKey)) return record;
  return Object.fromEntries(Object.entries(record).filter(([key]) => key !== omittedKey));
}

function withBlockingSettingsLock<T>(operation: () => Promise<T>): Promise<T> {
  return navigator.locks ? navigator.locks.request(BLOCKING_LOCK_NAME, operation) : operation();
}
