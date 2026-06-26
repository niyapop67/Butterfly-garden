import Image from "next/image";

interface StatCounterProps {
  iconSrc: string;
  iconWidth: number;
  iconHeight: number;
  label: string;
  value: number;
  colorClass: string;
}

function StatItem({ iconSrc, iconWidth, iconHeight, label, value, colorClass }: StatCounterProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <Image
        src={iconSrc}
        alt=""
        width={iconWidth}
        height={iconHeight}
        aria-hidden
        className="h-6 w-6 object-contain"
      />
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
      <div className="flex items-stretch justify-between gap-2 rounded-2xl bg-white/25 px-4 py-4">
        <StatItem
          iconSrc="/images/icons/icon_butterfly.png"
          iconWidth={301}
          iconHeight={287}
          label="Butterflies"
          value={totalButterflies}
          colorClass="text-[#e08bb0]"
        />
        <div className="w-px bg-white/70" aria-hidden />
        <StatItem
          iconSrc="/images/icons/icon_envelope.png"
          iconWidth={365}
          iconHeight={287}
          label="Messages"
          value={totalMessages}
          colorClass="text-[#5cb8af]"
        />
        <div className="w-px bg-white/70" aria-hidden />
        <StatItem
          iconSrc="/images/icons/icon_mic.png"
          iconWidth={220}
          iconHeight={287}
          label="Voices"
          value={totalVoices}
          colorClass="text-[#a78bdb]"
        />
      </div>
    </div>
  );
}
