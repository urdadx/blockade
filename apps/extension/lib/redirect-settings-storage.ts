import { defineStorageItem } from "./storage-item";

export type RedirectSettingsValue = {
  showPomodoroTimer: boolean;
  customRedirectUrl: string;
};

export const defaultRedirectSettings: RedirectSettingsValue = {
  showPomodoroTimer: true,
  customRedirectUrl: "",
};

export const redirectSettingsItem = defineStorageItem({
  key: "redirectSettings",
  sanitize: sanitizeRedirectSettings,
});

export const getRedirectSettings = redirectSettingsItem.get;

export function updateRedirectSettings(update: Partial<RedirectSettingsValue>) {
  return redirectSettingsItem.update((current) =>
    sanitizeRedirectSettings({ ...current, ...update }),
  );
}

function sanitizeRedirectSettings(value: unknown): RedirectSettingsValue {
  const settings =
    value && typeof value === "object" ? (value as Partial<RedirectSettingsValue>) : {};
  return {
    showPomodoroTimer:
      typeof settings.showPomodoroTimer === "boolean"
        ? settings.showPomodoroTimer
        : defaultRedirectSettings.showPomodoroTimer,
    customRedirectUrl: sanitizeUrl(settings.customRedirectUrl),
  };
}

function sanitizeUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const trimmed = value.trim();
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}
