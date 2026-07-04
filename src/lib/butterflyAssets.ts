/**
 * Butterfly asset mapping: ButterflyType -> actual PNG files on disk.
 *
 * WHY THIS FILE EXISTS:
 * Spec v2.9 §1.8 defines 7 official butterfly types, but as of 2026-06-26
 * only 4 colour assets exist in public/images/butterflies/ (pink,
 * pinkpurple, purple, tiffany — see README_inventory.md). Crystal White,
 * Emerald Garden, and Golden Sunshine PNGs are still being generated.
 *
 * Rather than block the submit-page build on missing art, every component
 * that renders a butterfly (ButterflyImage, ButterflySelector, garden tiles,
 * etc.) takes a `ButterflyType` prop and looks up its file through
 * `getButterflyAsset()` below. To swap in the final art once it's ready:
 *
 *   1. Drop the new PNGs into public/images/butterflies/
 *      (e.g. crystal_large.png, crystal_medium.png, crystal_small.png)
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
  pink_large: { w: 344, h: 301 },
  pink_medium: { w: 249, h: 301 },
  pink_small: { w: 195, h: 301 },
  pinkpurple_large: { w: 245, h: 302 }, // no dedicated _large source yet; reuses medium dims
  pinkpurple_medium: { w: 245, h: 302 },
  pinkpurple_small: { w: 177, h: 302 },
  purple_large: { w: 248, h: 288 }, // no dedicated _large source yet; reuses medium dims
  purple_medium: { w: 248, h: 288 },
  purple_small: { w: 248, h: 288 }, // no dedicated _small source yet; reuses medium dims
  tiffany_large: { w: 355, h: 291 },
  tiffany_medium: { w: 242, h: 291 },
  tiffany_small: { w: 176, h: 291 },
  // 2026-07-05: first of the 3 pending real assets landed.
  crystal_large: { w: 350, h: 380 },
  crystal_medium: { w: 250, h: 271 },
  crystal_small: { w: 180, h: 195 },
};

/**
 * Which file stem each of the 7 official types currently points to.
 *
 * `isPlaceholder: true` means this is borrowing another colour's art
 * temporarily — swap the `stem` once the real asset for that type lands.
 */
interface ButterflyAssetEntry {
  stem: string;
  isPlaceholder: boolean;
}

const BUTTERFLY_ASSET_MAP: Record<ButterflyType, ButterflyAssetEntry> = {
  "pink-heart": { stem: "pink", isPlaceholder: false },
  "tiffany-sky": { stem: "tiffany", isPlaceholder: false },
  "aurora-dream": { stem: "purple", isPlaceholder: false },
  "twinkle-premium": { stem: "pinkpurple", isPlaceholder: false },

  // Pending real assets (spec v2.9 §1.8 / chat log 2026-06-26 §5):
  "crystal-white": { stem: "crystal", isPlaceholder: false }, // 2026-07-05: real art landed
  "emerald-garden": { stem: "purple", isPlaceholder: true },
  "golden-sunshine": { stem: "pink", isPlaceholder: true },
};

export interface ButterflyAsset {
  src: string;
  width: number;
  height: number;
  /** True if this is a stand-in for art that hasn't been generated yet. */
  isPlaceholder: boolean;
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
  };
}

/** True if this type is still waiting on its dedicated art asset. */
export function isPlaceholderAsset(type: ButterflyType): boolean {
  return BUTTERFLY_ASSET_MAP[type].isPlaceholder;
}
