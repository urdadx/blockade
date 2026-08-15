import { defaultBlockingSchedule } from "@blockade/core";
import { useEffect, useState } from "react";

import { getScheduleSettings, subscribeToScheduleSettings } from "../lib/schedule-settings-storage";

export function useScheduleSettings() {
  const [schedule, setSchedule] = useState(defaultBlockingSchedule);

  useEffect(() => {
    let active = true;
    let receivedUpdate = false;
    const unsubscribe = subscribeToScheduleSettings((value) => {
      receivedUpdate = true;
      setSchedule(value);
    });
    void getScheduleSettings().then((value) => {
      if (active && !receivedUpdate) setSchedule(value);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return schedule;
}
