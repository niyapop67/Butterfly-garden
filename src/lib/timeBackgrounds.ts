import type { TimeOfDay } from "./useTimeOfDay";

/**
 * Time-of-day background images (2026-07-03 update).
 *
 * Landscape crop for the TOP / SUBMIT pages: symmetric crop centered on the
 * fountain (fountain sits at ~58% width in the source illustration, not
 * dead-center), so cover-fit on the mobile column keeps the fountain in
 * frame instead of drifting left like a naive center-crop would.
 *
 * Portrait crop for the GARDEN page: same fountain-centered logic, cropped
 * to the ~0.46 mobile aspect ratio (close to the original garden-bg.jpg's
 * 0.45), matching the "dedicated portrait illustration" treatment garden-bg
 * already used.
 */
export const TOP_BG_IMAGES: Record<TimeOfDay, string> = {
  morning: "/images/top-bg-morning.jpg",
  day: "/images/top-bg-day.jpg",
  "golden-hour": "/images/top-bg-golden-hour.jpg",
  "moon-garden": "/images/top-bg-moon-garden.jpg",
};

export const GARDEN_BG_IMAGES: Record<TimeOfDay, string> = {
  morning: "/images/garden-bg-morning.jpg",
  day: "/images/garden-bg-day.jpg",
  "golden-hour": "/images/garden-bg-golden-hour.jpg",
  "moon-garden": "/images/garden-bg-moon-garden.jpg",
};
