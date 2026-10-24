import { defaultBlockingSettings } from "@blockade/core";

import { blockingSettingsItem } from "../lib/blocking-storage";
import { useStorageItem } from "./use-storage-item";

export function useBlockingSettings() {
  const { value: settings, isLoading } = useStorageItem(
    blockingSettingsItem,
    defaultBlockingSettings,
  );
  return { settings, isLoading };
}
