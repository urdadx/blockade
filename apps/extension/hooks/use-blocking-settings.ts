import { defaultBlockingSettings, type BlockingSettings } from "@blockade/core";
import { useEffect, useState } from "react";

import { getBlockingSettings, subscribeToBlockingSettings } from "../lib/blocking-storage";

export function useBlockingSettings() {
  const [settings, setSettings] = useState<BlockingSettings>(defaultBlockingSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let receivedUpdate = false;
    const unsubscribe = subscribeToBlockingSettings((value) => {
      receivedUpdate = true;
      setSettings(value);
      setIsLoading(false);
    });
    void getBlockingSettings().then((value) => {
      if (!active || receivedUpdate) return;
      setSettings(value);
      setIsLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { settings, isLoading };
}
