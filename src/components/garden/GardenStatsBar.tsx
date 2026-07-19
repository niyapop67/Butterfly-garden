import Image from "next/image";

interface StatCounterProps {
  iconSrc: string;
  iconWidth: number;
  iconHeight: number;
  label: string;
  value: number;
  colorClass: string;
}

function StatItem({ iconSrc, iconWidth, iconHeight, value, colorClass }: StatCounterProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/85 shadow-sm">
        <Image
          src={iconSrc}
          alt=""
          width={iconWidth}
          height={iconHeight}
          sizes="36px"
          aria-hidden
          className="h-9 w-9 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
        />
      </div>
      <span className={`font-display-jp text-lg font-semibold ${colorClass}`}>{value}</span>
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
      <div className="flex items-stretch justify-between gap-2 rounded-2xl bg-white/15 px-4 py-4 shadow-sm">
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
