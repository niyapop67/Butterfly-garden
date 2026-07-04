import type { TimeOfDay } from "./useTimeOfDay";

/**
 * Time-of-day background images.
 *
 * 2026-07-03: briefly made TOP/SUBMIT use a single static image instead of
 * this rotation (public/images/top-bg.jpg). 2026-07-04: reverted — Niya
 * wasn't happy with that static image either, so TOP/SUBMIT go back to the
 * same morning/day/golden-hour/moon-garden rotation as the Garden page,
 * reusing this same image set (no separate TOP-only images).
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
