import {
  defaultBlockingSettings,
  domainMatches,
  getDomainCategoryIds,
  getLocalDateKey,
  getCategoryDomains,
  getEffectiveBlockedDomains,
  sanitizeBlockingSettings,
  type BlockingSettings,
  type CategoryId,
} from "@blockade/core";
import { browser } from "wxt/browser";

import { getAnalyticsState } from "./analytics-storage";

const STORAGE_KEY = "blockingSettings";

export async function getBlockingSettings(): Promise<BlockingSettings> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  const value = stored[STORAGE_KEY];
  if (!value || typeof value !== "object") return structuredClone(defaultBlockingSettings);
  return sanitizeBlockingSettings(value as Partial<BlockingSettings>);
}

export async function updateBlockingSettings(
  update: (current: BlockingSettings) => BlockingSettings,
): Promise<BlockingSettings> {
  const next = sanitizeBlockingSettings(update(await getBlockingSettings()));
  await browser.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}

export async function initializeBlockingSettings(): Promise<BlockingSettings> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  if (stored[STORAGE_KEY]) return getBlockingSettings();

  const settings = structuredClone(defaultBlockingSettings);
  await browser.storage.local.set({ [STORAGE_KEY]: settings });
  return settings;
}

export async function setCategoryEnabled(categoryId: CategoryId, enabled: boolean) {
  return updateBlockingSettings((current) => ({
    ...current,
    enabledCategoryIds: enabled
      ? [...current.enabledCategoryIds, categoryId]
      : current.enabledCategoryIds.filter((id) => id !== categoryId),
  }));
}

export async function blockDomain(domain: string) {
  return updateBlockingSettings((current) => {
    const isBlockedByCategory = getCategoryDomains(current).some(
      (categoryDomain) =>
        domainMatches(domain, categoryDomain) || domainMatches(categoryDomain, domain),
    );

    return {
      ...current,
      excludedDomains: current.excludedDomains.filter((item) => item !== domain),
      customBlockedDomains: isBlockedByCategory
        ? current.customBlockedDomains
        : [...current.customBlockedDomains, domain],
    };
  });
}

export async function unblockDomain(domain: string) {
  return updateBlockingSettings((current) => {
    const isBlockedByCategory = getCategoryDomains(current).some(
      (categoryDomain) =>
        domainMatches(domain, categoryDomain) || domainMatches(categoryDomain, domain),
    );

    return {
      ...current,
      excludedDomains: isBlockedByCategory
        ? [...current.excludedDomains, domain]
        : current.excludedDomains,
      customBlockedDomains: current.customBlockedDomains.filter((item) => item !== domain),
    };
  });
}

export async function restoreDomain(domain: string) {
  return updateBlockingSettings((current) => ({
    ...current,
    excludedDomains: current.excludedDomains.filter((item) => item !== domain),
  }));
}

export async function blockKeyword(keyword: string) {
  return updateBlockingSettings((current) => ({
    ...current,
    blockedKeywords: [...current.blockedKeywords, keyword],
  }));
}

export async function unblockKeyword(keyword: string) {
  return updateBlockingSettings((current) => ({
    ...current,
    blockedKeywords: current.blockedKeywords.filter((item) => item !== keyword),
  }));
}

export async function setDailyLimit(itemId: string, dailyLimit: string) {
  return updateBlockingSettings((current) => ({
    ...current,
    dailyLimits: {
      ...current.dailyLimits,
      [itemId]: dailyLimit,
    },
  }));
}

export function subscribeToBlockingSettings(listener: (settings: BlockingSettings) => void) {
  const onChanged = (changes: Record<string, Browser.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]?.newValue) return;
    listener(sanitizeBlockingSettings(changes[STORAGE_KEY].newValue as Partial<BlockingSettings>));
  };

  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
}

export async function rebuildBlockingRule() {
  const [settings, analytics] = await Promise.all([getBlockingSettings(), getAnalyticsState()]);
  const usage = analytics.days[getLocalDateKey()]?.usageMsByItem ?? {};
  const requestDomains = getEffectiveBlockedDomains(settings).filter((domain) =>
    isDomainEnforced(domain, settings, usage),
  );
  const excludedRequestDomains = settings.excludedDomains;
  const ruleId = 1;
  const managedRuleIds = (await browser.declarativeNetRequest.getDynamicRules()).map(
    (rule) => rule.id,
  );
  const rules: Browser.declarativeNetRequest.Rule[] = [
    ...(requestDomains.length === 0
      ? []
      : [
          {
            id: ruleId,
            priority: 1,
            action: {
              type: "redirect" as const,
              redirect: { extensionPath: "/redirect.html" },
            },
            condition: {
              requestDomains,
              excludedRequestDomains,
              resourceTypes: ["main_frame" as const],
            },
          },
        ]),
    ...settings.blockedKeywords.map((keyword, index) => ({
      id: index + 2,
      priority: 1,
      action: {
        type: "redirect" as const,
        redirect: { extensionPath: "/redirect.html" },
      },
      condition: {
        urlFilter: keyword,
        isUrlFilterCaseSensitive: false,
        resourceTypes: ["main_frame" as const],
      },
    })),
  ];

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: managedRuleIds,
    addRules: rules,
  });
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

  const [settings, analytics] = await Promise.all([getBlockingSettings(), getAnalyticsState()]);
  if (settings.excludedDomains.some((domain) => domainMatches(hostname, domain))) return null;
  const usage = analytics.days[getLocalDateKey()]?.usageMsByItem ?? {};
  const domain = getEffectiveBlockedDomains(settings).find(
    (candidate) =>
      domainMatches(hostname, candidate) && isDomainEnforced(candidate, settings, usage),
  );
  const keyword = settings.blockedKeywords.find((item) => url.toLowerCase().includes(item));
  if (!domain && !keyword) return null;

  return {
    hostname,
    categoryIds: getDomainCategoryIds(hostname).filter((id) =>
      settings.enabledCategoryIds.includes(id),
    ),
  };
}

function isDomainEnforced(
  domain: string,
  settings: BlockingSettings,
  usageMsByItem: Record<string, number>,
): boolean {
  const applicableIds = [
    ...(settings.customBlockedDomains.some((item) => domainMatches(domain, item))
      ? [`website:${domain}`]
      : []),
    ...getDomainCategoryIds(domain)
      .filter((id) => settings.enabledCategoryIds.includes(id))
      .map((id) => `category:${id}`),
  ];

  return applicableIds.some((itemId) => {
    const limit = settings.dailyLimits[itemId];
    if (!limit || limit === "none") return true;
    return (usageMsByItem[itemId] ?? 0) >= Number(limit) * 60 * 1000;
  });
}
