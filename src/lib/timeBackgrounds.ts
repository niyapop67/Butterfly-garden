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

/*
 * 2026-07-06: dedicated landscape (1536x1024, 3:2) versions of the same four
 * scenes, generated specifically for desktop. The mobile set above is
 * portrait-cropped (~0.46 aspect) and was never meant to be blown up to fill
 * a wide viewport — see globals.css .bg-garden-page 768px+ rule, which reads
 * these via a --bg-photo-desktop custom property and displays them with
 * background-size: contain so the whole illustration stays visible instead
 * of being cropped down to a thin vertical slice. Garden page only for now.
 */
export const GARDEN_BG_IMAGES_PC: Record<TimeOfDay, string> = {
  morning: "/images/garden-bg-morning-pc.jpg",
  day: "/images/garden-bg-day-pc.jpg",
  "golden-hour": "/images/garden-bg-golden-hour-pc.jpg",
  "moon-garden": "/images/garden-bg-moon-garden-pc.jpg",
};
