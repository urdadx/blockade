import { defaultPomodoroSettings, pomodoroSettingsItem } from "../lib/pomodoro-settings-storage";
import { useStorageItem } from "./use-storage-item";

export function usePomodoroSettings() {
  return useStorageItem(pomodoroSettingsItem, defaultPomodoroSettings).value;
}
