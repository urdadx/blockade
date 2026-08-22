import {
  domainMatches,
  getDomainCategoryIds,
  normalizeHostname,
  isHostnameExcluded,
  isBlockingScheduleActive,
  isAlwaysBlockedCategory,
  type BlockingSchedule,
  type BlockingSettings,
  type UsageSession,
} from "@blockade/core";
import { browser } from "wxt/browser";

import { checkpointUsage } from "./analytics-storage";
import { getBlockingSettings } from "./blocking-storage";
import { getScheduleSettings } from "./schedule-settings-storage";

export const USAGE_CHECKPOINT_ALARM = "usage-checkpoint";
export const USAGE_IDLE_THRESHOLD_SECONDS = 5 * 60;
let transitionQueue = Promise.resolve();

export function refreshUsageSession(timestamp = Date.now()) {
  return queueTransition(timestamp, async () => {
    const [idleState, focusedWindow, settings, schedule] = await Promise.all([
      browser.idle.queryState(USAGE_IDLE_THRESHOLD_SECONDS),
      browser.windows.getLastFocused({ populate: true, windowTypes: ["normal"] }),
      getBlockingSettings(),
      getScheduleSettings(),
    ]);
    const activeTab = focusedWindow.focused
      ? focusedWindow.tabs?.find((tab) => tab.active)
      : undefined;
    return idleState === "active" && activeTab?.url
      ? createUsageSession(activeTab.url, settings, schedule, timestamp)
      : null;
  });
}

export function stopUsageSession() {
  return queueTransition(Date.now(), () => null);
}

export async function ensureUsageCheckpointAlarm() {
  if (await browser.alarms.get(USAGE_CHECKPOINT_ALARM)) return;
  await browser.alarms.create(USAGE_CHECKPOINT_ALARM, { periodInMinutes: 1 });
}

function createUsageSession(
  urlValue: string,
  settings: BlockingSettings,
  schedule: BlockingSchedule,
  timestamp: number,
): UsageSession | null {
  if (!isBlockingScheduleActive(schedule, timestamp)) return null;
  const hostname = normalizeHostname(urlValue);
  if (!hostname || isHostnameExcluded(hostname, settings)) {
    return null;
  }

  const itemIds = new Set<string>();
  for (const domain of settings.customBlockedDomains) {
    const itemId = `website:${domain}`;
    if (isFiniteLimit(settings.dailyLimits[itemId]) && domainMatches(hostname, domain)) {
      itemIds.add(itemId);
    }
  }
  for (const categoryId of getDomainCategoryIds(hostname)) {
    const itemId = `category:${categoryId}`;
    if (
      !isAlwaysBlockedCategory(categoryId) &&
      settings.enabledCategoryIds.includes(categoryId) &&
      isFiniteLimit(settings.dailyLimits[itemId])
    ) {
      itemIds.add(itemId);
    }
  }

  const tracksFocus = schedule.enabled;
  return itemIds.size > 0 || tracksFocus
    ? { hostname, itemIds: Array.from(itemIds), tracksFocus, checkpointAt: timestamp }
    : null;
}

function isFiniteLimit(value: string | undefined): boolean {
  return value !== undefined && value !== "none";
}

function queueTransition(
  timestamp: number,
  getNextSession: (timestamp: number) => Promise<UsageSession | null> | UsageSession | null,
) {
  const operation = transitionQueue.then(async () => {
    await checkpointUsage(await getNextSession(timestamp), timestamp);
  });
  transitionQueue = operation.catch(() => undefined);
  return operation;
}
