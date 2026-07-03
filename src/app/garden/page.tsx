"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGardenFeed } from "@/lib/useGardenFeed";
import { useTimeOfDay } from "@/lib/useTimeOfDay";
import { GARDEN_BG_IMAGES } from "@/lib/timeBackgrounds";
import { getButterflyAsset } from "@/lib/butterflyAssets";
import FreeFlyingGarden from "@/components/garden/FreeFlyingGarden";
import CrystalIcon from "@/components/ui/CrystalIcon";
import CrystalButton from "@/components/ui/CrystalButton";
import type { ButterflyType } from "@/types/submission";

const FILTER_TYPES: ButterflyType[] = [
  "pink-heart",
  "tiffany-sky",
  "aurora-dream",
  "twinkle-premium",
  "crystal-white",
  "emerald-garden",
  "golden-sunshine",
];

export default function GardenPage() {
  const { entries, loading } = useGardenFeed();
  const time = useTimeOfDay();
  const [filter, setFilter] = useState<ButterflyType | "all">("all");

  // The header count always reflects the true total (matches the TOP
  // page's stats card); only which butterflies actually render is
  // affected by the filter chips below.
  const filteredEntries = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.butterflyType === filter)),
    [entries, filter]
  );

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
          whenever this component renders. z-index: -1, see globals.css.
          2026-07-03: no longer applies time.bgFilter here. bgFilter (with
          its hue-rotate(200deg) for moon-garden) was designed for the old
          single-photo system, where one neutral image got colour-graded via
          CSS to fake 4 different times of day. Now each time has its own
          already-correctly-lit photo (see timeBackgrounds.ts), so applying
          bgFilter on top double-processes it — hue-rotate on an
          already-blue night photo shifted it into an unintended pink/lavender
          cast instead of deepening the night mood. The ambient rgba overlay
          below is a much gentler tint and is kept. */}
      <div
        aria-hidden
        className="bg-photo-layer"
        style={{ backgroundImage: `url(${GARDEN_BG_IMAGES[time.id]})` }}
      />

      {/* Ambient lighting overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 transition-colors duration-[3000ms]"
        style={{ background: `rgba(${time.ambientColor}, ${time.ambientOpacity})` }}
      />

      {/* Free-flying butterflies */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <FreeFlyingGarden entries={filteredEntries} maxOnScreen={30} />
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
          <h1
            className="font-display italic text-lg leading-none"
            style={{ color: "#4a4058", textShadow: "0 1px 8px rgba(255,255,255,0.75)" }}
          >
            Butterfly Garden
          </h1>
          <p
            className="font-body text-[10px] tracking-widest mt-0.5"
            style={{ color: "#4a4058", opacity: 0.75, textShadow: "0 1px 6px rgba(255,255,255,0.75)" }}
          >
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

      {/* Bottom cluster: filter chips + CTA, both fixed above the fold */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-8 max-w-[430px] mx-auto">
        {/* Butterfly-type filter chips — narrows which butterflies fly on
            screen (does not affect the total count above, or maxOnScreen).
            "すべての蝶" always resets to the full, unfiltered set. */}
        <div className="mb-3 -mx-1 overflow-x-auto px-1">
          <div className="flex w-max items-center gap-2 px-1 pb-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`flex-shrink-0 rounded-full border px-3 py-1.5 font-body text-[11px] transition-all ${
                filter === "all"
                  ? "border-transparent bg-[var(--color-tiffany)] text-white shadow-sm"
                  : "border-white/50 bg-white/60 text-[color:var(--color-ink)] backdrop-blur-sm"
              }`}
            >
              すべての蝶
            </button>
            {FILTER_TYPES.map((t) => {
              const asset = getButterflyAsset(t, "small");
              const active = filter === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilter(active ? "all" : t)}
                  aria-label={t}
                  aria-pressed={active}
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                    active
                      ? "border-transparent bg-white shadow-md scale-110"
                      : "border-white/50 bg-white/60 backdrop-blur-sm"
                  }`}
                >
                  <Image
                    src={asset.src}
                    alt={t}
                    width={asset.width}
                    height={asset.height}
                    className="h-5 w-5 object-contain"
                    unoptimized
                  />
                </button>
              );
            })}
          </div>
        </div>

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
