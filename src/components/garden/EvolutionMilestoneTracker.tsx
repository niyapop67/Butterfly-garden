"use client";

/**
 * Rose growth visual (2026-07-03 rewrite).
 *
 * Previously this rendered 5 pre-made medallion PNGs (stage_rose_15/30/50/
 * 80/100.png) that bake the "X匹" count directly into the artwork. Niya
 * asked to drop the numeric counts entirely now that the site's audience is
 * a small, known fandom rather than the general public — only the rose's
 * bloom state should show, no numbers anywhere in this section.
 *
 * The old assets can't be relabeled in code (the numbers are pixels, not
 * text), and the new thresholds (5/10/15/20/30) don't match the old ones
 * (15/30/50/80/100) anyway, so this is a fresh, code-drawn visual instead of
 * new artwork: a row of five rose glyphs that bloom in color/scale as each
 * threshold is reached, finishing as a small bouquet. No external image
 * assets, so it ships without waiting on a new ChatGPT art drop — swap in
 * real illustrations later if/when those exist.
 *
 * `forcedComplete`: on/after the reveal date (2026-08-23 JST) — or with the
 * Niya-only ?preview= key — every stage shows fully bloomed regardless of
 * the real submission count, so the birthday view always reads as "complete"
 * even if the 30-threshold wasn't actually reached.
 */

const STAGES = [
  { threshold: 5 },
  { threshold: 10 },
  { threshold: 15 },
  { threshold: 20 },
  { threshold: 30 },
] as const;

interface EvolutionMilestoneTrackerProps {
  totalButterflies: number;
  forcedComplete?: boolean;
}

export default function EvolutionMilestoneTracker({
  totalButterflies,
  forcedComplete = false,
}: EvolutionMilestoneTrackerProps) {
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1.5 px-1">
        {STAGES.map((s, i) => {
          const reached = forcedComplete || totalButterflies >= s.threshold;
          const isFinal = i === STAGES.length - 1;
          const scale = 0.62 + i * 0.1;
          return (
            <div key={s.threshold} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`transition-all duration-500 ${reached ? "drop-shadow-[0_0_10px_rgba(255,182,217,0.6)]" : "grayscale opacity-30"}`}
                style={{ fontSize: `${scale * 1.6}rem`, lineHeight: 1 }}
              >
                {isFinal ? "💐" : "🌹"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
