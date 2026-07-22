"use client";

import Image from "next/image";
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

  return (
    <Image
      src={asset.src}
      alt=""
      width={asset.width}
      height={asset.height}
      sizes={`${displayWidth}px`}
      style={{ width: displayWidth, height: resolvedHeight }}
      className={`object-contain ${className}`}
    />
  );
}
