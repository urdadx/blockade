import { useMemo } from "react";

import {
  blockSettingsItem,
  defaultBlockSettings,
  toBlockSettingsValue,
} from "../lib/block-settings-storage";
import { useStorageItem } from "./use-storage-item";

const defaultStoredBlockSettings = {
  showContextMenu: defaultBlockSettings.showContextMenu,
  passwordHash: "",
  passwordSalt: "",
};

export function useBlockSettings() {
  const { value } = useStorageItem(blockSettingsItem, defaultStoredBlockSettings);
  return useMemo(() => toBlockSettingsValue(value), [value]);
}
