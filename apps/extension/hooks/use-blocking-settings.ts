import { defaultBlockingSettings, type BlockingSettings } from "@blockade/core";
import { useEffect, useState } from "react";

import { getBlockingSettings, subscribeToBlockingSettings } from "../lib/blocking-storage";

export function useBlockingSettings() {
  const [settings, setSettings] = useState<BlockingSettings>(defaultBlockingSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getBlockingSettings().then((value) => {
      if (!active) return;
      setSettings(value);
      setIsLoading(false);
    });

    const unsubscribe = subscribeToBlockingSettings(setSettings);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { settings, isLoading };
}
