import { defaultAnalyticsState } from "@blockade/core";

import { analyticsItem } from "../lib/analytics-storage";
import { useStorageItem } from "./use-storage-item";

export function useAnalyticsState() {
  return useStorageItem(analyticsItem, defaultAnalyticsState).value;
}
