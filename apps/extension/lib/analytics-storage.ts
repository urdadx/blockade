import {
  defaultAnalyticsState,
  emptyDailyAnalytics,
  getLocalDateKey,
  sanitizeDailyAnalytics,
  sanitizeAnalyticsState,
  type AnalyticsState,
  type DailyAnalytics,
  type UsageSession,
} from "@blockade/core";
import { browser } from "wxt/browser";

const STORAGE_KEY = "analyticsState";
const RETENTION_DAYS = 90;
const MAX_CONFIRMED_SESSION_GAP_MS = 6 * 60 * 1000;
let updateQueue = Promise.resolve();

export async function getAnalyticsState(): Promise<AnalyticsState> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  const value = stored[STORAGE_KEY];
  return pruneHistory(sanitizeAnalyticsState(value ?? defaultAnalyticsState));
}

export async function getDailyAnalytics(date = getLocalDateKey()): Promise<DailyAnalytics> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  const value = stored[STORAGE_KEY];
  if (!value || typeof value !== "object") return emptyDailyAnalytics();
  const days = (value as { days?: unknown }).days;
  if (!days || typeof days !== "object") return emptyDailyAnalytics();
  return sanitizeDailyAnalytics((days as Record<string, unknown>)[date]);
}

async function updateAnalyticsState(
  update: (current: AnalyticsState) => AnalyticsState,
): Promise<AnalyticsState> {
  const operation = updateQueue.then(async () => {
    const current = await getAnalyticsState();
    const updated = update(current);
    if (updated === current) return current;

    const next = pruneHistory(updated);
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
    if (!current.activeSession && !nextSession) return current;

    const checkpointAt = sanitizeEventTimestamp(timestamp);
    const next: AnalyticsState = {
      ...current,
      days: { ...current.days },
      activeSession: nextSession ? { ...nextSession, checkpointAt } : null,
    };
    const session = current.activeSession;
    if (!session) return next;

    const elapsedMs = checkpointAt - session.checkpointAt;
    if (elapsedMs <= 0 || elapsedMs > MAX_CONFIRMED_SESSION_GAP_MS) return next;

    const itemIds = Array.from(new Set(session.itemIds));
    for (const segment of splitIntervalByLocalDay(session.checkpointAt, checkpointAt)) {
      const day = getMutableDay(next.days, segment.date);
      if (session.tracksFocus) {
        day.scheduledFocusMs = addCount(day.scheduledFocusMs, segment.durationMs);
      }
      if (itemIds.length > 0) {
        addToCountMap(day.usageMsByWebsite, session.hostname, segment.durationMs);
      }
      for (const itemId of itemIds) {
        addToCountMap(day.usageMsByItem, itemId, segment.durationMs);
      }
    }
    return next;
  });
}

export async function recordBlockedAttempt({
  hostname,
  categoryIds,
  timestamp = Date.now(),
}: {
  hostname: string;
  categoryIds: readonly string[];
  timestamp?: number;
}) {
  return updateAnalyticsState((current) => {
    const next: AnalyticsState = { ...current, days: { ...current.days } };
    const day = getMutableDay(next.days, getLocalDateKey(sanitizeEventTimestamp(timestamp)));
    day.blockedAttempts = addCount(day.blockedAttempts, 1);
    addToCountMap(day.blockedAttemptsByWebsite, hostname, 1);
    for (const categoryId of new Set(categoryIds)) {
      addToCountMap(day.blockedAttemptsByCategory, categoryId, 1);
    }
    return next;
  });
}

export function subscribeToAnalyticsState(listener: (state: AnalyticsState) => void) {
  const onChanged = (changes: Record<string, Browser.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local" || !(STORAGE_KEY in changes)) return;
    listener(
      pruneHistory(sanitizeAnalyticsState(changes[STORAGE_KEY]?.newValue ?? defaultAnalyticsState)),
    );
  };
  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
}

function pruneHistory(state: AnalyticsState): AnalyticsState {
  const oldest = new Date();
  oldest.setHours(0, 0, 0, 0);
  oldest.setDate(oldest.getDate() - (RETENTION_DAYS - 1));
  const oldestKey = getLocalDateKey(oldest.getTime());
  const newestKey = getLocalDateKey();
  const entries = Object.entries(state.days).filter(
    ([date]) => date >= oldestKey && date <= newestKey,
  );
  if (entries.length === Object.keys(state.days).length) return state;

  return {
    ...state,
    days: Object.fromEntries(entries),
  };
}

function getMutableDay(days: Record<string, DailyAnalytics>, date: string): DailyAnalytics {
  const existing = days[date];
  const day = existing
    ? {
        ...existing,
        usageMsByItem: { ...existing.usageMsByItem },
        usageMsByWebsite: { ...existing.usageMsByWebsite },
        blockedAttemptsByWebsite: { ...existing.blockedAttemptsByWebsite },
        blockedAttemptsByCategory: { ...existing.blockedAttemptsByCategory },
      }
    : emptyDailyAnalytics();
  days[date] = day;
  return day;
}

function splitIntervalByLocalDay(start: number, end: number) {
  const segments: { date: string; durationMs: number }[] = [];
  let segmentStart = start;
  while (segmentStart < end) {
    const nextMidnight = new Date(segmentStart);
    nextMidnight.setHours(24, 0, 0, 0);
    const segmentEnd = Math.min(end, nextMidnight.getTime());
    if (segmentEnd <= segmentStart) break;
    segments.push({
      date: getLocalDateKey(segmentStart),
      durationMs: segmentEnd - segmentStart,
    });
    segmentStart = segmentEnd;
  }
  return segments;
}

function addToCountMap(counts: Record<string, number>, key: string, amount: number): void {
  const current = Object.hasOwn(counts, key) ? (counts[key] ?? 0) : 0;
  counts[key] = addCount(current, amount);
}

function addCount(current: number, amount: number): number {
  return Math.min(Number.MAX_SAFE_INTEGER, current + amount);
}

function sanitizeEventTimestamp(timestamp: number): number {
  return Number.isSafeInteger(timestamp) &&
    timestamp >= 0 &&
    Number.isFinite(new Date(timestamp).getTime())
    ? timestamp
    : Date.now();
}
