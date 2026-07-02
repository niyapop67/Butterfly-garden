"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useGardenFeed } from "@/lib/useGardenFeed";
import { useTimeOfDay } from "@/lib/useTimeOfDay";
import { GARDEN_BG_IMAGES } from "@/lib/timeBackgrounds";
import FreeFlyingGarden from "@/components/garden/FreeFlyingGarden";
import CrystalIcon from "@/components/ui/CrystalIcon";
import CrystalButton from "@/components/ui/CrystalButton";

export default function GardenPage() {
  const { entries, loading } = useGardenFeed();
  const time = useTimeOfDay();

  return (
    <main
      className="bg-garden-page relative min-h-screen overflow-hidden"
      style={{
        "--time-bg-filter": time.bgFilter,
        "--time-ambient": time.ambientColor,
        "--time-ambient-opacity": String(time.ambientOpacity),
      } as CSSProperties}
    >
      {/* Time-of-day photo layer — replaces the static garden-bg.jpg fallback
          whenever this component renders. z-index: -1, see globals.css. */}
      <div
        aria-hidden
        className="bg-photo-layer"
        style={{ backgroundImage: `url(${GARDEN_BG_IMAGES[time.id]})`, filter: time.bgFilter }}
      />

      {/* Ambient lighting overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 transition-colors duration-[3000ms]"
        style={{ background: `rgba(${time.ambientColor}, ${time.ambientOpacity})` }}
      />

      {/* Free-flying butterflies */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <FreeFlyingGarden entries={entries} maxOnScreen={16} />
      </div>

      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-5 pt-6 pb-4">
        <Link
          href="/"
          aria-label="トップページへ戻る"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/30 transition-all hover:bg-white/25"
          style={{ borderColor: "rgba(232,193,112,0.3)" }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden>
            <path d="M9 1L1 8L9 15" stroke="#a78bdb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <div className="text-center">
          <h1 className="font-display italic text-lg leading-none" style={{ color: "var(--color-ink)" }}>
            Butterfly Garden
          </h1>
          <p className="font-body text-[10px] tracking-widest opacity-50 mt-0.5" style={{ color: "var(--color-ink)" }}>
            {time.labelJa}
          </p>
        </div>

        <Link
          href="/submit"
          aria-label="蝶を届ける"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border transition-all hover:bg-white/25"
          style={{ borderColor: "rgba(232,193,112,0.3)" }}
        >
          <CrystalIcon size={18} />
        </Link>
      </header>

      {/* Butterfly count — minimal, floating */}
      <div className="relative z-30 text-center mt-4">
        {!loading && (
          <p className="font-display-jp text-sm drop-shadow-sm" style={{ color: "var(--color-ink)" }}>
            <span className="text-3xl font-semibold" style={{ color: "var(--color-pink-deep)" }}>
              {entries.length}
            </span>
            <span className="ml-1 opacity-75">匹の蝶がガーデンに集まっています</span>
          </p>
        )}
      </div>

      {/* Bottom CTA only */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-8 max-w-[430px] mx-auto">
        <Link href="/submit" className="w-full">
          <CrystalButton className="w-full">
            <CrystalIcon size={18} />
            <span>蝶を届ける</span>
          </CrystalButton>
        </Link>
      </div>
    </main>
  );
}
