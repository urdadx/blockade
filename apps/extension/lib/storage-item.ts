import { browser } from "wxt/browser";

export type StorageItem<T> = {
  readonly key: string;
  /** The sanitized value. Cached until storage reports a change, so hot paths skip the read. */
  get(): Promise<T>;
  /**
   * Read-modify-write against fresh storage, serialized in this context and, when
   * `lockName` is set, across extension contexts. Returning `current` skips the write.
   */
  update(change: (current: T) => T): Promise<T>;
  subscribe(listener: (value: T) => void): () => void;
};

type StorageItemOptions<T> = {
  key: string;
  sanitize: (value: unknown) => T;
  /** Applied after `update` and before the write, e.g. to prune old entries. */
  prepare?: (value: T) => T;
  lockName?: string;
};

export function defineStorageItem<T>({
  key,
  sanitize,
  prepare = (value) => value,
  lockName,
}: StorageItemOptions<T>): StorageItem<T> {
  let cached: Promise<T> | null = null;
  // Raw value from the latest change event, sanitized only if something reads it.
  let changedValue: { value: unknown } | null = null;
  let queue = Promise.resolve();

  // Registered when the module loads, so in the background it runs before any
  // listener that reacts to the same change and reads this item.
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !(key in changes)) return;
    cached = null;
    changedValue = { value: changes[key]?.newValue };
  });

  const read = async () => sanitize((await browser.storage.local.get(key))[key]);

  const get = () => {
    if (cached) return cached;
    if (changedValue) {
      cached = Promise.resolve(sanitize(changedValue.value));
      changedValue = null;
      return cached;
    }
    const pending = read();
    cached = pending;
    pending.catch(() => {
      if (cached === pending) cached = null;
    });
    return pending;
  };

  const write = async (change: (current: T) => T) => {
    const current = await read();
    const updated = change(current);
    if (updated === current) return current;

    const next = prepare(updated);
    await browser.storage.local.set({ [key]: next });
    return next;
  };

  const update = (change: (current: T) => T) => {
    const run = () =>
      lockName && typeof navigator !== "undefined" && navigator.locks
        ? navigator.locks.request(lockName, () => write(change))
        : write(change);
    const operation = queue.then(run);
    queue = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  };

  const subscribe = (listener: (value: T) => void) => {
    const onChanged = (
      changes: Record<string, Browser.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName === "local" && key in changes) listener(sanitize(changes[key]?.newValue));
    };
    browser.storage.onChanged.addListener(onChanged);
    return () => browser.storage.onChanged.removeListener(onChanged);
  };

  return { key, get, update, subscribe };
}
