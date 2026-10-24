import { defaultRedirectSettings, redirectSettingsItem } from "../lib/redirect-settings-storage";
import { useStorageItem } from "./use-storage-item";

export function useRedirectSettings() {
  return useStorageItem(redirectSettingsItem, defaultRedirectSettings).value;
}
