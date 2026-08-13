import { useEffect, useState } from "react";

import {
  defaultPomodoroSettings,
  getPomodoroSettings,
  subscribeToPomodoroSettings,
} from "../lib/pomodoro-settings-storage";

export function usePomodoroSettings() {
  const [settings, setSettings] = useState(defaultPomodoroSettings);

  useEffect(() => {
    let active = true;
    let receivedUpdate = false;
    const unsubscribe = subscribeToPomodoroSettings((value) => {
      receivedUpdate = true;
      setSettings(value);
    });
    void getPomodoroSettings().then((value) => {
      if (active && !receivedUpdate) setSettings(value);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return settings;
}
