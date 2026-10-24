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
import { defineStorageItem } from "./storage-item";

const DOMAIN_RULE_ID = 1;
const MAXIMUM_KEYWORD_RULES = 900;
const LAST_BLOCKING_RULE_ID = DOMAIN_RULE_ID + MAXIMUM_KEYWORD_RULES;
// Survives service worker restarts but not browser restarts or extension updates,
// which is when the rules should be rewritten anyway.
const APPLIED_RULES_KEY = "appliedBlockingRules";
const regexSupportCache = new Map<string, boolean>();

type AppliedRules = {
  inputs: string;
  ruleIds: number[];
  /** Keywords with no DNR rule (regex unsupported or over the cap), enforced by the background instead. */
  keywordsWithoutRules: string[];
};

// Mirrors the applied rules' keywordsWithoutRules; reloaded from session storage after a restart.
let keywordsWithoutRules: ReadonlySet<string> | null = null;

export const blockingSettingsItem = defineStorageItem({
  key: "blockingSettings",
  sanitize: sanitizeBlockingSettings,
  prepare: sanitizeBlockingSettings,
  // The options page and the background both write these settings.
  lockName: "blockade:blocking-settings",
});

export const getBlockingSettings = blockingSettingsItem.get;
export const updateBlockingSettings = blockingSettingsItem.update;

export async function initializeBlockingSettings(): Promise<BlockingSettings> {
  const { key } = blockingSettingsItem;
  const stored = await browser.storage.local.get(key);
  if (stored[key]) return getBlockingSettings();

  const settings = structuredClone(defaultBlockingSettings);
  await browser.storage.local.set({ [key]: settings });
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

/** Rewrites the redirect rules from the current settings. Resolves to whether they changed. */
export async function rebuildBlockingRule(): Promise<boolean> {
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
  const keywords = scheduleActive ? settings.blockedKeywords : [];

  const inputs = JSON.stringify({ requestDomains, excludedRequestDomains, redirect, keywords });
  const managedRuleIds = (await browser.declarativeNetRequest.getDynamicRules())
    .map((rule) => rule.id)
    .filter((id) => id >= DOMAIN_RULE_ID && id <= LAST_BLOCKING_RULE_ID);
  const applied = await getAppliedRules();
  if (applied?.inputs === inputs && sameIds(applied.ruleIds, managedRuleIds)) {
    keywordsWithoutRules = new Set(applied.keywordsWithoutRules);
    return false;
  }

  const keywordRegexes = await getSupportedKeywordRegexes(keywords);
  const keywordsWithRules = new Set(keywordRegexes.map(({ keyword }) => keyword));
  const missingKeywords = keywords.filter((keyword) => !keywordsWithRules.has(keyword));
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

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: managedRuleIds,
    addRules: rules,
  });
  await browser.storage.session.set({
    [APPLIED_RULES_KEY]: {
      inputs,
      ruleIds: rules.map((rule) => rule.id),
      keywordsWithoutRules: missingKeywords,
    } satisfies AppliedRules,
  });
  keywordsWithoutRules = new Set(missingKeywords);
  return true;
}

async function getAppliedRules() {
  const stored = await browser.storage.session.get(APPLIED_RULES_KEY);
  return stored[APPLIED_RULES_KEY] as AppliedRules | undefined;
}

async function getKeywordsWithoutRules(): Promise<ReadonlySet<string>> {
  // Before the first rebuild nothing is known; assume the rules cover every keyword
  // and let the content script catch a miss, rather than redirect alongside DNR.
  keywordsWithoutRules ??= new Set((await getAppliedRules())?.keywordsWithoutRules);
  return keywordsWithoutRules;
}

function sameIds(a: readonly number[], b: readonly number[]) {
  return a.length === b.length && a.every((id) => b.includes(id));
}

function getHostname(value: string) {
  try {
    return value ? new URL(value).hostname : null;
  } catch {
    return null;
  }
}

export type BlockedNavigation = {
  hostname: string;
  blockedByKeywordOnly: boolean;
  categoryIds: CategoryId[];
  /** Whether a DNR rule already redirects this request, or the background has to. */
  enforcedByRules: boolean;
};

export async function getBlockedNavigation(url: string): Promise<BlockedNavigation | null> {
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
  const keywords = isDefaultKeywordDomain
    ? settings.blockedKeywords
    : settings.blockedKeywords.filter((item) => !isDefaultAdultKeyword(item));
  const keyword = getMatchingUrlKeyword(url, keywords);
  if (!domain && !keyword) return null;

  let enforcedByRules = domain !== null;
  if (!enforcedByRules) {
    const missing = await getKeywordsWithoutRules();
    enforcedByRules =
      getMatchingUrlKeyword(
        url,
        keywords.filter((item) => !missing.has(item)),
      ) !== null;
  }

  const categoryIds = matchedCategoryIds.length
    ? matchedCategoryIds
    : getEnabledCategoryIds(hostname, settings);

  return {
    hostname,
    blockedByKeywordOnly: Boolean(keyword && !domain),
    categoryIds,
    enforcedByRules,
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
