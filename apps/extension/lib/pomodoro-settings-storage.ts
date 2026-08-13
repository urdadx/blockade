export type PomodoroSettingsValue = {
  sessionDuration: number;
  breakDuration: number;
};

const STORAGE_KEY = "pomodoroSettings";
const VALID_DURATIONS = new Set(Array.from({ length: 12 }, (_, index) => (index + 1) * 5));
let updateQueue = Promise.resolve();

export const defaultPomodoroSettings: PomodoroSettingsValue = {
  sessionDuration: 25,
  breakDuration: 5,
};

export async function getPomodoroSettings(): Promise<PomodoroSettingsValue> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return sanitizePomodoroSettings(stored[STORAGE_KEY]);
}

export async function updatePomodoroSettings(update: Partial<PomodoroSettingsValue>) {
  const operation = updateQueue.then(async () => {
    const next = sanitizePomodoroSettings({ ...(await getPomodoroSettings()), ...update });
    await browser.storage.local.set({ [STORAGE_KEY]: next });
    return next;
  });
  updateQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export function subscribeToPomodoroSettings(listener: (settings: PomodoroSettingsValue) => void) {
  const onChanged = (changes: Record<string, Browser.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    listener(sanitizePomodoroSettings(changes[STORAGE_KEY].newValue));
  };
  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
}

function sanitizePomodoroSettings(value: unknown): PomodoroSettingsValue {
  const settings =
    value && typeof value === "object" ? (value as Partial<PomodoroSettingsValue>) : {};
  return {
    sessionDuration: VALID_DURATIONS.has(settings.sessionDuration ?? 0)
      ? settings.sessionDuration!
      : defaultPomodoroSettings.sessionDuration,
    breakDuration: VALID_DURATIONS.has(settings.breakDuration ?? 0)
      ? settings.breakDuration!
      : defaultPomodoroSettings.breakDuration,
  };
}
