import { defineStorageItem } from "./storage-item";

export type PomodoroSettingsValue = {
  sessionDuration: number;
  breakDuration: number;
};

const VALID_DURATIONS = new Set(Array.from({ length: 12 }, (_, index) => (index + 1) * 5));

export const defaultPomodoroSettings: PomodoroSettingsValue = {
  sessionDuration: 25,
  breakDuration: 5,
};

export const pomodoroSettingsItem = defineStorageItem({
  key: "pomodoroSettings",
  sanitize: sanitizePomodoroSettings,
});

export const getPomodoroSettings = pomodoroSettingsItem.get;

export function updatePomodoroSettings(update: Partial<PomodoroSettingsValue>) {
  return pomodoroSettingsItem.update((current) =>
    sanitizePomodoroSettings({ ...current, ...update }),
  );
}

function sanitizePomodoroSettings(value: unknown): PomodoroSettingsValue {
  const settings =
    value && typeof value === "object" ? (value as Partial<PomodoroSettingsValue>) : {};
  const duration = (value: number | undefined, fallback: number) =>
    value !== undefined && VALID_DURATIONS.has(value) ? value : fallback;
  return {
    sessionDuration: duration(settings.sessionDuration, defaultPomodoroSettings.sessionDuration),
    breakDuration: duration(settings.breakDuration, defaultPomodoroSettings.breakDuration),
  };
}
