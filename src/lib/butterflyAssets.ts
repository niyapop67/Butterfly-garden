/**
 * Butterfly asset mapping: ButterflyType -> actual PNG files on disk.
 *
 * WHY THIS FILE EXISTS:
 * Spec v2.9 §1.8 originally defined 7 official butterfly types; as of
 * 2026-07-05 this is 6 — "twinkle-premium" was folded into "crystal-white"
 * (its generated art kept coming out indistinguishable from crystal-white's
 * pale/iridescent look, so rather than ship two near-identical pale types,
 * crystal-white's asset was replaced with the better of the two attempts
 * and twinkle-premium was removed as a separate type entirely).
 *
 * 2026-07-21: all 6 types replaced again with a final consistent crystal
 * gem-cut illustration set (heart-faceted wings, same cropping/padding
 * across all six) — aurora-dream's art (stem "rainbow") settled on the
 * shifting-hue "aurora" direction discussed in the 07-05 note.
 *
 * Rather than block the submit-page build on missing art, every component
 * that renders a butterfly (ButterflyImage, ButterflySelector, garden tiles,
 * etc.) takes a `ButterflyType` prop and looks up its file through
 * `getButterflyAsset()` below. To swap in the final art once it's ready:
 *
 *   1. Drop the new PNGs into public/images/butterflies/
 *      (e.g. aurora_large.png, aurora_medium.png, aurora_small.png)
 *   2. Add their pixel dimensions to SOURCE_SIZE
 *   3. Change the `file` value for that type in BUTTERFLY_ASSET_MAP
 *
 * No component code needs to change. If a size variant is missing for a
 * given file stem (e.g. no "_large" yet), getButterflyAsset() falls back to
 * the next available size rather than 404ing.
 */
import type { ButterflyType } from "@/types/submission";

export type ButterflySize = "large" | "medium" | "small";

interface AssetDims {
  w: number;
  h: number;
}

/** Natural pixel dimensions of each cropped source file, keyed by file stem. */
const SOURCE_SIZE: Record<string, AssetDims> = {
  // 2026-07-21: all 6 types replaced with a new matching crystal/gem-cut
  // illustration set (heart-faceted wings, consistent style across colors).
  pink_large: { w: 350, h: 295 },
  pink_medium: { w: 250, h: 210 },
  pink_small: { w: 180, h: 152 },
  tiffany_large: { w: 350, h: 269 },
  tiffany_medium: { w: 250, h: 192 },
  tiffany_small: { w: 180, h: 138 },
  emerald_large: { w: 350, h: 261 },
  emerald_medium: { w: 250, h: 187 },
  emerald_small: { w: 180, h: 134 },
  golden_large: { w: 350, h: 284 },
  golden_medium: { w: 250, h: 203 },
  golden_small: { w: 180, h: 146 },
  crystal_large: { w: 350, h: 377 },
  crystal_medium: { w: 250, h: 269 },
  crystal_small: { w: 180, h: 194 },
  rainbow_large: { w: 350, h: 268 },
  rainbow_medium: { w: 250, h: 192 },
  rainbow_small: { w: 180, h: 138 },
};

/**
 * Which file stem each of the 6 official types currently points to.
 *
 * `isPlaceholder: true` means this is still on the old mixed-style art (or
 * borrowing another colour's art temporarily) — swap the `stem` once the
 * new crystal-style asset for that type lands.
 */
interface ButterflyAssetEntry {
  stem: string;
  isPlaceholder: boolean;
  /**
   * 2026-07-06: correction factor for how much of each type's PNG canvas
   * the actual (solid, non-glow) wing artwork fills. All six were generated
   * separately, and while their canvases are similar width, the crystal/
   * emerald/golden/rainbow set has noticeably more empty vertical margin
   * around the wings than pink/tiffany (measured via alpha-channel bounding
   * box, threshold 128): the wings themselves occupy roughly 76-83% of
   * canvas width-equivalent height for crystal/emerald/golden/rainbow vs.
   * ~92-100% for pink/tiffany. Free-flying butterflies (FreeFlyingGarden)
   * render at a fixed CSS width with height:auto (so they can't crop to a
   * fixed box the way the fixed-size selector grid does — see
   * ButterflyImage's displayHeight), which let that margin difference read
   * as an actual size difference between types. This multiplies the base
   * render size per type to even that back out. 1.0 = no correction.
   */
  visualScale: number;
}

const BUTTERFLY_ASSET_MAP: Record<ButterflyType, ButterflyAssetEntry> = {
  "pink-heart": { stem: "pink", isPlaceholder: false, visualScale: 1.0 }, // 2026-07-21: new crystal-gem set
  "tiffany-sky": { stem: "tiffany", isPlaceholder: false, visualScale: 1.0 }, // 2026-07-21: new crystal-gem set
  "crystal-white": { stem: "crystal", isPlaceholder: false, visualScale: 1.03 }, // reverted to pre-2026-07-21 art (site only — the new gem art looked frayed at small sizes); Book still uses the new gem-set icon
  "emerald-garden": { stem: "emerald", isPlaceholder: false, visualScale: 1.0 }, // 2026-07-21: new crystal-gem set
  "golden-sunshine": { stem: "golden", isPlaceholder: false, visualScale: 1.0 }, // 2026-07-21: new crystal-gem set
  "aurora-dream": { stem: "rainbow", isPlaceholder: false, visualScale: 1.0 }, // 2026-07-21: new crystal-gem set ("aurora" direction)
};

export interface ButterflyAsset {
  src: string;
  width: number;
  height: number;
  /** True if this is a stand-in for art that hasn't been generated yet. */
  isPlaceholder: boolean;
  /** See ButterflyAssetEntry.visualScale above. */
  visualScale: number;
}

/**
 * Resolve a butterfly type + desired size to an actual image to render.
 * Falls back through size variants (large -> medium -> small) if the
 * requested size doesn't exist for that file stem yet.
 */
export function getButterflyAsset(
  type: ButterflyType,
  size: ButterflySize = "medium"
): ButterflyAsset {
  const entry = BUTTERFLY_ASSET_MAP[type];
  const sizeOrder: ButterflySize[] = ["large", "medium", "small"];
  const startIndex = sizeOrder.indexOf(size);
  const orderedSizes = [...sizeOrder.slice(startIndex), ...sizeOrder.slice(0, startIndex)];

  for (const candidateSize of orderedSizes) {
    const key = `${entry.stem}_${candidateSize}`;
    const dims = SOURCE_SIZE[key];
    if (dims) {
      return {
        src: `/images/butterflies/${key}.png`,
        width: dims.w,
        height: dims.h,
        isPlaceholder: entry.isPlaceholder,
        visualScale: entry.visualScale,
      };
    }
  }

  // Should be unreachable given every stem has at least a _medium entry,
  // but fall back to a known-good asset rather than crash the page.
  const fallback = SOURCE_SIZE["pink_medium"];
  return {
    src: "/images/butterflies/pink_medium.png",
    width: fallback.w,
    height: fallback.h,
    isPlaceholder: true,
    visualScale: 1,
  };
}

/** True if this type is still waiting on its dedicated art asset. */
export function isPlaceholderAsset(type: ButterflyType): boolean {
  return BUTTERFLY_ASSET_MAP[type].isPlaceholder;
}
