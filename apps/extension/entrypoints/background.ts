import { recordBlockedAttempt } from "../lib/analytics-storage";
import {
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

export default defineBackground(() => {
  browser.idle.setDetectionInterval(USAGE_IDLE_THRESHOLD_SECONDS);
  let rebuildQueue = Promise.resolve();
  const queueRebuild = () => {
    rebuildQueue = rebuildQueue
      .then(rebuildBlockingRule, rebuildBlockingRule)
      .catch((error: unknown) => {
        console.error("Failed to update Blockade rules", error);
      });
  };

  browser.runtime.onInstalled.addListener(() => {
    void initializeBlockingSettings().then(() => {
      queueRebuild();
      void ensureUsageCheckpointAlarm();
      void refreshUsageSession();
    });
  });
  browser.runtime.onStartup.addListener(() => {
    void ensureUsageCheckpointAlarm();
    void refreshUsageSession();
  });

  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (changes.blockingSettings || changes.analyticsState) queueRebuild();
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

  void ensureUsageCheckpointAlarm();
  queueRebuild();
  void refreshUsageSession();
});
