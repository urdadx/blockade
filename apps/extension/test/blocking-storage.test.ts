import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

type Rule = Browser.declarativeNetRequest.Rule;

let dynamicRules: Rule[];

// The fake browser doesn't implement declarativeNetRequest, so keep a rule list here.
function stubDeclarativeNetRequest() {
  dynamicRules = [];
  const dnr = fakeBrowser.declarativeNetRequest;
  dnr.getDynamicRules = vi.fn(async () => structuredClone(dynamicRules));
  dnr.updateDynamicRules = vi.fn(async ({ removeRuleIds = [], addRules = [] }) => {
    dynamicRules = [
      ...dynamicRules.filter((rule) => !removeRuleIds.includes(rule.id)),
      ...addRules,
    ];
  });
  dnr.isRegexSupported = vi.fn(async () => ({ isSupported: true }));
  return dnr;
}

async function loadBlocking() {
  vi.resetModules();
  return import("../lib/blocking-storage");
}

describe("rebuildBlockingRule", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("writes the rules the first time", async () => {
    const dnr = stubDeclarativeNetRequest();
    const { initializeBlockingSettings, rebuildBlockingRule } = await loadBlocking();
    await initializeBlockingSettings();

    expect(await rebuildBlockingRule()).toBe(true);
    expect(dnr.updateDynamicRules).toHaveBeenCalledTimes(1);
    expect(dynamicRules.length).toBeGreaterThan(0);
  });

  it("does nothing when the inputs haven't changed", async () => {
    const dnr = stubDeclarativeNetRequest();
    const { initializeBlockingSettings, rebuildBlockingRule } = await loadBlocking();
    await initializeBlockingSettings();
    await rebuildBlockingRule();
    vi.mocked(dnr.updateDynamicRules).mockClear();
    vi.mocked(dnr.isRegexSupported).mockClear();

    expect(await rebuildBlockingRule()).toBe(false);
    expect(dnr.updateDynamicRules).not.toHaveBeenCalled();
    expect(dnr.isRegexSupported).not.toHaveBeenCalled();
  });

  it("rewrites the rules after a site is blocked", async () => {
    stubDeclarativeNetRequest();
    const { blockDomain, initializeBlockingSettings, rebuildBlockingRule } = await loadBlocking();
    await initializeBlockingSettings();
    await rebuildBlockingRule();

    await blockDomain("tiktok.com");

    expect(await rebuildBlockingRule()).toBe(true);
    const domainRule = dynamicRules.find((rule) => rule.id === 1);
    expect(domainRule?.condition.requestDomains).toContain("tiktok.com");
  });

  it("rewrites the rules when they were removed behind its back", async () => {
    stubDeclarativeNetRequest();
    const { initializeBlockingSettings, rebuildBlockingRule } = await loadBlocking();
    await initializeBlockingSettings();
    await rebuildBlockingRule();

    dynamicRules = [];

    expect(await rebuildBlockingRule()).toBe(true);
    expect(dynamicRules.length).toBeGreaterThan(0);
  });
});

describe("getBlockedNavigation", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("sees a newly blocked site without waiting for a cache to expire", async () => {
    const { blockDomain, getBlockedNavigation, initializeBlockingSettings } = await loadBlocking();
    await initializeBlockingSettings();
    expect(await getBlockedNavigation("https://www.tiktok.com/@someone")).toBeNull();

    await blockDomain("tiktok.com");

    expect(await getBlockedNavigation("https://www.tiktok.com/@someone")).toMatchObject({
      hostname: "www.tiktok.com",
      blockedByKeywordOnly: false,
    });
  });
});

describe("enforcedByRules", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("is true for a blocked domain, which the domain rule covers", async () => {
    stubDeclarativeNetRequest();
    const { blockDomain, getBlockedNavigation, initializeBlockingSettings, rebuildBlockingRule } =
      await loadBlocking();
    await initializeBlockingSettings();
    await blockDomain("tiktok.com");
    await rebuildBlockingRule();

    expect((await getBlockedNavigation("https://tiktok.com/"))?.enforcedByRules).toBe(true);
  });

  it("is true for a keyword whose regex DNR accepted", async () => {
    stubDeclarativeNetRequest();
    const { blockKeyword, getBlockedNavigation, initializeBlockingSettings, rebuildBlockingRule } =
      await loadBlocking();
    await initializeBlockingSettings();
    await blockKeyword("cat videos");
    await rebuildBlockingRule();

    const blocked = await getBlockedNavigation("https://example.com/watch/cat-videos");
    expect(blocked).toMatchObject({ blockedByKeywordOnly: true, enforcedByRules: true });
  });

  it("is false for a keyword whose regex DNR rejected, so the background redirects it", async () => {
    const dnr = stubDeclarativeNetRequest();
    vi.mocked(dnr.isRegexSupported).mockImplementation(async ({ regex }) => ({
      isSupported: !regex.includes("cat"),
    }));
    const { blockKeyword, getBlockedNavigation, initializeBlockingSettings, rebuildBlockingRule } =
      await loadBlocking();
    await initializeBlockingSettings();
    await blockKeyword("cat videos");
    await rebuildBlockingRule();

    const blocked = await getBlockedNavigation("https://example.com/watch/cat-videos");
    expect(blocked).toMatchObject({ blockedByKeywordOnly: true, enforcedByRules: false });
  });

  it("remembers the uncovered keywords across a service worker restart", async () => {
    const dnr = stubDeclarativeNetRequest();
    vi.mocked(dnr.isRegexSupported).mockImplementation(async ({ regex }) => ({
      isSupported: !regex.includes("cat"),
    }));
    const first = await loadBlocking();
    await first.initializeBlockingSettings();
    await first.blockKeyword("cat videos");
    await first.rebuildBlockingRule();

    // A fresh module is a restarted worker: memory is gone, session storage isn't.
    const restarted = await loadBlocking();
    const blocked = await restarted.getBlockedNavigation("https://example.com/watch/cat-videos");
    expect(blocked?.enforcedByRules).toBe(false);
  });
});
