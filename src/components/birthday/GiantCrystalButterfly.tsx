"use client";

import { motion } from "framer-motion";

/**
 * Hero visual for the Birthday page's revealed state (spec mockup §2.4:
 * "メインビジュアル：巨大なクリスタル蝶（全員の想いが結晶化した姿）").
 *
 * Built as an inline SVG (same construction as CrystalIcon.tsx /
 * FloatingButterflyDecor.tsx) rather than a new illustration asset — no
 * dedicated "giant crystal butterfly" art exists yet, and a multi-hued
 * gradient blending several of the 7 official butterfly-type colours
 * communicates "everyone's feelings combined into one" without needing new
 * art. Swap this component out for an Image-based version once/if a
 * dedicated illustration is generated; nothing else on the page needs to
 * change since callers just render <GiantCrystalButterfly />.
 */
export default function GiantCrystalButterfly() {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: 220, height: 193 }}
    >
      <svg
        viewBox="0 0 64 56"
        width="100%"
        height="100%"
        role="img"
        aria-label="全員の想いが結晶になった、大きなクリスタルの蝶"
        style={{ filter: "drop-shadow(0 0 28px rgba(201,168,224,0.55)) drop-shadow(0 0 50px rgba(255,111,168,0.35))" }}
      >
        <defs>
          <linearGradient id="giantWingL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd9e8" />
            <stop offset="35%" stopColor="#ff9ec7" />
            <stop offset="65%" stopColor="#c9a8e0" />
            <stop offset="100%" stopColor="#81d8d0" />
          </linearGradient>
          <linearGradient id="giantWingR" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff3d6" />
            <stop offset="35%" stopColor="#e8c170" />
            <stop offset="65%" stopColor="#81d8d0" />
            <stop offset="100%" stopColor="#ff9ec7" />
          </linearGradient>
          <radialGradient id="giantCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#ffe9f2" />
          </radialGradient>
        </defs>

        <path d="M32 28 C24 6 2 2 1 13 C0 24 14 33 32 28 Z" fill="url(#giantWingL)" />
        <path d="M32 28 C40 6 62 2 63 13 C64 24 50 33 32 28 Z" fill="url(#giantWingR)" />
        <path d="M32 29 C26 41 10 47 9 40 C8 33 18 29 32 29 Z" fill="url(#giantWingL)" opacity="0.88" />
        <path d="M32 29 C38 41 54 47 55 40 C56 33 46 29 32 29 Z" fill="url(#giantWingR)" opacity="0.88" />

        <path
          d="M12 10 L17 16 M52 10 L47 16 M8 29 L16 31 M56 29 L48 31 M12 40 L18 36 M52 40 L46 36"
          stroke="#fff"
          strokeWidth="0.9"
          opacity="0.65"
          strokeLinecap="round"
        />

        <rect x="30.3" y="12" width="3.4" height="30" rx="1.7" fill="#5a4f6e" />
        <circle cx="32" cy="11" r="3" fill="url(#giantCore)" stroke="#5a4f6e" strokeWidth="0.6" />
      </svg>
    </motion.div>
  );
}
