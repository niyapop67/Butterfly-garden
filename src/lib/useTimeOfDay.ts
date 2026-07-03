"use client";

import { useState, useEffect } from "react";
import { type TimeOfDay, type TimeConfig, TIME_CONFIGS, getTimeOfDay } from "./timeOfDayConfig";

// Re-exported for existing client-side callers (garden/page.tsx). Server
// Components should import getTimeOfDay/TIME_CONFIGS from ./timeOfDayConfig
// directly — see the comment at the top of that file for why.
export type { TimeOfDay, TimeConfig };
export { TIME_CONFIGS, getTimeOfDay };

export function useTimeOfDay(): TimeConfig {
  const [time, setTime] = useState<TimeOfDay>(() => getTimeOfDay());

  useEffect(() => {
    // Re-check every minute
    const interval = setInterval(() => {
      setTime(getTimeOfDay());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return TIME_CONFIGS[time as TimeOfDay];
}
