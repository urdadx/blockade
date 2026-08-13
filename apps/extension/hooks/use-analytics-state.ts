import { defaultAnalyticsState, type AnalyticsState } from "@blockade/core";
import { useEffect, useState } from "react";

import { getAnalyticsState, subscribeToAnalyticsState } from "../lib/analytics-storage";

export function useAnalyticsState() {
  const [analytics, setAnalytics] = useState<AnalyticsState>(defaultAnalyticsState);

  useEffect(() => {
    let active = true;
    let receivedUpdate = false;
    const unsubscribe = subscribeToAnalyticsState((value) => {
      receivedUpdate = true;
      setAnalytics(value);
    });
    void getAnalyticsState().then((value) => {
      if (active && !receivedUpdate) setAnalytics(value);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return analytics;
}
