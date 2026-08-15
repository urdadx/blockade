import { getNextScheduleBoundary, getRegistrableDomain } from "@blockade/core";

import { recordBlockedAttempt } from "../lib/analytics-storage";
import { getBlockSettings } from "../lib/block-settings-storage";
import { getRedirectSettings } from "../lib/redirect-settings-storage";
import { getScheduleSettings } from "../lib/schedule-settings-storage";
import {
  blockDomain,
  getBlockedNavigation,
  initializeBlockingSettings,
  rebuildBlockingRule,
} from "../lib/blocking-storage";
import {
  ensureUsageCheckpointAlarm,
  refreshUsageSession,
  stopUsageSession,
  USAGE_CHECKPOINT_ALARM,
  USAGE_IDLE_THRESHOLD_SECONDS,
} from "../lib/usage-tracker";

const BLOCK_SITE_MENU_ID = "blockade-block-site";
const BLOCKING_SCHEDULE_ALARM = "blocking-schedule-boundary";

export default defineBackground(() => {
  browser.idle.setDetectionInterval(USAGE_IDLE_THRESHOLD_SECONDS);
  let rebuildQueue = Promise.resolve();
  const queueRebuild = () => {
    rebuildQueue = rebuildQueue
      .then(rebuildBlockingRule, rebuildBlockingRule)
      .catch((error: unknown) => {
        console.error("Failed to update Blockade rules", error);
      });
    return rebuildQueue;
  };

  let contextMenuQueue = Promise.resolve();
  const queueContextMenuSync = () => {
    contextMenuQueue = contextMenuQueue
      .then(syncContextMenu, syncContextMenu)
      .catch((error: unknown) => {
        console.error("Failed to update the Blockade context menu", error);
      });
  };

  let scheduleQueue = Promise.resolve();
  const queueScheduleSync = () => {
    scheduleQueue = scheduleQueue
      .then(syncScheduleAlarm, syncScheduleAlarm)
      .catch((error: unknown) => {
        console.error("Failed to update the Blockade schedule alarm", error);
      });
  };

  browser.runtime.onInstalled.addListener(() => {
    void initializeBlockingSettings().then(() => {
      queueRebuild();
      queueContextMenuSync();
      queueScheduleSync();
      void ensureUsageCheckpointAlarm();
      void refreshUsageSession();
    });
  });
  browser.runtime.onStartup.addListener(() => {
    queueContextMenuSync();
    queueScheduleSync();
    void ensureUsageCheckpointAlarm();
    void refreshUsageSession();
  });

  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (changes.blockingSettings || changes.analyticsState || changes.redirectSettings)
      queueRebuild();
    if (changes.blockSettings) queueContextMenuSync();
    if (changes.scheduleSettings) {
      queueRebuild();
      queueScheduleSync();
    }
    if (changes.blockingSettings || changes.scheduleSettings) void refreshUsageSession();
  });

  browser.tabs.onActivated.addListener(() => void refreshUsageSession());
  browser.tabs.onUpdated.addListener((_tabId, changeInfo) => {
    if (changeInfo.url || changeInfo.status === "complete") void refreshUsageSession();
  });
  browser.tabs.onRemoved.addListener(() => void refreshUsageSession());
  browser.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === browser.windows.WINDOW_ID_NONE) void stopUsageSession();
    else void refreshUsageSession();
  });
  browser.idle.onStateChanged.addListener((state) => {
    if (state === "active") void refreshUsageSession();
    else void stopUsageSession();
  });
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === USAGE_CHECKPOINT_ALARM) void refreshUsageSession();
    if (alarm.name === BLOCKING_SCHEDULE_ALARM) {
      queueRebuild();
      queueScheduleSync();
      void refreshUsageSession();
    }
  });

  let lastAttempt = { key: "", timestamp: 0 };
  const handleBlockedNavigation = async (
    details: { frameId: number; tabId: number; url: string },
    redirectTab: boolean,
  ) => {
    if (details.frameId !== 0) return;
    const blocked = await getBlockedNavigation(details.url);
    if (!blocked) return;

    const now = Date.now();
    const key = `${details.tabId}:${details.url}`;
    if (lastAttempt.key !== key || now - lastAttempt.timestamp >= 2_000) {
      lastAttempt = { key, timestamp: now };
      await recordBlockedAttempt(blocked);
    }

    if (!redirectTab) return;
    const redirectSettings = await getRedirectSettings();
    const redirectUrl =
      redirectSettings.customRedirectUrl || browser.runtime.getURL("/redirect.html");
    if (details.url !== redirectUrl) {
      await browser.tabs.update(details.tabId, { url: redirectUrl });
    }
  };

  browser.webNavigation.onBeforeNavigate.addListener((details) => {
    void handleBlockedNavigation(details, false);
  });
  browser.webNavigation.onHistoryStateUpdated.addListener((details) => {
    void handleBlockedNavigation(details, true);
  });
  browser.webNavigation.onReferenceFragmentUpdated.addListener((details) => {
    void handleBlockedNavigation(details, true);
  });
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== BLOCK_SITE_MENU_ID) return;
    const domain = getRegistrableDomain(info.pageUrl ?? tab?.url ?? "");
    if (!domain) return;

    void blockDomain(domain).then(async () => {
      await queueRebuild();
      if (tab?.id !== undefined) await browser.tabs.reload(tab.id);
    });
  });

  void ensureUsageCheckpointAlarm();
  queueRebuild();
  queueContextMenuSync();
  queueScheduleSync();
  void refreshUsageSession();
});

async function syncContextMenu() {
  const settings = await getBlockSettings();
  await browser.contextMenus.removeAll();
  if (!settings.showContextMenu) return;

  browser.contextMenus.create({
    id: BLOCK_SITE_MENU_ID,
    title: "Add this website to Blockade",
    contexts: ["all"],
    documentUrlPatterns: ["http://*/*", "https://*/*"],
  });
}

async function syncScheduleAlarm() {
  await browser.alarms.clear(BLOCKING_SCHEDULE_ALARM);
  const boundary = getNextScheduleBoundary(await getScheduleSettings());
  if (boundary) await browser.alarms.create(BLOCKING_SCHEDULE_ALARM, { when: boundary });
}
