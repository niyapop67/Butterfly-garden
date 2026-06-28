import Image from "next/image";

interface Milestone {
  threshold: number;
  label: string;
  /** Rose medallion badge (2026-06-28 asset drop) — self-contained
   *  illustration that already bakes in the circular frame, ribbon, and
   *  "X匹" count text, so no separate icon/emoji + label scheme is needed
   *  anymore. See public/images/icons/stage_rose_*.png. */
  icon: { src: string; width: number; height: number };
}

const MILESTONES: Milestone[] = [
  { threshold: 15, label: "最初のつぼみ", icon: { src: "/images/icons/stage_rose_15.png", width: 405, height: 454 } },
  { threshold: 30, label: "ガーデン誕生", icon: { src: "/images/icons/stage_rose_30.png", width: 405, height: 456 } },
  { threshold: 50, label: "花が咲き始める", icon: { src: "/images/icons/stage_rose_50.png", width: 404, height: 457 } },
  { threshold: 80, label: "噴水が起動", icon: { src: "/images/icons/stage_rose_80.png", width: 404, height: 460 } },
  { threshold: 100, label: "クリスタル覚醒", icon: { src: "/images/icons/stage_rose_100.png", width: 402, height: 457 } },
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
      <div className="-mx-1 overflow-x-auto px-1">
        <div className="flex w-max items-end gap-3 pb-1">
          {MILESTONES.map((m) => {
            const reached = totalButterflies >= m.threshold;
            return (
              <div
                key={m.threshold}
                title={m.label}
                className={`flex-shrink-0 transition-all duration-500 ${
                  reached ? "animate-gentle-float drop-shadow-[0_0_14px_rgba(255,182,217,0.55)]" : "opacity-35 grayscale"
                }`}
                style={{ width: 72 }}
              >
                <Image
                  src={m.icon.src}
                  alt={`${m.threshold}匹で${m.label}`}
                  width={m.icon.width}
                  height={m.icon.height}
                  sizes="72px"
                  className="h-auto w-full object-contain"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
