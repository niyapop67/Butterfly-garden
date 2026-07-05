/**
 * Butterfly asset mapping: ButterflyType -> actual PNG files on disk.
 *
 * WHY THIS FILE EXISTS:
 * Spec v2.9 §1.8 originally defined 7 official butterfly types; as of
 * 2026-07-05 this is 6 — "twinkle-premium" was folded into "crystal-white"
 * (its generated art kept coming out indistinguishable from crystal-white's
 * pale/iridescent look, so rather than ship two near-identical pale types,
 * crystal-white's asset was replaced with the better of the two attempts
 * and twinkle-premium was removed as a separate type entirely). All 6
 * remaining types are being redone in a single consistent "crystal/gem"
 * illustration style (see docs prompts) rather than mixing the earlier
 * assorted styles. 5 are done (pink-heart, tiffany-sky, crystal-white,
 * emerald-garden, golden-sunshine); aurora-dream is still pending — its
 * first redo attempt came out visually identical to pink-heart and needs
 * another pass emphasizing shifting multi-colour/holographic hues (a
 * "rainbow butterfly" direction is being considered).
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
  // 2026-07-05: redone in the new crystal/gem style (replaces the earlier
  // pink_*/tiffany_* art).
  pink_large: { w: 350, h: 358 },
  pink_medium: { w: 250, h: 256 },
  pink_small: { w: 180, h: 184 },
  tiffany_large: { w: 350, h: 366 },
  tiffany_medium: { w: 250, h: 261 },
  tiffany_small: { w: 180, h: 188 },
  emerald_large: { w: 350, h: 414 },
  emerald_medium: { w: 250, h: 295 },
  emerald_small: { w: 180, h: 213 },
  golden_large: { w: 350, h: 406 },
  golden_medium: { w: 250, h: 290 },
  golden_small: { w: 180, h: 209 },
  // 2026-07-05: replaced (was a paler, less distinct crop — see the
  // twinkle-premium note at the top of this file).
  crystal_large: { w: 350, h: 377 },
  crystal_medium: { w: 250, h: 269 },
  crystal_small: { w: 180, h: 194 },

  // Still on the OLD (pre-2026-07-05) style — pending redo in the new
  // crystal/gem style. aurora-dream's first redo attempt was visually
  // identical to pink-heart and needs another pass (rainbow direction).
  purple_large: { w: 248, h: 288 }, // no dedicated _large source yet; reuses medium dims
  purple_medium: { w: 248, h: 288 },
  purple_small: { w: 248, h: 288 }, // no dedicated _small source yet; reuses medium dims
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
}

const BUTTERFLY_ASSET_MAP: Record<ButterflyType, ButterflyAssetEntry> = {
  "pink-heart": { stem: "pink", isPlaceholder: false }, // 2026-07-05: redone
  "tiffany-sky": { stem: "tiffany", isPlaceholder: false }, // 2026-07-05: redone
  "crystal-white": { stem: "crystal", isPlaceholder: false }, // 2026-07-05: new
  "emerald-garden": { stem: "emerald", isPlaceholder: false }, // 2026-07-05: new
  "golden-sunshine": { stem: "golden", isPlaceholder: false }, // 2026-07-05: new

  // Pending redo in the new crystal style:
  "aurora-dream": { stem: "purple", isPlaceholder: true }, // redo needed: first attempt looked identical to pink-heart
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
