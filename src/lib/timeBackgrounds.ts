import type { TimeOfDay } from "./useTimeOfDay";

/**
 * Time-of-day background images.
 *
 * 2026-07-03: TOP/SUBMIT no longer use these — Niya provided a single fixed
 * portrait illustration (public/images/top-bg.jpg) with the fountain
 * pre-centered and asked for a static background there instead of the
 * morning/day/golden-hour/moon-garden rotation. The rotation now applies to
 * the Garden page only (src/app/garden/page.tsx).
 *
 * Portrait crop, fountain-centered, ~0.46 mobile aspect ratio (close to the
 * original garden-bg.jpg's 0.45).
 */
export const GARDEN_BG_IMAGES: Record<TimeOfDay, string> = {
  morning: "/images/garden-bg-morning.jpg",
  day: "/images/garden-bg-day.jpg",
  "golden-hour": "/images/garden-bg-golden-hour.jpg",
  "moon-garden": "/images/garden-bg-moon-garden.jpg",
};
