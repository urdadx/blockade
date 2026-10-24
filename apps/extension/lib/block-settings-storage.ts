import { defineStorageItem } from "./storage-item";

export type BlockSettingsValue = {
  showContextMenu: boolean;
  passwordProtectionEnabled: boolean;
};

type StoredBlockSettings = {
  showContextMenu: boolean;
  passwordHash: string;
  passwordSalt: string;
};

const HASH_ITERATIONS = 210_000;

export const defaultBlockSettings: BlockSettingsValue = {
  showContextMenu: true,
  passwordProtectionEnabled: false,
};

export const blockSettingsItem = defineStorageItem({
  key: "blockSettings",
  sanitize: sanitizeStoredBlockSettings,
});

export async function getBlockSettings(): Promise<BlockSettingsValue> {
  return toBlockSettingsValue(await blockSettingsItem.get());
}

export async function updateBlockSettings(update: { showContextMenu?: boolean }) {
  return toBlockSettingsValue(
    await blockSettingsItem.update((current) =>
      sanitizeStoredBlockSettings({ ...current, ...update }),
    ),
  );
}

export async function setBlockSettingsPassword(password: string) {
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt);
  return toBlockSettingsValue(
    await blockSettingsItem.update((current) => ({
      ...current,
      passwordHash: bytesToBase64(hash),
      passwordSalt: bytesToBase64(salt),
    })),
  );
}

export async function disableBlockSettingsPassword(password: string) {
  const verified = await blockSettingsItem.get();
  if (!(await passwordMatches(password, verified))) return false;

  // Only clear the password that was verified, not one set in the meantime.
  const next = await blockSettingsItem.update((current) =>
    current.passwordHash === verified.passwordHash
      ? { ...current, passwordHash: "", passwordSalt: "" }
      : current,
  );
  return !next.passwordHash;
}

export async function verifyBlockSettingsPassword(password: string) {
  return passwordMatches(password, await blockSettingsItem.get());
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

export function toBlockSettingsValue(settings: StoredBlockSettings): BlockSettingsValue {
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
