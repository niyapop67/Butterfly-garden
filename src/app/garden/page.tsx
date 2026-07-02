"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useGardenFeed } from "@/lib/useGardenFeed";
import { useTimeOfDay } from "@/lib/useTimeOfDay";
import FreeFlyingGarden from "@/components/garden/FreeFlyingGarden";
import GardenStatsBar from "@/components/garden/GardenStatsBar";
import EvolutionMilestoneTracker from "@/components/garden/EvolutionMilestoneTracker";
import CrystalIcon from "@/components/ui/CrystalIcon";
import CrystalButton from "@/components/ui/CrystalButton";

export default function GardenPage() {
  const { entries, loading } = useGardenFeed();
  const totalVoices = entries.filter((e) => e.hasVoice).length;
  const time = useTimeOfDay();

  return (
    <main
      className="bg-garden-page relative min-h-screen overflow-hidden"
      style={{
        // Time-of-day lighting via CSS filter on the background pseudo-element
        "--time-bg-filter": time.bgFilter,
        "--time-ambient": time.ambientColor,
        "--time-ambient-opacity": String(time.ambientOpacity),
      } as CSSProperties}
    >
      {/* Ambient lighting overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 transition-colors duration-[3000ms]"
        style={{
          background: `rgba(${time.ambientColor}, ${time.ambientOpacity})`,
        }}
      />

      {/* Free-flying butterflies — full screen, behind UI */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <FreeFlyingGarden entries={entries} maxOnScreen={16} />
      </div>

      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-5 pt-6 pb-4">
        <Link
          href="/"
          aria-label="トップページへ戻る"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-glass-soft transition-all hover:bg-white/30"
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden>
            <path d="M9 1L1 8L9 15" stroke="#a78bdb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <div className="text-center">
          <h1 className="font-display italic text-lg leading-none" style={{ color: "var(--color-ink)" }}>
            Butterfly Garden
          </h1>
          <p className="font-body text-[10px] tracking-widest opacity-60 mt-0.5" style={{ color: "var(--color-ink)" }}>
            {time.labelJa}
          </p>
        </div>

        <Link
          href="/submit"
          aria-label="蝶を届ける"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-glass-soft transition-all hover:bg-white/30"
        >
          <CrystalIcon size={18} />
        </Link>
      </header>

      {/* Butterfly count — floating, minimal */}
      <div className="relative z-30 text-center mb-8 mt-2">
        {!loading && (
          <p className="font-display-jp text-sm" style={{ color: "var(--color-ink)" }}>
            <span className="text-3xl font-semibold" style={{ color: "var(--color-pink-deep)" }}>
              {entries.length}
            </span>
            <span className="ml-1 opacity-80">匹の蝶がガーデンに集まっています</span>
          </p>
        )}
      </div>

      {/* Stats — ultra-thin glass, bottom fixed area */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-6 flex flex-col gap-3 max-w-[430px] mx-auto">
        {/* Milestone tracker — very transparent */}
        <div className="rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-3">
          <EvolutionMilestoneTracker totalButterflies={entries.length} />
        </div>

        {/* Stats bar — very transparent */}
        <div className="rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-3">
          <GardenStatsBar
            totalButterflies={entries.length}
            totalMessages={entries.length}
            totalVoices={totalVoices ?? 0}
          />
        </div>

        {/* CTA */}
        <Link href="/submit" className="w-full">
          <CrystalButton className="w-full">
            <><CrystalIcon size={18} /><span>蝶を届ける</span></>
          </CrystalButton>
        </Link>
      </div>
    </main>
  );
}
