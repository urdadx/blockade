import { defaultBlockingSchedule } from "@blockade/core";

import { scheduleSettingsItem } from "../lib/schedule-settings-storage";
import { useStorageItem } from "./use-storage-item";

export function useScheduleSettings() {
  return useStorageItem(scheduleSettingsItem, defaultBlockingSchedule).value;
}
