"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Floating butterfly decoration for the Top Page (①), built from material
 * 01_crystal_butterflies_3color_3size.png (see README_inventory.md).
 *
 * Replaces the placeholder CrystalButterflySVG per redesign spec v2.9 §4.4 /
 * §5 ("SVGの蝶をそのまま使い続けない"). Kept intentionally sparse (6 butterflies)
 * so the decoration stays "控えめ" (restrained) per §1.3 and doesn't fight the
 * stat cards / CTA for attention.
 */

interface DecorButterfly {
  id: number;
  src: string;
  width: number;
  height: number;
  top: string;
  left: string;
  scale: number;
  delay: number;
  duration: number;
  flip?: boolean;
}

// Natural pixel dimensions of the cropped source assets, used so next/image
// never has to guess an aspect ratio.
const SOURCE_SIZE: Record<string, { w: number; h: number }> = {
  pink_large: { w: 344, h: 301 },
  pink_medium: { w: 249, h: 301 },
  pink_small: { w: 195, h: 301 },
  tiffany_large: { w: 355, h: 291 },
  tiffany_medium: { w: 242, h: 291 },
  tiffany_small: { w: 176, h: 291 },
};

function asset(name: keyof typeof SOURCE_SIZE) {
  const { w, h } = SOURCE_SIZE[name];
  return { src: `/images/butterflies/${name}.png`, width: w, height: h };
}

const BUTTERFLIES: DecorButterfly[] = [
  { id: 0, ...asset("tiffany_small"), top: "2%", left: "78%", scale: 0.26, delay: 1.1, duration: 6.5, flip: true },
  { id: 1, ...asset("pink_small"), top: "16%", left: "85%", scale: 0.22, delay: 2.4, duration: 8 },
  { id: 2, ...asset("tiffany_small"), top: "42%", left: "2%", scale: 0.24, delay: 0.6, duration: 7, flip: true },
  { id: 3, ...asset("pink_small"), top: "58%", left: "88%", scale: 0.2, delay: 3, duration: 6.8 },
  { id: 4, ...asset("tiffany_small"), top: "74%", left: "4%", scale: 0.22, delay: 1.8, duration: 7.2, flip: true },
];

export default function TopPageButterflyDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {BUTTERFLIES.map((b) => (
        <motion.span
          key={b.id}
          className="absolute"
          style={{
            top: b.top,
            left: b.left,
            width: b.width * b.scale,
            height: b.height * b.scale,
            transform: b.flip ? "scaleX(-1)" : undefined,
          }}
          animate={{
            y: [0, -14, 0],
            x: [0, 6, 0],
            rotate: [0, 4, -3, 0],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src={b.src}
            alt=""
            width={b.width}
            height={b.height}
            className="h-full w-full object-contain"
            style={{ filter: "drop-shadow(0 4px 10px rgba(255, 158, 199, 0.25))" }}
            priority={false}
          />
        </motion.span>
      ))}
    </div>
  );
}
