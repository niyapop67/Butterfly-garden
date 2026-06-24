"use client";

import { motion } from "framer-motion";

interface DecorButterfly {
  emoji: string;
  top: string;
  left: string;
  delay: number;
  size: string;
}

const BUTTERFLIES: DecorButterfly[] = [
  { emoji: "🦋", top: "8%", left: "12%", delay: 0, size: "text-2xl" },
  { emoji: "🦋", top: "14%", left: "82%", delay: 1.2, size: "text-xl opacity-70" },
  { emoji: "🦋", top: "68%", left: "6%", delay: 2.1, size: "text-lg opacity-60" },
];

export default function FloatingButterflyDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {BUTTERFLIES.map((b, i) => (
        <motion.span
          key={i}
          className={`absolute ${b.size}`}
          style={{ top: b.top, left: b.left }}
          animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
          transition={{
            duration: 6,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {b.emoji}
        </motion.span>
      ))}
    </div>
  );
}
