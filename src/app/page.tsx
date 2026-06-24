import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";
import CrystalIcon from "@/components/ui/CrystalIcon";
import GardenStatsBar from "@/components/garden/GardenStatsBar";
import EvolutionMilestoneTracker from "@/components/garden/EvolutionMilestoneTracker";
import FloatingButterflyDecor from "@/components/butterfly/FloatingButterflyDecor";

const placeholderStats = {
  totalButterflies: 47,
  totalMessages: 47,
  totalVoices: 41,
};

export default function TopPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 pb-12 pt-6">
      <FloatingButterflyDecor />

      <header className="relative z-10 mb-10 flex items-center justify-between">
        <button
          type="button"
          aria-label="メニューを開く"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/50 backdrop-blur-md shadow-glass-soft"
        >
          <span className="sr-only">メニュー</span>
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden>
            <path d="M0 1H20M0 7H20M0 13H20" stroke="#a78bdb" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <Link
          href="/garden"
          className="flex items-center gap-1.5 rounded-full bg-white/60 px-4 py-2 font-body text-xs font-bold text-[#5cb8af] shadow-glass-soft backdrop-blur-md"
        >
          ガーデンを見る <CrystalIcon size={16} />
        </Link>
      </header>

      <section className="relative z-10 mb-10 text-center">
        <div className="relative mx-auto max-w-xs pb-6 pt-4">
          <span
            aria-hidden
            className="absolute -left-2 -top-2 h-8 w-8 border-l-2 border-t-2 rounded-tl-2xl"
            style={{ borderColor: "rgba(232,193,112,0.55)" }}
          />
          <span
            aria-hidden
            className="absolute -right-2 -top-2 h-8 w-8 border-r-2 border-t-2 rounded-tr-2xl"
            style={{ borderColor: "rgba(232,193,112,0.55)" }}
          />
          <span
            aria-hidden
            className="absolute -left-2 -bottom-2 h-8 w-8 border-l-2 border-b-2 rounded-bl-2xl"
            style={{ borderColor: "rgba(232,193,112,0.55)" }}
          />
          <span
            aria-hidden
            className="absolute -right-2 -bottom-2 h-8 w-8 border-r-2 border-b-2 rounded-br-2xl"
            style={{ borderColor: "rgba(232,193,112,0.55)" }}
          />

          <h1
            className="font-display text-5xl italic leading-tight glow-text-gold"
            style={{ color: "#5a4f6e" }}
          >
            Butterfly Garden
          </h1>
          <p className="mt-1 font-display text-2xl italic" style={{ color: "#ff6fa8" }}>
            for MIKA
          </p>
        </div>

        <p className="mx-auto mt-2 max-w-xs font-display-jp text-sm leading-relaxed text-[#6b6378]">
          みんなの想いが蝶になって、
          <br />
          MIKAのための特別なガーデンをつくります。
        </p>
      </section>

      <section className="relative z-10 mb-6">
        <GlassCard className="px-5 py-6">
          <div className="divider-ornament mb-4 font-display-jp text-xs text-[#6b6378]">現在のガーデンの様子</div>
          <GardenStatsBar
            totalButterflies={placeholderStats.totalButterflies}
            totalMessages={placeholderStats.totalMessages}
            totalVoices={placeholderStats.totalVoices}
          />
        </GlassCard>
      </section>

      <section className="relative z-10 mb-8">
        <GlassCard className="px-5 py-6">
          <EvolutionMilestoneTracker totalButterflies={placeholderStats.totalButterflies} />
        </GlassCard>
      </section>

      <section className="relative z-10 mb-8 flex justify-center">
        <Link href="/submit" className="w-full max-w-xs">
          <CrystalButton className="w-full">
            <CrystalIcon size={20} />
            蝶を届ける
            <span className="block text-[11px] font-normal opacity-90">メッセージを送る</span>
          </CrystalButton>
        </Link>
      </section>

      <section className="relative z-10">
        <GlassCard className="px-6 py-6 text-center">
          <p className="mb-2 font-display-jp text-sm font-semibold text-[#5a4f6e]">このプロジェクトについて</p>
          <p className="font-body text-xs leading-relaxed text-[#6b6378]">
            ファンの皆さんのメッセージやボイスが蝶になり、MIKAだけの特別なガーデンに集まります。
            誕生日当日、蝶たちはひとつになり、最高のサプライズをお届けします。
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
