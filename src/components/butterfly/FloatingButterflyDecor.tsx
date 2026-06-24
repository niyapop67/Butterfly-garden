"use client";

import { motion } from "framer-motion";

interface DecorButterfly {
  id: number;
  top: string;
  left: string;
  delay: number;
  duration: number;
  size: number;
  color: string;
  glow: string;
  flip?: boolean;
}

const COLORS = [
  { color: "#ff8fc0", glow: "rgba(255,143,192,0.55)" }, // pink heart
  { color: "#7fd9d4", glow: "rgba(127,217,212,0.55)" }, // tiffany sky
  { color: "#c9a8e0", glow: "rgba(201,168,224,0.5)" }, // aurora dream
  { color: "#f0c869", glow: "rgba(240,200,105,0.5)" }, // golden sunshine
  { color: "#9fd8c4", glow: "rgba(159,216,196,0.5)" }, // emerald garden
  { color: "#e8eef5", glow: "rgba(232,238,245,0.6)" }, // crystal white
];

const BUTTERFLIES: DecorButterfly[] = Array.from({ length: 14 }).map((_, i) => {
  const c = COLORS[i % COLORS.length];
  return {
    id: i,
    top: `${4 + ((i * 17) % 88)}%`,
    left: `${(i * 23) % 94}%`,
    delay: (i % 7) * 0.8,
    duration: 5 + (i % 5),
    size: 18 + ((i * 7) % 26),
    color: c.color,
    glow: c.glow,
    flip: i % 2 === 0,
  };
});

function CrystalButterflySVG({ color, glow }: { color: string; glow: string }) {
  return (
    <svg viewBox="0 0 64 56" width="100%" height="100%" style={{ filter: `drop-shadow(0 0 6px ${glow})` }}>
      <g opacity="0.95">
        <path
          d="M32 28 C24 8 4 4 2 14 C0 24 14 32 32 28 Z"
          fill={color}
          opacity="0.85"
        />
        <path
          d="M32 28 C40 8 60 4 62 14 C64 24 50 32 32 28 Z"
          fill={color}
          opacity="0.85"
        />
        <path
          d="M32 30 C26 40 12 46 10 40 C8 34 18 30 32 30 Z"
          fill={color}
          opacity="0.65"
        />
        <path
          d="M32 30 C38 40 52 46 54 40 C56 34 46 30 32 30 Z"
          fill={color}
          opacity="0.65"
        />
        <rect x="30.5" y="14" width="3" height="28" rx="1.5" fill="#fff" opacity="0.9" />
      </g>
    </svg>
  );
}

export default function FloatingButterflyDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {BUTTERFLIES.map((b) => (
        <motion.span
          key={b.id}
          className="absolute"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size * 0.85,
            transform: b.flip ? "scaleX(-1)" : undefined,
          }}
          animate={{
            y: [0, -16, 0],
            x: [0, 6, 0],
            rotate: [0, 6, -4, 0],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <CrystalButterflySVG color={b.color} glow={b.glow} />
        </motion.span>
      ))}
    </div>
  );
}
