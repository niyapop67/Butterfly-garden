interface Milestone {
  threshold: number;
  label: string;
  emoji: string;
}

const MILESTONES: Milestone[] = [
  { threshold: 30, label: "ガーデン誕生", emoji: "🌸" },
  { threshold: 50, label: "花が咲き始める", emoji: "🌺" },
  { threshold: 80, label: "噴水が起動", emoji: "⛲" },
  { threshold: 100, label: "クリスタル覚醒", emoji: "💎" },
  { threshold: 150, label: "オーロラ降臨", emoji: "🌌" },
  { threshold: 200, label: "ガーデン満開", emoji: "✨" },
];

interface EvolutionMilestoneTrackerProps {
  totalButterflies: number;
}

export default function EvolutionMilestoneTracker({
  totalButterflies,
}: EvolutionMilestoneTrackerProps) {
  return (
    <div className="w-full">
      <p className="mb-1 text-center font-body text-xs tracking-wider text-[#8b8398]">
        ── ガーデンの成長 ──
      </p>
      <p className="mb-3 text-center font-body text-[11px] text-[#a89fb3]">
        みんなの想いでガーデンが進化していきます
      </p>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MILESTONES.map((m) => {
            const reached = totalButterflies >= m.threshold;
            return (
              <div key={m.threshold} className="flex shrink-0 basis-[17%] flex-col items-center gap-1">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg transition-all
                    ${reached
                      ? "border-baby-pink/70 bg-white/70 shadow-glow-pink animate-gentle-float"
                      : "border-crystal-silver/60 bg-white/20 opacity-50"}`}
                  title={m.label}
                >
                  {m.emoji}
                </div>
                <span className="font-body text-[10px] text-[#8b8398]">{m.threshold}匹</span>
              </div>
            );
          })}
        </div>
        {/* right-edge fade hints that the row scrolls further */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8"
          style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.55))" }}
        />
      </div>
    </div>
  );
}
