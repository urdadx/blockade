import { initializeBlockingSettings, rebuildBlockingRule } from "../lib/blocking-storage";

export default defineBackground(() => {
  let rebuildQueue = Promise.resolve();
  const queueRebuild = () => {
    rebuildQueue = rebuildQueue
      .then(rebuildBlockingRule, rebuildBlockingRule)
      .catch((error: unknown) => {
        console.error("Failed to update Blockade rules", error);
      });
  };

  browser.runtime.onInstalled.addListener(() => {
    void initializeBlockingSettings().then(queueRebuild);
  });

  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.blockingSettings) queueRebuild();
  });

  queueRebuild();
});
