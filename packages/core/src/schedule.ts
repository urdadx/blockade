export type ScheduleWindow = {
  startMinute: number;
  endMinute: number;
};

export type BlockingSchedule = {
  enabled: boolean;
  days: Array<ScheduleWindow | null>;
};

export const defaultBlockingSchedule: BlockingSchedule = {
  enabled: false,
  days: Array.from({ length: 7 }, () => null),
};

export function sanitizeBlockingSchedule(value: unknown): BlockingSchedule {
  const schedule = value && typeof value === "object" ? (value as Partial<BlockingSchedule>) : {};
  const inputDays = Array.isArray(schedule.days) ? schedule.days : [];
  return {
    enabled: schedule.enabled === true,
    days: Array.from({ length: 7 }, (_, index) => sanitizeWindow(inputDays[index])),
  };
}

export function isBlockingScheduleActive(schedule: BlockingSchedule, timestamp = Date.now()) {
  if (!schedule.enabled) return true;
  const date = new Date(timestamp);
  const window = schedule.days[date.getDay()];
  if (!window) return false;
  const minute = date.getHours() * 60 + date.getMinutes();
  return minute >= window.startMinute && minute < window.endMinute;
}

export function getScheduledMinutesForDate(schedule: BlockingSchedule, timestamp: number) {
  if (!schedule.enabled) return 24 * 60;
  const window = schedule.days[new Date(timestamp).getDay()];
  return window ? window.endMinute - window.startMinute : 0;
}

export function getNextScheduleBoundary(schedule: BlockingSchedule, timestamp = Date.now()) {
  if (!schedule.enabled) return null;
  const current = new Date(timestamp);
  const midnight = new Date(current);
  midnight.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const day = new Date(midnight);
    day.setDate(day.getDate() + dayOffset);
    const window = schedule.days[day.getDay()];
    if (!window) continue;
    for (const minute of [window.startMinute, window.endMinute]) {
      const boundary = new Date(day);
      boundary.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
      if (boundary.getTime() > timestamp) return boundary.getTime();
    }
  }
  return null;
}

function sanitizeWindow(value: unknown): ScheduleWindow | null {
  if (!value || typeof value !== "object") return null;
  const window = value as Partial<ScheduleWindow>;
  const startMinute = Number(window.startMinute);
  const endMinute = Number(window.endMinute);
  if (
    !Number.isInteger(startMinute) ||
    !Number.isInteger(endMinute) ||
    startMinute < 0 ||
    endMinute > 24 * 60 ||
    startMinute >= endMinute
  ) {
    return null;
  }
  return { startMinute, endMinute };
}
