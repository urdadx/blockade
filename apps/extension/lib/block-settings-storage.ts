export type BlockSettingsValue = {
  showContextMenu: boolean;
  passwordProtectionEnabled: boolean;
};

type StoredBlockSettings = {
  showContextMenu: boolean;
  passwordHash: string;
  passwordSalt: string;
};

const STORAGE_KEY = "blockSettings";
const HASH_ITERATIONS = 210_000;
let updateQueue = Promise.resolve();

export const defaultBlockSettings: BlockSettingsValue = {
  showContextMenu: true,
  passwordProtectionEnabled: false,
};

export async function getBlockSettings(): Promise<BlockSettingsValue> {
  return toBlockSettingsValue(await getStoredBlockSettings());
}

export function updateBlockSettings(update: { showContextMenu?: boolean }) {
  return queueUpdate(async () => {
    const current = await getStoredBlockSettings();
    const next = sanitizeStoredBlockSettings({ ...current, ...update });
    await browser.storage.local.set({ [STORAGE_KEY]: next });
    return toBlockSettingsValue(next);
  });
}

export function setBlockSettingsPassword(password: string) {
  return queueUpdate(async () => {
    if (password.length < 8) throw new Error("Password must be at least 8 characters");
    const current = await getStoredBlockSettings();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await derivePasswordHash(password, salt);
    const next: StoredBlockSettings = {
      ...current,
      passwordHash: bytesToBase64(hash),
      passwordSalt: bytesToBase64(salt),
    };
    await browser.storage.local.set({ [STORAGE_KEY]: next });
    return toBlockSettingsValue(next);
  });
}

export function disableBlockSettingsPassword(password: string) {
  return queueUpdate(async () => {
    const current = await getStoredBlockSettings();
    if (!(await passwordMatches(password, current))) return false;

    const next: StoredBlockSettings = {
      ...current,
      passwordHash: "",
      passwordSalt: "",
    };
    await browser.storage.local.set({ [STORAGE_KEY]: next });
    return true;
  });
}

export async function verifyBlockSettingsPassword(password: string) {
  return passwordMatches(password, await getStoredBlockSettings());
}

export function subscribeToBlockSettings(listener: (settings: BlockSettingsValue) => void) {
  const onChanged = (changes: Record<string, Browser.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    listener(toBlockSettingsValue(sanitizeStoredBlockSettings(changes[STORAGE_KEY].newValue)));
  };
  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
}

async function getStoredBlockSettings() {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return sanitizeStoredBlockSettings(stored[STORAGE_KEY]);
}

function sanitizeStoredBlockSettings(value: unknown): StoredBlockSettings {
  const settings =
    value && typeof value === "object" ? (value as Partial<StoredBlockSettings>) : {};
  return {
    showContextMenu:
      typeof settings.showContextMenu === "boolean"
        ? settings.showContextMenu
        : defaultBlockSettings.showContextMenu,
    passwordHash: typeof settings.passwordHash === "string" ? settings.passwordHash : "",
    passwordSalt: typeof settings.passwordSalt === "string" ? settings.passwordSalt : "",
  };
}

function toBlockSettingsValue(settings: StoredBlockSettings): BlockSettingsValue {
  return {
    showContextMenu: settings.showContextMenu,
    passwordProtectionEnabled: Boolean(settings.passwordHash && settings.passwordSalt),
  };
}

async function passwordMatches(password: string, settings: StoredBlockSettings) {
  if (!settings.passwordHash || !settings.passwordSalt) return false;
  const expected = base64ToBytes(settings.passwordHash);
  const actual = await derivePasswordHash(password, base64ToBytes(settings.passwordSalt));
  if (actual.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < actual.length; index++)
    difference |= actual[index]! ^ expected[index]!;
  return difference === 0;
}

async function derivePasswordHash(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: Uint8Array.from(salt),
      iterations: HASH_ITERATIONS,
    },
    key,
    256,
  );
  return new Uint8Array(bits);
}

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function queueUpdate<T>(update: () => Promise<T>) {
  const operation = updateQueue.then(update, update);
  updateQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}
