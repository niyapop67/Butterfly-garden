"use client";

import Image from "next/image";
import type { ButterflyType } from "@/types/submission";
import { getButterflyAsset, type ButterflySize } from "@/lib/butterflyAssets";

interface ButterflyImageProps {
  type: ButterflyType;
  size?: ButterflySize;
  className?: string;
  /** Pixel width to render at. Height is derived from the source aspect ratio. */
  displayWidth?: number;
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
}: ButterflyImageProps) {
  const asset = getButterflyAsset(type, size);
  const displayHeight = displayWidth * (asset.height / asset.width);

  return (
    <Image
      src={asset.src}
      alt=""
      width={asset.width}
      height={asset.height}
      sizes={`${displayWidth}px`}
      style={{ width: displayWidth, height: displayHeight }}
      className={`object-contain ${className}`}
    />
  );
}
