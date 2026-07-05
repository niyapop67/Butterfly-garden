"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGardenFeed, type GardenEntry } from "@/lib/useGardenFeed";
import { BUTTERFLY_TYPES, type ButterflyType } from "@/types/submission";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";
import CrystalIcon from "@/components/ui/CrystalIcon";
import GardenStatsBar from "@/components/garden/GardenStatsBar";
import EvolutionMilestoneTracker from "@/components/garden/EvolutionMilestoneTracker";
import ButterflyTypeFilter from "@/components/garden/ButterflyTypeFilter";
import GardenButterflyTile from "@/components/garden/GardenButterflyTile";

/** Deterministic 0..1 pseudo-random value from a Firestore doc id, so each
 * tile's float timing/rotation is stable across re-renders (no jitter every
 * time the snapshot updates) without needing to persist anything. */
function hashToUnit(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return (h % 1000) / 1000;
}

export default function GardenFeed() {
  const { entries, loading, error } = useGardenFeed();
  const [filter, setFilter] = useState<ButterflyType | "all">("all");
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const countsByType = useMemo(() => {
    const counts: Record<ButterflyType, number> = {
      "pink-heart": 0,
      "tiffany-sky": 0,
      "crystal-white": 0,
      "aurora-dream": 0,
      "emerald-garden": 0,
      "golden-sunshine": 0,
    };
    for (const e of entries) {
      counts[e.butterflyType] = (counts[e.butterflyType] ?? 0) + 1;
    }
    return counts;
  }, [entries]);

  const totalVoices = useMemo(() => entries.filter((e) => e.hasVoice).length, [entries]);

  const visibleEntries = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.butterflyType === filter)),
    [entries, filter]
  );

  function handleToggle(id: string) {
    setRevealedId((current) => (current === id ? null : id));
  }

  return (
    <>
      <section className="relative z-10 mb-6 text-center">
        <Image
          src="/images/decor/crystal_fountain_icon.png"
          alt=""
          width={360}
          height={357}
          sizes="64px"
          className="mx-auto mb-1 h-16 w-16 object-contain"
        />
        <p className="font-display-jp text-sm" style={{ color: "var(--color-ink)" }}>
          {loading ? (
            "ガーデンを準備しています…"
          ) : (
            <>
              <span className="text-2xl font-semibold" style={{ color: "#ff6fa8" }}>
                {entries.length}
              </span>
              匹の蝶がガーデンに集まっています
            </>
          )}
        </p>
      </section>

      {error && (
        <section className="relative z-10 mb-6">
          <GlassCard className="px-5 py-4 text-center">
            <p className="font-body text-xs" style={{ color: "var(--color-ink-soft)" }}>
              {error}
            </p>
          </GlassCard>
        </section>
      )}

      <section className="relative z-10 mb-6">
        <GlassCard className="px-5 py-6">
          <GardenStatsBar
            totalButterflies={entries.length}
            totalMessages={entries.length}
            totalVoices={totalVoices}
          />
        </GlassCard>
      </section>

      <section className="relative z-10 mb-6">
        <GlassCard className="px-5 py-6">
          <EvolutionMilestoneTracker totalButterflies={entries.length} />
        </GlassCard>
      </section>

      {!loading && entries.length > 0 && (
        <section className="relative z-10 mb-4">
          <ButterflyTypeFilter
            value={filter}
            onChange={setFilter}
            countsByType={countsByType}
            totalCount={entries.length}
          />
        </section>
      )}

      <section className="relative z-10 mb-8">
        <GlassCard className="px-4 py-6 !bg-white/10 !border-white/40" texture={false}>
          {loading ? (
            <div className="grid grid-cols-4 gap-x-1 gap-y-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex justify-center">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-white/40" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <EmptyGardenState />
          ) : visibleEntries.length === 0 ? (
            <p className="py-6 text-center font-body text-xs" style={{ color: "var(--color-ink-soft)" }}>
              この種類の蝶はまだいません。
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-x-1 gap-y-6">
              {visibleEntries.map((entry: GardenEntry) => (
                <GardenButterflyTile
                  key={entry.id}
                  entry={entry}
                  variance={hashToUnit(entry.id)}
                  isRevealed={revealedId === entry.id}
                  onToggle={() => handleToggle(entry.id)}
                />
              ))}
            </div>
          )}
        </GlassCard>
      </section>

      <section className="relative z-10 flex justify-center">
        <Link href="/submit" className="w-full max-w-xs">
          <CrystalButton className="w-full">
            <CrystalIcon size={20} />
            蝶を届ける
          </CrystalButton>
        </Link>
      </section>
    </>
  );
}

function EmptyGardenState() {
  return (
    <div className="py-6 text-center">
      <Image
        src="/images/decor/sakura_cluster_v2.png"
        alt=""
        width={352}
        height={324}
        sizes="64px"
        className="mx-auto mb-2 h-16 w-16 object-contain"
      />
      <p className="mb-1 font-display-jp text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
        まだ蝶がいません
      </p>
      <p className="font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
        最初の蝶を届けて、MIKAのガーデンを始めましょう。
      </p>
    </div>
  );
}
