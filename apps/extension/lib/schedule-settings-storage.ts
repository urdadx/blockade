import {
  defaultBlockingSchedule,
  sanitizeBlockingSchedule,
  type BlockingSchedule,
} from "@blockade/core";

const STORAGE_KEY = "scheduleSettings";
let updateQueue = Promise.resolve();

export async function getScheduleSettings(): Promise<BlockingSchedule> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return stored[STORAGE_KEY]
    ? sanitizeBlockingSchedule(stored[STORAGE_KEY])
    : structuredClone(defaultBlockingSchedule);
}

export function updateScheduleSettings(schedule: BlockingSchedule) {
  const operation = updateQueue.then(async () => {
    const next = sanitizeBlockingSchedule(schedule);
    await browser.storage.local.set({ [STORAGE_KEY]: next });
    return next;
  });
  updateQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export function subscribeToScheduleSettings(listener: (schedule: BlockingSchedule) => void) {
  const onChanged = (changes: Record<string, Browser.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    listener(sanitizeBlockingSchedule(changes[STORAGE_KEY].newValue));
  };
  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
}
