export type BlockSettingsValue = {
  showContextMenu: boolean;
};

const STORAGE_KEY = "blockSettings";

export const defaultBlockSettings: BlockSettingsValue = {
  showContextMenu: true,
};

export async function getBlockSettings(): Promise<BlockSettingsValue> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return sanitizeBlockSettings(stored[STORAGE_KEY]);
}

export async function updateBlockSettings(update: Partial<BlockSettingsValue>) {
  const next = sanitizeBlockSettings({ ...(await getBlockSettings()), ...update });
  await browser.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}

export function subscribeToBlockSettings(listener: (settings: BlockSettingsValue) => void) {
  const onChanged = (changes: Record<string, Browser.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    listener(sanitizeBlockSettings(changes[STORAGE_KEY].newValue));
  };
  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
}

function sanitizeBlockSettings(value: unknown): BlockSettingsValue {
  const settings = value && typeof value === "object" ? (value as Partial<BlockSettingsValue>) : {};
  return {
    showContextMenu:
      typeof settings.showContextMenu === "boolean"
        ? settings.showContextMenu
        : defaultBlockSettings.showContextMenu,
  };
}
