/**
 * Time-of-day config, deliberately kept in a module WITHOUT "use client".
 *
 * useTimeOfDay.ts (the live-updating hook) is "use client", which means any
 * plain function exported from it — like getTimeOfDay() — becomes a client
 * reference proxy when imported into a Server Component. Calling that proxy
 * as a function at build/request time throws ("X is not a function") during
 * prerendering. page.tsx and submit/page.tsx are Server Components that just
 * need a one-shot time-of-day read, so they import getTimeOfDay/TIME_CONFIGS
 * from here instead. useTimeOfDay.ts re-exports both for client-side callers
 * (garden/page.tsx) so nothing else has to change its import path.
 */

export type TimeOfDay = "morning" | "day" | "golden-hour" | "moon-garden";

export interface TimeConfig {
  id: TimeOfDay;
  label: string;
  labelJa: string;
  /** CSS filter applied to background images to shift lighting */
  bgFilter: string;
  /** Ambient overlay color (rgba) blended over the background */
  ambientColor: string;
  ambientOpacity: number;
  /** Text/UI accent tones for this time */
  accentColor: string;
}

export const TIME_CONFIGS: Record<TimeOfDay, TimeConfig> = {
  morning: {
    id: "morning",
    label: "Morning",
    labelJa: "朝のガーデン",
    bgFilter: "brightness(1.08) saturate(0.9) hue-rotate(-5deg)",
    ambientColor: "255, 240, 210",
    ambientOpacity: 0.18,
    accentColor: "#e8c170",
  },
  day: {
    id: "day",
    label: "Day",
    labelJa: "昼のガーデン",
    bgFilter: "brightness(1.05) saturate(1.05)",
    ambientColor: "220, 240, 255",
    ambientOpacity: 0.08,
    accentColor: "#81d8d0",
  },
  "golden-hour": {
    id: "golden-hour",
    label: "Golden Hour",
    labelJa: "夕暮れのガーデン",
    bgFilter: "brightness(0.92) saturate(1.3) hue-rotate(15deg)",
    ambientColor: "255, 180, 100",
    ambientOpacity: 0.22,
    accentColor: "#ff9ec7",
  },
  "moon-garden": {
    id: "moon-garden",
    label: "Moon Garden",
    labelJa: "月夜のガーデン",
    bgFilter: "brightness(0.55) saturate(0.7) hue-rotate(200deg)",
    ambientColor: "100, 120, 200",
    ambientOpacity: 0.3,
    accentColor: "#c9a8e0",
  },
};

export function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "day";
  if (h >= 17 && h < 19) return "golden-hour";
  return "moon-garden";
}
