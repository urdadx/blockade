import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

import { defineStorageItem } from "../lib/storage-item";

const sanitizeCount = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) ? value : 0;

describe("defineStorageItem", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("returns the sanitized value, falling back for missing or invalid data", async () => {
    const item = defineStorageItem({ key: "count", sanitize: sanitizeCount });
    expect(await item.get()).toBe(0);

    await fakeBrowser.storage.local.set({ count: "not a number" });
    expect(await item.get()).toBe(0);
  });

  it("serves repeated reads from the cache", async () => {
    await fakeBrowser.storage.local.set({ count: 3 });
    const item = defineStorageItem({ key: "count", sanitize: sanitizeCount });
    const read = vi.spyOn(fakeBrowser.storage.local, "get");

    expect(await item.get()).toBe(3);
    expect(await item.get()).toBe(3);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("drops the cache when another context changes the value", async () => {
    const item = defineStorageItem({ key: "count", sanitize: sanitizeCount });
    expect(await item.get()).toBe(0);

    await fakeBrowser.storage.local.set({ count: 7 });
    expect(await item.get()).toBe(7);
  });

  it("serializes overlapping updates", async () => {
    const item = defineStorageItem({ key: "count", sanitize: sanitizeCount });

    await Promise.all([
      item.update((n) => n + 1),
      item.update((n) => n + 1),
      item.update((n) => n + 1),
    ]);

    expect((await fakeBrowser.storage.local.get("count")).count).toBe(3);
  });

  it("skips the write when the update returns the current value", async () => {
    const item = defineStorageItem({ key: "count", sanitize: sanitizeCount });
    const write = vi.spyOn(fakeBrowser.storage.local, "set");

    await item.update((n) => n);

    expect(write).not.toHaveBeenCalled();
  });

  it("applies prepare before writing", async () => {
    const item = defineStorageItem({
      key: "count",
      sanitize: sanitizeCount,
      prepare: (n) => Math.min(n, 10),
    });

    expect(await item.update(() => 50)).toBe(10);
    expect((await fakeBrowser.storage.local.get("count")).count).toBe(10);
  });

  it("notifies subscribers with sanitized values until they unsubscribe", async () => {
    const item = defineStorageItem({ key: "count", sanitize: sanitizeCount });
    const listener = vi.fn();
    const unsubscribe = item.subscribe(listener);

    await fakeBrowser.storage.local.set({ count: "bad" });
    await fakeBrowser.storage.local.set({ count: 4 });
    unsubscribe();
    await fakeBrowser.storage.local.set({ count: 5 });

    expect(listener.mock.calls).toEqual([[0], [4]]);
  });
});
