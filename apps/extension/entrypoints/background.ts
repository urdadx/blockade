import { getLocalDateKey, getNextScheduleBoundary, getRegistrableDomain } from "@blockade/core";

import { recordBlockedAttempt } from "../lib/analytics-storage";
import { getBlockSettings } from "../lib/block-settings-storage";
import { getRedirectSettings } from "../lib/redirect-settings-storage";
import { getScheduleSettings } from "../lib/schedule-settings-storage";
import {
  blockDomain,
  getBlockedNavigation,
  type BlockedNavigation,
  getBlockingSettings,
  initializeBlockingSettings,
  rebuildBlockingRule,
} from "../lib/blocking-storage";
import { createCoalescedTask } from "../lib/coalesced-task";
import {
  ensureUsageCheckpointAlarm,
  refreshUsageSession,
  stopUsageSession,
  USAGE_CHECKPOINT_ALARM,
  USAGE_IDLE_THRESHOLD_SECONDS,
} from "../lib/usage-tracker";

const BLOCK_SITE_MENU_ID = "blockade-block-site";
const BLOCKING_SCHEDULE_ALARM = "blocking-schedule-boundary";
const DAILY_LIMIT_RESET_ALARM = "daily-limit-reset";

export default defineBackground(() => {
  browser.idle.setDetectionInterval(USAGE_IDLE_THRESHOLD_SECONDS);
  const queueRebuild = createCoalescedTask(async () => {
    // DNR only applies to new requests, so tabs already open on a site that just
    // became blocked (a new block, a schedule start, a used-up limit) are moved here.
    if (await rebuildBlockingRule()) await enforceOpenTabs();
  }, "Failed to update Blockade rules");
  const queueContextMenuSync = createCoalescedTask(
    syncContextMenu,
    "Failed to update the Blockade context menu",
  );
  const queueScheduleSync = createCoalescedTask(
    syncScheduleAlarm,
    "Failed to update the Blockade schedule alarm",
  );

  browser.runtime.onInstalled.addListener(() => {
    void initializeBlockingSettings().then(() => {
      void queueRebuild();
      void queueContextMenuSync();
      void queueScheduleSync();
      void syncDailyResetAlarm();
      void ensureUsageCheckpointAlarm();
      void refreshUsageSession();
    });
  });

  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (changes.blockingSettings || changes.redirectSettings) void queueRebuild();
    if (changes.analyticsState) {
      void hasEnforcementThresholdChanged(changes.analyticsState)
        .then((changed) => {
          if (changed) void queueRebuild();
        })
        .catch((error: unknown) => {
          console.error("Failed to evaluate Blockade usage limits", error);
        });
    }
    if (changes.blockSettings) void queueContextMenuSync();
    if (changes.scheduleSettings) {
      void queueRebuild();
      void queueScheduleSync();
    }
    if (changes.blockingSettings || changes.scheduleSettings) void refreshUsageSession();
  });

  browser.tabs.onActivated.addListener(() => void refreshUsageSession());
  browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    // Background tabs loading don't change what the user is looking at.
    if (tab.active && (changeInfo.url || changeInfo.status === "complete")) {
      void refreshUsageSession();
    }
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
    if (alarm.name === USAGE_CHECKPOINT_ALARM) void refreshUsageSession(alarm.scheduledTime);
    if (alarm.name === BLOCKING_SCHEDULE_ALARM) {
      void queueRebuild();
      void queueScheduleSync();
      void refreshUsageSession(alarm.scheduledTime);
    }
    if (alarm.name === DAILY_LIMIT_RESET_ALARM) {
      void queueRebuild();
      void refreshUsageSession(alarm.scheduledTime);
      void syncDailyResetAlarm();
    }
  });

  const recentAttempts = new Map<string, number>();
  const recordAttempt = (tabId: number, url: string, blocked: BlockedNavigation) => {
    const now = Date.now();
    const key = `${tabId}:${url}`;
    if (now - (recentAttempts.get(key) ?? 0) < 2_000) return;
    recentAttempts.set(key, now);
    pruneRecentAttempts(recentAttempts, now);
    void recordBlockedAttempt({ ...blocked, timestamp: now }).catch((error: unknown) => {
      console.error("Failed to record a blocked attempt", error);
    });
  };

  /** Where a navigation to `url` should go instead, or null if it isn't blocked. */
  const getBlockedRedirectUrl = async (tabId: number, url: string, { record = true } = {}) => {
    const blocked = await getBlockedNavigation(url);
    if (!blocked) return null;
    if (record) recordAttempt(tabId, url, blocked);

    const redirectSettings = await getRedirectSettings();
    return {
      baseUrl: blocked.blockedByKeywordOnly ? new URL(url).origin : null,
      redirectUrl: redirectSettings.customRedirectUrl || browser.runtime.getURL("/redirect.html"),
      enforcedByRules: blocked.enforcedByRules,
    };
  };

  const replaceTabNavigation = async (
    tabId: number,
    sourceUrl: string,
    redirectUrl: string,
    baseUrl: string | null,
  ) => {
    try {
      const response = (await browser.tabs.sendMessage(tabId, {
        type: "blockade:replace-navigation",
        baseUrl,
        sourceUrl,
        redirectUrl,
      })) as { replacing?: boolean } | undefined;
      if (response?.replacing) return;
    } catch {
      // Existing tabs do not receive a newly installed content script until they reload.
    }
    await browser.tabs.update(tabId, { url: redirectUrl });
  };

  const handleBlockedNavigation = async (
    details: { frameId: number; tabId: number; url: string },
    stage: "before-load" | "in-page",
  ) => {
    if (details.frameId !== 0) return;
    const redirect = await getBlockedRedirectUrl(details.tabId, details.url);
    if (!redirect || details.url === redirect.redirectUrl) return;

    if (stage === "in-page") {
      // History and fragment changes never reach the network, so DNR can't see them.
      await replaceTabNavigation(
        details.tabId,
        details.url,
        redirect.redirectUrl,
        redirect.baseUrl,
      );
    } else if (!redirect.enforcedByRules) {
      // No rule covers this one (a keyword whose regex DNR rejected): replace the
      // navigation before it loads. It hasn't committed, so there's no history to fix.
      await browser.tabs.update(details.tabId, { url: redirect.redirectUrl });
    }
  };

  // Redirects open tabs the current rules block. Not counted as blocked attempts:
  // the user didn't try to open these, the rules changed under them.
  const enforceOpenTabs = async () => {
    const tabs = await browser.tabs.query({ url: ["http://*/*", "https://*/*"] });
    await Promise.all(
      tabs.map(async (tab) => {
        // Discarded tabs reload through the new rules when they're next opened.
        if (tab.id === undefined || !tab.url || tab.discarded) return;
        const redirect = await getBlockedRedirectUrl(tab.id, tab.url, { record: false });
        if (redirect && tab.url !== redirect.redirectUrl) {
          await replaceTabNavigation(tab.id, tab.url, redirect.redirectUrl, redirect.baseUrl);
        }
      }),
    );
  };

  browser.runtime.onMessage.addListener((message: unknown, sender) => {
    const value = message as { type?: string; url?: unknown };
    if (
      value.type !== "blockade:check-navigation" ||
      typeof value.url !== "string" ||
      sender.tab?.id === undefined
    ) {
      return;
    }
    return getBlockedRedirectUrl(sender.tab.id, value.url).then(
      (redirect) =>
        redirect ?? {
          baseUrl: null,
          redirectUrl: null,
        },
    );
  });

  // Only web pages can be blocked; the filter keeps chrome:// and extension pages
  // from waking the service worker.
  const webPages = { url: [{ schemes: ["http", "https"] }] };
  browser.webNavigation.onBeforeNavigate.addListener((details) => {
    void handleBlockedNavigation(details, "before-load").catch((error: unknown) => {
      console.error("Failed to check a navigation", error);
    });
  }, webPages);
  browser.webNavigation.onHistoryStateUpdated.addListener((details) => {
    void handleBlockedNavigation(details, "in-page").catch((error: unknown) => {
      console.error("Failed to block a history-state navigation", error);
    });
  }, webPages);
  browser.webNavigation.onReferenceFragmentUpdated.addListener((details) => {
    void handleBlockedNavigation(details, "in-page").catch((error: unknown) => {
      console.error("Failed to block a fragment navigation", error);
    });
  }, webPages);
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== BLOCK_SITE_MENU_ID) return;
    const domain = getRegistrableDomain(info.pageUrl ?? tab?.url ?? "");
    if (!domain) return;

    // The storage change rebuilds the rules, which also redirects this tab.
    void blockDomain(domain).catch((error: unknown) => {
      console.error("Failed to block a website from the context menu", error);
    });
  });

  void ensureUsageCheckpointAlarm();
  void queueRebuild();
  void queueContextMenuSync();
  void queueScheduleSync();
  void syncDailyResetAlarm();
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

async function syncDailyResetAlarm() {
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0);
  await browser.alarms.create(DAILY_LIMIT_RESET_ALARM, { when: nextMidnight.getTime() });
}

async function hasEnforcementThresholdChanged(
  change: Browser.storage.StorageChange,
): Promise<boolean> {
  const settings = await getBlockingSettings();
  const date = getLocalDateKey();
  const getUsage = (value: unknown) => {
    if (!value || typeof value !== "object") return {};
    const days = (value as { days?: unknown }).days;
    if (!days || typeof days !== "object") return {};
    const day = (days as Record<string, unknown>)[date];
    if (!day || typeof day !== "object") return {};
    const usage = (day as { usageMsByItem?: unknown }).usageMsByItem;
    return usage && typeof usage === "object" ? (usage as Record<string, unknown>) : {};
  };
  const previousUsage = getUsage(change.oldValue);
  const nextUsage = getUsage(change.newValue);
  return Object.entries(settings.dailyLimits).some(([itemId, limit]) => {
    if (limit === "none") return false;
    const threshold = Number(limit) * 60_000;
    const previous = typeof previousUsage[itemId] === "number" ? previousUsage[itemId] : 0;
    const next = typeof nextUsage[itemId] === "number" ? nextUsage[itemId] : 0;
    return previous >= threshold !== next >= threshold;
  });
}

function pruneRecentAttempts(attempts: Map<string, number>, now: number): void {
  if (attempts.size <= 256) return;
  for (const [key, timestamp] of attempts) {
    if (now - timestamp >= 2_000 || attempts.size > 256) attempts.delete(key);
  }
}
