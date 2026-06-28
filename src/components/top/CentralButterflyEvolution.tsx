"use client";

import { motion } from "framer-motion";

/**
 * Central evolving crystal butterfly (v2.8 spec §1.9–1.11, "確定・重要仕様変更").
 *
 * This is the TOP PAGE's hero centerpiece — distinct from
 * EvolutionMilestoneTracker (the row of rose badges, which is a separate
 * decorative milestone collection shown lower on the page). This one
 * butterfly visually evolves through 4 named stages as participation
 * grows, with a supplementary percent readout (10/40/60/80/100%, per
 * §1.9) and is force-completed on the birthday itself or in Niya's preview
 * mode (logic lives server-side in src/app/page.tsx — this component just
 * renders whatever percent/level it's given).
 */

export type EvolutionLevel = 0 | 1 | 2 | 3 | 4;

const LEVEL_INFO: Record<EvolutionLevel, { name: string; percent: number }> = {
  0: { name: "ガーデンの種", percent: 10 },
  1: { name: "Garden Opened", percent: 40 },
  2: { name: "Butterfly Bloom", percent: 60 },
  3: { name: "Twinkle Stage", percent: 80 },
  4: { name: "Crystal Butterfly Complete", percent: 100 },
};

const LEVEL_NAME_JA: Record<EvolutionLevel, string> = {
  0: "これからガーデンが始まります",
  1: "小さな蝶たちが集まり、ガーデンが生まれました",
  2: "花が咲き、蝶たちの輝きが増しています",
  3: "想いが重なり、中央の蝶が輝き出しました",
  4: "すべての想いがひとつになりました",
};

export function levelFromCount(count: number): EvolutionLevel {
  if (count >= 100) return 4;
  if (count >= 80) return 3;
  if (count >= 50) return 2;
  if (count >= 30) return 1;
  return 0;
}

interface CentralButterflyEvolutionProps {
  totalButterflies: number;
  /** True when today >= 2026-08-23 JST, or Niya's ?preview= key matched.
   * Computed server-side in src/app/page.tsx so the preview secret itself
   * never ships to client JS. */
  forcedComplete: boolean;
}

export default function CentralButterflyEvolution({
  totalButterflies,
  forcedComplete,
}: CentralButterflyEvolutionProps) {
  const level: EvolutionLevel = forcedComplete ? 4 : levelFromCount(totalButterflies);
  const { name, percent } = LEVEL_INFO[level];

  // Visual intensity scales with level: pale/simple at 0, full crystal
  // multi-hue glow at 4. Reuses the same wing geometry as
  // GiantCrystalButterfly (birthday page) so it reads as the same
  // "species" evolving over time rather than a different illustration.
  const saturation = [0.35, 0.55, 0.75, 0.9, 1][level];
  const glow = [0, 6, 14, 22, 32][level];
  const sparkleCount = [0, 1, 2, 4, 6][level];
  const scale = [0.8, 0.86, 0.93, 1, 1.08][level];

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: 132 * scale, height: 116 * scale }}
      >
        <svg
          viewBox="0 0 64 56"
          width="100%"
          height="100%"
          role="img"
          aria-label={`ガーデンの進化段階: ${name}（${percent}%）`}
          style={{
            filter: glow
              ? `drop-shadow(0 0 ${glow}px rgba(201,168,224,0.6)) drop-shadow(0 0 ${glow * 1.6}px rgba(255,111,168,0.4))`
              : "none",
          }}
        >
          <defs>
            <linearGradient id="centralWingL" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffd9e8" />
              <stop offset="50%" stopColor="#ff9ec7" stopOpacity={saturation} />
              <stop offset="100%" stopColor="#c9a8e0" stopOpacity={saturation} />
            </linearGradient>
            <linearGradient id="centralWingR" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff3d6" />
              <stop offset="50%" stopColor="#81d8d0" stopOpacity={saturation} />
              <stop offset="100%" stopColor="#ff9ec7" stopOpacity={saturation} />
            </linearGradient>
          </defs>

          <path d="M32 28 C24 6 2 2 1 13 C0 24 14 33 32 28 Z" fill="url(#centralWingL)" opacity={0.5 + saturation * 0.5} />
          <path d="M32 28 C40 6 62 2 63 13 C64 24 50 33 32 28 Z" fill="url(#centralWingR)" opacity={0.5 + saturation * 0.5} />
          <path d="M32 29 C26 41 10 47 9 40 C8 33 18 29 32 29 Z" fill="url(#centralWingL)" opacity={0.4 + saturation * 0.45} />
          <path d="M32 29 C38 41 54 47 55 40 C56 33 46 29 32 29 Z" fill="url(#centralWingR)" opacity={0.4 + saturation * 0.45} />

          {sparkleCount > 0 && (
            <g opacity={0.85}>
              {Array.from({ length: sparkleCount }).map((_, i) => {
                const sx = 10 + ((i * 9) % 44);
                const sy = 8 + ((i * 13) % 36);
                return <circle key={i} cx={sx} cy={sy} r={0.9} fill="#fff" />;
              })}
            </g>
          )}

          <rect x="30.6" y="13" width="2.8" height="26" rx="1.4" fill="#5a4f6e" opacity={0.7} />
          <circle cx="32" cy="12" r="2.4" fill="#fff" opacity={0.9} />
        </svg>
      </motion.div>

      <p className="mt-2 font-display text-2xl" style={{ color: "#ff6fa8" }}>
        {percent}%
      </p>
      {level > 0 && (
        <p className="font-body text-[11px] font-semibold tracking-wide" style={{ color: "#a78bdb" }}>
          Lv.{level} {name}
        </p>
      )}
      <p className="mt-1 max-w-[220px] text-center font-body text-[11px] leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
        {LEVEL_NAME_JA[level]}
      </p>
    </div>
  );
}
