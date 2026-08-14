import { getRegistrableDomain } from "@blockade/core";

import { recordBlockedAttempt } from "../lib/analytics-storage";
import { getBlockSettings } from "../lib/block-settings-storage";
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

  browser.runtime.onInstalled.addListener(() => {
    void initializeBlockingSettings().then(() => {
      queueRebuild();
      queueContextMenuSync();
      void ensureUsageCheckpointAlarm();
      void refreshUsageSession();
    });
  });
  browser.runtime.onStartup.addListener(() => {
    queueContextMenuSync();
    void ensureUsageCheckpointAlarm();
    void refreshUsageSession();
  });

  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (changes.blockingSettings || changes.analyticsState || changes.redirectSettings)
      queueRebuild();
    if (changes.blockSettings) queueContextMenuSync();
    if (changes.blockingSettings) void refreshUsageSession();
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
  });

  let lastAttempt = { key: "", timestamp: 0 };
  browser.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId !== 0) return;
    void getBlockedNavigation(details.url).then((blocked) => {
      if (!blocked) return;
      const now = Date.now();
      const key = `${details.tabId}:${details.url}`;
      if (lastAttempt.key === key && now - lastAttempt.timestamp < 2_000) return;
      lastAttempt = { key, timestamp: now };
      void recordBlockedAttempt(blocked);
    });
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
