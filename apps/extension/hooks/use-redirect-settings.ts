import { useEffect, useState } from "react";

import {
  defaultRedirectSettings,
  getRedirectSettings,
  subscribeToRedirectSettings,
} from "../lib/redirect-settings-storage";

export function useRedirectSettings() {
  const [settings, setSettings] = useState(defaultRedirectSettings);

  useEffect(() => {
    let active = true;
    let receivedUpdate = false;
    const unsubscribe = subscribeToRedirectSettings((value) => {
      receivedUpdate = true;
      setSettings(value);
    });
    void getRedirectSettings().then((value) => {
      if (active && !receivedUpdate) setSettings(value);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return settings;
}
