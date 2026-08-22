export type UsageSession = {
  hostname: string;
  itemIds: string[];
  tracksFocus: boolean;
  checkpointAt: number;
};

export type DailyAnalytics = {
  scheduledFocusMs: number;
  usageMsByItem: Record<string, number>;
  usageMsByWebsite: Record<string, number>;
  blockedAttempts: number;
  blockedAttemptsByWebsite: Record<string, number>;
  blockedAttemptsByCategory: Record<string, number>;
};

export type AnalyticsState = {
  version: number;
  days: Record<string, DailyAnalytics>;
  activeSession: UsageSession | null;
};

export const analyticsVersion = 1;

const maximumAnalyticsDays = 366;
const maximumMapEntries = 2_000;
const maximumKeyLength = 512;
const maximumSessionItems = 256;
const maximumHostnameLength = 253;
const maximumFutureSessionSkewMs = 5 * 60 * 1_000;
const unsafeRecordKeys = new Set(["__proto__", "constructor", "prototype"]);

export const emptyDailyAnalytics = (): DailyAnalytics => ({
  scheduledFocusMs: 0,
  usageMsByItem: createCountMap(),
  usageMsByWebsite: createCountMap(),
  blockedAttempts: 0,
  blockedAttemptsByWebsite: createCountMap(),
  blockedAttemptsByCategory: createCountMap(),
});

export const defaultAnalyticsState: AnalyticsState = {
  version: analyticsVersion,
  days: {},
  activeSession: null,
};

export function getLocalDateKey(timestamp = Date.now()): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function sanitizeAnalyticsState(value: unknown): AnalyticsState {
  const state = isRecord(value) ? value : {};
  const days = Object.fromEntries(
    (isRecord(state.days) ? Object.entries(state.days) : [])
      .filter(([date]) => isValidDateKey(date))
      .sort(([left], [right]) => right.localeCompare(left))
      .slice(0, maximumAnalyticsDays)
      .map(([date, day]) => [date, sanitizeDailyAnalytics(day)]),
  );
  const session = isRecord(state.activeSession) ? state.activeSession : null;
  const hostname = sanitizeHostname(session?.hostname);
  const checkpointAt = sanitizeTimestamp(session?.checkpointAt);

  return {
    version: analyticsVersion,
    days,
    activeSession:
      session &&
      hostname &&
      checkpointAt !== null &&
      Array.isArray(session.itemIds) &&
      session.itemIds.length <= maximumSessionItems
        ? {
            hostname,
            itemIds: Array.from(new Set(session.itemIds.filter(isValidItemId))),
            tracksFocus: session.tracksFocus === true,
            checkpointAt,
          }
        : null,
  };
}

export function sanitizeDailyAnalytics(value: unknown): DailyAnalytics {
  const day = isRecord(value) ? value : {};
  return {
    scheduledFocusMs: sanitizeCount(day.scheduledFocusMs),
    usageMsByItem: sanitizeCountMap(day.usageMsByItem),
    usageMsByWebsite: sanitizeCountMap(day.usageMsByWebsite),
    blockedAttempts: sanitizeCount(day.blockedAttempts),
    blockedAttemptsByWebsite: sanitizeCountMap(day.blockedAttemptsByWebsite),
    blockedAttemptsByCategory: sanitizeCountMap(day.blockedAttemptsByCategory),
  };
}

function sanitizeCountMap(value: unknown): Record<string, number> {
  const result = createCountMap();
  if (!isRecord(value)) return result;

  let entryCount = 0;
  for (const [key, count] of Object.entries(value)) {
    if (!isSafeRecordKey(key)) continue;
    const sanitizedCount = sanitizeCount(count);
    if (sanitizedCount === 0 && count !== 0) continue;
    result[key] = sanitizedCount;
    entryCount += 1;
    if (entryCount >= maximumMapEntries) break;
  }
  return result;
}

function sanitizeCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value))
    : 0;
}

function sanitizeHostname(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const hostname = value.toLowerCase().replace(/\.$/, "");
  return hostname.length > 0 &&
    hostname.length <= maximumHostnameLength &&
    hostname.includes(".") &&
    /^[a-z0-9.-]+$/.test(hostname)
    ? hostname
    : null;
}

function sanitizeTimestamp(value: unknown): number | null {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value > Date.now() + maximumFutureSessionSkewMs ||
    !Number.isFinite(new Date(value).getTime())
  ) {
    return null;
  }
  return value;
}

function isValidItemId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= maximumKeyLength &&
    /^(?:website|category):[a-z0-9][a-z0-9.-]*$/.test(value)
  );
}

function isValidDateKey(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isSafeRecordKey(key: string): boolean {
  return key.length > 0 && key.length <= maximumKeyLength && !unsafeRecordKeys.has(key);
}

function createCountMap(): Record<string, number> {
  return Object.create(null) as Record<string, number>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
