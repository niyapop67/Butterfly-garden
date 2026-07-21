"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { ButterflyType } from "@/types/submission";
import { getButterflyAsset, type ButterflySize } from "@/lib/butterflyAssets";

interface ButterflyImageProps {
  type: ButterflyType;
  size?: ButterflySize;
  className?: string;
  /** Pixel width to render at. */
  displayWidth?: number;
  /**
   * Optional fixed pixel height. When omitted, height is derived from the
   * source image's own aspect ratio (fine for single-butterfly hero shots).
   * When rendering multiple types side by side — e.g. the 7-type picker
   * grid — pass the same displayHeight for every icon instead: the source
   * PNGs have noticeably different aspect ratios per colour (pink ~1.54,
   * purple ~1.16, tiffany ~1.65), so deriving height from each one's own
   * ratio made the 7 icons visibly different sizes next to each other even
   * at the same displayWidth. object-contain letterboxes within the fixed
   * box instead, so every icon occupies the same footprint.
   */
  displayHeight?: number;
}

/**
 * Renders one of the 7 official butterfly types (spec v2.9 §1.8) via
 * next/image. Which PNG file actually gets used is resolved through
 * getButterflyAsset() in src/lib/butterflyAssets.ts — see that file for how
 * to swap in final art for Crystal White / Emerald Garden / Golden Sunshine
 * without touching this component.
 */
export default function ButterflyImage({
  type,
  size = "medium",
  className = "",
  displayWidth = 80,
  displayHeight,
}: ButterflyImageProps) {
  const asset = getButterflyAsset(type, size);
  const resolvedHeight = displayHeight ?? displayWidth * (asset.height / asset.width);

  // crystal-white's art is a near-white/silver diamond butterfly (see
  // /home/claude notes: ~43% of its visible pixels are >230 on every
  // channel). Against the daytime garden's bright sky/clouds background
  // this nearly disappears, leaving only sparse fragments of its thin gold
  // wire outline visible — which reads as a broken dotted shape rather
  // than a butterfly. A soft dark drop-shadow keeps its silhouette legible
  // without changing its actual pale/icy coloring.
  const style: CSSProperties = { width: displayWidth, height: resolvedHeight };
  if (type === "crystal-white") {
    style.filter = "drop-shadow(0 1px 3px rgba(20, 20, 40, 0.35))";
  }

  return (
    <Image
      src={asset.src}
      alt=""
      width={asset.width}
      height={asset.height}
      sizes={`${displayWidth}px`}
      style={style}
      className={`object-contain ${className}`}
    />
  );
}
