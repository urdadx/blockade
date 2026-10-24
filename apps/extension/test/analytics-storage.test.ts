import type { UsageSession } from "@blockade/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

// Noon, so the intervals below stay within one local day.
const START = new Date(2026, 9, 24, 12, 0, 0).getTime();
const youtube: UsageSession = {
  hostname: "youtube.com",
  itemIds: ["website:youtube.com"],
  tracksFocus: false,
  checkpointAt: START,
};

async function loadAnalytics() {
  // The storage item caches per module instance, and reset() clears its listener.
  vi.resetModules();
  return import("../lib/analytics-storage");
}

describe("checkpointUsage", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("skips the write for an unchanged session checked again within 30s", async () => {
    const { checkpointUsage } = await loadAnalytics();
    await checkpointUsage(youtube, START);
    const write = vi.spyOn(fakeBrowser.storage.local, "set");

    await checkpointUsage(youtube, START + 10_000);

    expect(write).not.toHaveBeenCalled();
  });

  it("still counts the skipped time at the next checkpoint", async () => {
    const { checkpointUsage, getDailyAnalytics } = await loadAnalytics();
    await checkpointUsage(youtube, START);
    await checkpointUsage(youtube, START + 10_000);
    await checkpointUsage(youtube, START + 60_000);

    const day = await getDailyAnalytics(dateKey(START));
    expect(day.usageMsByItem["website:youtube.com"]).toBe(60_000);
  });

  it("writes immediately when the session changes", async () => {
    const { checkpointUsage, getDailyAnalytics } = await loadAnalytics();
    await checkpointUsage(youtube, START);
    await checkpointUsage(null, START + 5_000);

    const day = await getDailyAnalytics(dateKey(START));
    expect(day.usageMsByItem["website:youtube.com"]).toBe(5_000);
  });
});

function dateKey(timestamp: number) {
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
