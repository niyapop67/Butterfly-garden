"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface GemPlacement {
  src: string;
  width: number;
  height: number;
  top: string;
  left: string;
  displayWidth: number;
  duration: number;
  delay: number;
  opacity: number;
}

const GEMS: GemPlacement[] = [
  {
    src: "/images/decor/gem_cluster_pink.png",
    width: 322,
    height: 251,
    top: "8%",
    left: "4%",
    displayWidth: 58,
    duration: 6.5,
    delay: 0,
    opacity: 0.85,
  },
  {
    src: "/images/decor/gem_cluster_blue.png",
    width: 329,
    height: 269,
    top: "14%",
    left: "76%",
    displayWidth: 64,
    duration: 7.5,
    delay: 0.8,
    opacity: 0.85,
  },
  {
    src: "/images/decor/gem_cluster_purple.png",
    width: 251,
    height: 271,
    top: "62%",
    left: "8%",
    displayWidth: 50,
    duration: 6,
    delay: 1.6,
    opacity: 0.7,
  },
  {
    src: "/images/decor/gem_cluster_purple.png",
    width: 251,
    height: 271,
    top: "70%",
    left: "80%",
    displayWidth: 46,
    duration: 8,
    delay: 0.4,
    opacity: 0.7,
  },
];

/**
 * Scattered crystal gem decoration for the Birthday page reveal (spec
 * mockup §2.4 "⑤クリスタル・宝石パーツ", 2026-06-28 asset drop). Sits
 * behind the main content (z-0) so it reads as ambient sparkle around
 * GiantCrystalButterfly rather than competing with it.
 */
export default function BirthdayGemDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {GEMS.map((g, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: g.top, left: g.left, width: g.displayWidth, opacity: g.opacity }}
          animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
          transition={{ duration: g.duration, delay: g.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={g.src}
            alt=""
            width={g.width}
            height={g.height}
            sizes={`${g.displayWidth}px`}
            className="h-auto w-full object-contain"
            style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.35))" }}
          />
        </motion.div>
      ))}
    </div>
  );
}
