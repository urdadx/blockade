export type RedirectSettingsValue = {
  showPomodoroTimer: boolean;
  customRedirectUrl: string;
};

const STORAGE_KEY = "redirectSettings";
let updateQueue = Promise.resolve();

export const defaultRedirectSettings: RedirectSettingsValue = {
  showPomodoroTimer: true,
  customRedirectUrl: "",
};

export async function getRedirectSettings(): Promise<RedirectSettingsValue> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return sanitizeRedirectSettings(stored[STORAGE_KEY]);
}

export async function updateRedirectSettings(update: Partial<RedirectSettingsValue>) {
  const operation = updateQueue.then(async () => {
    const next = sanitizeRedirectSettings({ ...(await getRedirectSettings()), ...update });
    await browser.storage.local.set({ [STORAGE_KEY]: next });
    return next;
  });
  updateQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export function subscribeToRedirectSettings(listener: (settings: RedirectSettingsValue) => void) {
  const onChanged = (changes: Record<string, Browser.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    listener(sanitizeRedirectSettings(changes[STORAGE_KEY].newValue));
  };
  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
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
    const url = new URL(
      /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}
