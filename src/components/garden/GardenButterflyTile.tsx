"use client";

import { motion, AnimatePresence } from "framer-motion";
import ButterflyImage from "@/components/butterfly/ButterflyImage";
import type { GardenEntry } from "@/lib/useGardenFeed";

interface GardenButterflyTileProps {
  entry: GardenEntry;
  /** Deterministic 0..1 value derived from entry.id, used to vary float
   * timing/rotation per-tile so the grid feels alive without any two tiles
   * moving in lockstep. See hashToUnit() in GardenFeed.tsx. */
  variance: number;
  isRevealed: boolean;
  onToggle: () => void;
}

/**
 * One participant's butterfly in the garden grid. Tapping reveals the
 * nickname only (spec v2.9 diff §3 — "ニックネームのみ表示", GATE 1
 * territory). Message text and voice playback are intentionally not
 * wired up here at all; they belong to the chapter-6 Private Experience
 * behind GATE 2.
 */
export default function GardenButterflyTile({
  entry,
  variance,
  isRevealed,
  onToggle,
}: GardenButterflyTileProps) {
  const duration = 5 + variance * 3; // 5–8s
  const delay = variance * 2.4;
  const rotate = -6 + variance * 12; // -6..6deg resting tilt

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        type="button"
        onClick={onToggle}
        aria-label={isRevealed ? entry.nickname : "蝶をタップしてニックネームを見る"}
        className="relative flex items-center justify-center"
        style={{ width: 64, height: 64 }}
        animate={{ y: [0, -8, 0], rotate: [rotate, rotate + 4, rotate] }}
        transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
        whileTap={{ scale: 0.9 }}
      >
        <ButterflyImage type={entry.butterflyType} size="small" displayWidth={56} />
        {entry.hasVoice && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-[8px] shadow-glass-soft"
            title="ボイス付き"
          >
            🎙️
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            className="absolute top-[58px] z-20 whitespace-nowrap rounded-full border border-white/70 bg-white/95 px-3 py-1 font-body text-[11px] shadow-glass-soft"
            style={{ color: "var(--color-ink)" }}
          >
            {entry.nickname || "（名前未設定）"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
