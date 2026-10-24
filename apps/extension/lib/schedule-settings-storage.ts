import { sanitizeBlockingSchedule, type BlockingSchedule } from "@blockade/core";

import { defineStorageItem } from "./storage-item";

export const scheduleSettingsItem = defineStorageItem({
  key: "scheduleSettings",
  sanitize: sanitizeBlockingSchedule,
});

export const getScheduleSettings = scheduleSettingsItem.get;

export function updateScheduleSettings(schedule: BlockingSchedule) {
  return scheduleSettingsItem.update(() => sanitizeBlockingSchedule(schedule));
}
