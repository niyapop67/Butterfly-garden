"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import ButterflyImage from "@/components/butterfly/ButterflyImage";
import { BUTTERFLY_TYPES, BUTTERFLY_THEMES, type ButterflyType } from "@/types/submission";
import { usePrivateFeed, type PrivateEntry } from "@/lib/usePrivateFeed";
import PrivateDetailModal from "@/components/private/PrivateDetailModal";

/**
 * 6章 "MIKAプライベート体験" — ガーデン探索モード.
 *
 * Reuses the public Garden page's grid + type-filter visual language
 * (src/components/garden/GardenFeed.tsx) — same spatial "walk through and
 * tap what catches your eye" metaphor — but every tile here is backed by
 * usePrivateFeed (full message/voice) and tapping opens a full detail
 * overlay instead of a small nickname tooltip. This is what sets 探索 apart
 * from 名前一覧リスト (flat alphabetical list, for lookup) and おまかせ再生
 * (fixed auto-advancing sequence) — see spec-v2.9-diff-2026-06-28.md §6 for
 * why this is a best-effort interpretation rather than a literal v2.9 §6
 * implementation.
 */
export default function PrivateExplorePage() {
  const { entries, loading } = usePrivateFeed();
  const [filter, setFilter] = useState<ButterflyType | "all">("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.butterflyType === filter)),
    [entries, filter]
  );

  const activeEntry: PrivateEntry | null = activeIndex !== null ? filtered[activeIndex] ?? null : null;

  return (
    <main className="bg-night-garden relative min-h-screen overflow-hidden px-5 pb-12 pt-6">
      <header className="relative z-10 mb-6 flex items-center gap-3">
        <Link
          href="/private"
          aria-label="プライベート体験トップへ戻る"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/50 backdrop-blur-md shadow-glass-soft"
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden>
            <path d="M9 1L1 8L9 15" stroke="#a78bdb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="font-display-jp text-base" style={{ color: "#fffdf8" }}>
          ガーデン探索
        </h1>
      </header>

      {!loading && entries.length > 0 && (
        <section className="relative z-10 mb-4">
          <div className="-mx-1 overflow-x-auto px-1">
            <div className="flex w-max gap-2 pb-1">
              <FilterChip label="すべて" isSelected={filter === "all"} onClick={() => setFilter("all")} />
              {BUTTERFLY_TYPES.map((type) => (
                <FilterChip
                  key={type}
                  label={BUTTERFLY_THEMES[type].labelJa}
                  isSelected={filter === type}
                  onClick={() => setFilter(type)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative z-10">
        <GlassCard className="px-4 py-6">
          {loading ? (
            <p className="py-6 text-center font-body text-xs" style={{ color: "var(--color-ink-soft)" }}>
              読み込み中…
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center font-body text-xs" style={{ color: "var(--color-ink-soft)" }}>
              この種類の蝶はまだいません。
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-x-1 gap-y-6">
              {filtered.map((entry, i) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className="flex flex-col items-center gap-1"
                  aria-label={`${entry.nickname || "名前未設定"}の蝶を開く`}
                >
                  <ButterflyImage type={entry.butterflyType} size="small" displayWidth={56} />
                </button>
              ))}
            </div>
          )}
        </GlassCard>
      </section>

      <PrivateDetailModal
        entry={activeEntry}
        onClose={() => setActiveIndex(null)}
        onPrev={activeIndex !== null && activeIndex > 0 ? () => setActiveIndex((i) => (i ?? 0) - 1) : undefined}
        onNext={
          activeIndex !== null && activeIndex < filtered.length - 1
            ? () => setActiveIndex((i) => (i ?? 0) + 1)
            : undefined
        }
      />
    </main>
  );
}

function FilterChip({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-2 font-body text-xs transition-colors ${
        isSelected ? "border-[var(--color-tiffany)] bg-white/80" : "border-white/40 bg-white/20"
      }`}
      style={{ color: isSelected ? "var(--color-ink)" : "#cbb9e0" }}
    >
      {label}
    </button>
  );
}
