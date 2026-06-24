interface StatCounterProps {
  icon: string;
  label: string;
  value: number;
  colorClass: string;
}

function StatItem({ icon, label, value, colorClass }: StatCounterProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <span className="font-body text-xs text-[#8b8398]">{label}</span>
      <span className={`font-display-jp text-3xl font-semibold ${colorClass}`}>
        {value}
        <span className="ml-0.5 text-base font-body">{label === "Voices" ? "件" : "匹"}</span>
      </span>
    </div>
  );
}

interface GardenStatsBarProps {
  totalButterflies: number;
  totalMessages: number;
  totalVoices: number;
}

export default function GardenStatsBar({
  totalButterflies,
  totalMessages,
  totalVoices,
}: GardenStatsBarProps) {
  return (
    <div className="w-full">
      <p className="mb-3 text-center font-body text-xs tracking-wider text-[#8b8398]">
        ── 現在のガーデンの様子 ──
      </p>
      <div className="flex items-stretch justify-between gap-2 rounded-2xl bg-white/35 px-4 py-4">
        <StatItem icon="🦋" label="Butterflies" value={totalButterflies} colorClass="text-[#e08bb0]" />
        <div className="w-px bg-white/70" aria-hidden />
        <StatItem icon="✉️" label="Messages" value={totalMessages} colorClass="text-[#5cb8af]" />
        <div className="w-px bg-white/70" aria-hidden />
        <StatItem icon="🎙️" label="Voices" value={totalVoices} colorClass="text-[#a78bdb]" />
      </div>
    </div>
  );
}
