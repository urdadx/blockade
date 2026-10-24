import { describe, expect, it, vi } from "vitest";

import { createCoalescedTask } from "../lib/coalesced-task";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("createCoalescedTask", () => {
  it("never runs the task concurrently and folds overlapping calls into one more run", async () => {
    let active = 0;
    let maxActive = 0;
    let runs = 0;
    const run = createCoalescedTask(async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      runs++;
      await tick();
      active--;
    }, "failed");

    await Promise.all([run(), run(), run(), run()]);

    expect(maxActive).toBe(1);
    expect(runs).toBe(2);
  });

  it("resolves a call made mid-run only after a run that started after it", async () => {
    const seen: number[] = [];
    let value = 0;
    const run = createCoalescedTask(async () => {
      const snapshot = value;
      await tick();
      seen.push(snapshot);
    }, "failed");

    const first = run();
    value = 1;
    await run();

    expect(seen).toEqual([0, 1]);
    await first;
  });

  it("logs failures and keeps working", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    let calls = 0;
    const run = createCoalescedTask(async () => {
      calls++;
      if (calls === 1) throw new Error("boom");
    }, "Task failed");

    await run();
    await run();

    expect(error).toHaveBeenCalledWith("Task failed", expect.any(Error));
    expect(calls).toBe(2);
    error.mockRestore();
  });
});
