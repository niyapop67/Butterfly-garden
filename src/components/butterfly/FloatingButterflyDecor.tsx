"use client";

import { motion } from "framer-motion";

interface DecorButterfly {
  id: number;
  top: string;
  left: string;
  delay: number;
  duration: number;
  size: number;
  gradId: string;
  flip?: boolean;
}

interface Petal {
  id: number;
  left: string;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
}

interface Sparkle {
  id: number;
  top: string;
  left: string;
  delay: number;
  size: number;
}

const GRADIENTS: Record<string, [string, string, string]> = {
  pinkHeart: ["#ffd9e8", "#ff9ec7", "#ff6fa8"],
  tiffanySky: ["#e3fbf7", "#9fe8df", "#4fb8ae"],
  auroraDream: ["#f0e3fb", "#c9a8e0", "#9f7fd0"],
  goldenSunshine: ["#fff3d6", "#f0c869", "#e0a83f"],
  emeraldGarden: ["#e3f8ef", "#9fd8c4", "#5fb89a"],
  crystalWhite: ["#ffffff", "#e8eef5", "#cdd9ea"],
};
const GRAD_KEYS = Object.keys(GRADIENTS);

const BUTTERFLIES: DecorButterfly[] = Array.from({ length: 16 }).map((_, i) => ({
  id: i,
  top: `${3 + ((i * 19) % 90)}%`,
  left: `${(i * 27) % 95}%`,
  delay: (i % 8) * 0.7,
  duration: 6 + (i % 5),
  size: 26 + ((i * 9) % 30),
  gradId: GRAD_KEYS[i % GRAD_KEYS.length],
  flip: i % 2 === 0,
}));

const PETALS: Petal[] = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  left: `${(i * 31) % 96}%`,
  delay: (i % 6) * 1.4,
  duration: 12 + (i % 6) * 2,
  size: 10 + (i % 3) * 4,
  rotate: (i * 47) % 360,
}));

const SPARKLES: Sparkle[] = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  top: `${(i * 13) % 96}%`,
  left: `${(i * 41) % 96}%`,
  delay: (i % 9) * 0.5,
  size: 3 + (i % 3) * 2,
}));

function CrystalButterflySVG({ gradKey }: { gradKey: string }) {
  const [c1, c2, c3] = GRADIENTS[gradKey];
  const idL = `gL-${gradKey}`;
  const idR = `gR-${gradKey}`;
  return (
    <svg viewBox="0 0 64 56" width="100%" height="100%" style={{ filter: `drop-shadow(0 2px 6px ${c2}99)` }}>
      <defs>
        <linearGradient id={idL} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="60%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
        <linearGradient id={idR} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="60%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
      </defs>
      <path d="M32 28 C24 6 2 2 1 13 C0 24 14 33 32 28 Z" fill={`url(#${idL})`} />
      <path d="M32 28 C40 6 62 2 63 13 C64 24 50 33 32 28 Z" fill={`url(#${idR})`} />
      <path d="M32 29 C26 41 10 47 9 40 C8 33 18 29 32 29 Z" fill={`url(#${idL})`} opacity="0.85" />
      <path d="M32 29 C38 41 54 47 55 40 C56 33 46 29 32 29 Z" fill={`url(#${idR})`} opacity="0.85" />
      <path
        d="M14 11 L18 16 M50 11 L46 16 M10 28 L17 30 M54 28 L47 30 M14 38 L19 35 M50 38 L45 35"
        stroke="#fff"
        strokeWidth="0.9"
        opacity="0.6"
        strokeLinecap="round"
      />
      <rect x="30.5" y="13" width="3" height="29" rx="1.5" fill="#5a4f6e" />
      <circle cx="32" cy="12" r="2.6" fill="#5a4f6e" />
    </svg>
  );
}

function PetalSVG() {
  return (
    <svg viewBox="0 0 20 20" width="100%" height="100%">
      <path
        d="M10 1 C14 1 18 5 18 10 C18 15 14 19 10 19 C6 19 2 15 2 10 C2 5 6 1 10 1 Z"
        fill="#ffc1da"
        opacity="0.85"
      />
      <path d="M10 1 C12 5 12 15 10 19" stroke="#ff9ec7" strokeWidth="0.6" opacity="0.6" fill="none" />
    </svg>
  );
}

export default function FloatingButterflyDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {SPARKLES.map((s) => (
        <motion.span
          key={`sparkle-${s.id}`}
          className="absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: "radial-gradient(circle, #fff 0%, #f0c869 60%, transparent 100%)",
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2.5, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {PETALS.map((p) => (
        <motion.span
          key={`petal-${p.id}`}
          className="absolute"
          style={{ top: "-5%", left: p.left, width: p.size, height: p.size }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, 30, -20, 0],
            rotate: [p.rotate, p.rotate + 180, p.rotate + 360],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          <PetalSVG />
        </motion.span>
      ))}

      {BUTTERFLIES.map((b) => (
        <motion.span
          key={`butterfly-${b.id}`}
          className="absolute"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size * 0.85,
            transform: b.flip ? "scaleX(-1)" : undefined,
          }}
          animate={{
            y: [0, -18, 0],
            x: [0, 8, 0],
            rotate: [0, 6, -4, 0],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <CrystalButterflySVG gradKey={b.gradId} />
        </motion.span>
      ))}
    </div>
  );
}
