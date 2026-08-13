export type UsageSession = {
  hostname: string;
  itemIds: string[];
  checkpointAt: number;
};

export type DailyAnalytics = {
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

export const emptyDailyAnalytics = (): DailyAnalytics => ({
  usageMsByItem: {},
  usageMsByWebsite: {},
  blockedAttempts: 0,
  blockedAttemptsByWebsite: {},
  blockedAttemptsByCategory: {},
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

export function sanitizeAnalyticsState(value: Partial<AnalyticsState>): AnalyticsState {
  const days = Object.fromEntries(
    Object.entries(value.days ?? {})
      .filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date))
      .map(([date, day]) => [date, sanitizeDay(day)]),
  );
  const session = value.activeSession;

  return {
    version: analyticsVersion,
    days,
    activeSession:
      session &&
      typeof session.hostname === "string" &&
      Array.isArray(session.itemIds) &&
      Number.isFinite(session.checkpointAt)
        ? {
            hostname: session.hostname,
            itemIds: session.itemIds.filter((item): item is string => typeof item === "string"),
            checkpointAt: session.checkpointAt,
          }
        : null,
  };
}

function sanitizeDay(value: Partial<DailyAnalytics> | undefined): DailyAnalytics {
  return {
    usageMsByItem: sanitizeCountMap(value?.usageMsByItem),
    usageMsByWebsite: sanitizeCountMap(value?.usageMsByWebsite),
    blockedAttempts: sanitizeCount(value?.blockedAttempts),
    blockedAttemptsByWebsite: sanitizeCountMap(value?.blockedAttemptsByWebsite),
    blockedAttemptsByCategory: sanitizeCountMap(value?.blockedAttemptsByCategory),
  };
}

function sanitizeCountMap(value: Record<string, number> | undefined): Record<string, number> {
  if (!value) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, count]) => Number.isFinite(count) && count >= 0)
      .map(([key, count]) => [key, Math.floor(count)]),
  );
}

function sanitizeCount(value: number | undefined): number {
  return Number.isFinite(value) && value! >= 0 ? Math.floor(value!) : 0;
}
