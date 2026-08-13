import {
  defaultAnalyticsState,
  emptyDailyAnalytics,
  getLocalDateKey,
  sanitizeAnalyticsState,
  type AnalyticsState,
  type UsageSession,
} from "@blockade/core";
import { browser } from "wxt/browser";

const STORAGE_KEY = "analyticsState";
const RETENTION_DAYS = 90;
const MAX_SESSION_MS = 2 * 60 * 1000;
let updateQueue = Promise.resolve();

export async function getAnalyticsState(): Promise<AnalyticsState> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  const value = stored[STORAGE_KEY];
  if (!value || typeof value !== "object") return structuredClone(defaultAnalyticsState);
  return sanitizeAnalyticsState(value as Partial<AnalyticsState>);
}

export async function updateAnalyticsState(
  update: (current: AnalyticsState) => AnalyticsState,
): Promise<AnalyticsState> {
  const operation = updateQueue.then(async () => {
    const next = sanitizeAnalyticsState(pruneHistory(update(await getAnalyticsState())));
    await browser.storage.local.set({ [STORAGE_KEY]: next });
    return next;
  });
  updateQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export async function checkpointUsage(nextSession: UsageSession | null, timestamp = Date.now()) {
  return updateAnalyticsState((current) => {
    const next = structuredClone(current);
    next.days[getLocalDateKey(timestamp)] ??= emptyDailyAnalytics();
    const session = next.activeSession;
    if (session) {
      const elapsedMs = Math.min(MAX_SESSION_MS, Math.max(0, timestamp - session.checkpointAt));
      const date = getLocalDateKey(session.checkpointAt);
      const day = (next.days[date] ??= emptyDailyAnalytics());
      day.usageMsByWebsite[session.hostname] =
        (day.usageMsByWebsite[session.hostname] ?? 0) + elapsedMs;
      for (const itemId of session.itemIds) {
        day.usageMsByItem[itemId] = (day.usageMsByItem[itemId] ?? 0) + elapsedMs;
      }
    }
    next.activeSession = nextSession ? { ...nextSession, checkpointAt: timestamp } : null;
    return next;
  });
}

export async function recordBlockedAttempt({
  hostname,
  categoryIds,
}: {
  hostname: string;
  categoryIds: string[];
}) {
  return updateAnalyticsState((current) => {
    const next = structuredClone(current);
    const day = (next.days[getLocalDateKey()] ??= emptyDailyAnalytics());
    day.blockedAttempts += 1;
    day.blockedAttemptsByWebsite[hostname] = (day.blockedAttemptsByWebsite[hostname] ?? 0) + 1;
    for (const categoryId of categoryIds) {
      day.blockedAttemptsByCategory[categoryId] =
        (day.blockedAttemptsByCategory[categoryId] ?? 0) + 1;
    }
    return next;
  });
}

export function subscribeToAnalyticsState(listener: (state: AnalyticsState) => void) {
  const onChanged = (changes: Record<string, Browser.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]?.newValue) return;
    listener(sanitizeAnalyticsState(changes[STORAGE_KEY].newValue as Partial<AnalyticsState>));
  };
  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
}

function pruneHistory(state: AnalyticsState): AnalyticsState {
  const oldest = new Date();
  oldest.setHours(0, 0, 0, 0);
  oldest.setDate(oldest.getDate() - (RETENTION_DAYS - 1));
  const oldestKey = getLocalDateKey(oldest.getTime());
  return {
    ...state,
    days: Object.fromEntries(Object.entries(state.days).filter(([date]) => date >= oldestKey)),
  };
}
