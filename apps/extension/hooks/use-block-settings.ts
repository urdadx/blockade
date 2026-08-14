import { useEffect, useState } from "react";

import {
  defaultBlockSettings,
  getBlockSettings,
  subscribeToBlockSettings,
} from "../lib/block-settings-storage";

export function useBlockSettings() {
  const [settings, setSettings] = useState(defaultBlockSettings);

  useEffect(() => {
    let active = true;
    let receivedUpdate = false;
    const unsubscribe = subscribeToBlockSettings((value) => {
      receivedUpdate = true;
      setSettings(value);
    });
    void getBlockSettings().then((value) => {
      if (active && !receivedUpdate) setSettings(value);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return settings;
}
