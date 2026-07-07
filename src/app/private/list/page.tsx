"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import LetterModal from "@/components/private/LetterModal";
import { usePrivateFeed, type PrivateEntry } from "@/lib/usePrivateFeed";

/**
 * 6章 "MIKAプライベート体験" — 名前一覧リストモード.
 *
 * Of the three modes named in docs/spec-v2.9-diff-2026-06-26.md §2
 * (おまかせ再生／ガーデン探索／名前一覧リスト), this is the one with the
 * least UI ambiguity: a plain, scannable, alphabetically-sorted list —
 * the point of a "name list" is quick lookup, unlike the other two modes
 * which are meant to be more experiential (slideshow / spatial browsing).
 * v2.9 §6 itself wasn't available in this chat when this was built (see
 * spec-v2.9-diff-2026-06-28.md §4), so おまかせ再生 and ガーデン探索 are
 * left as "near future" placeholders on /private rather than guessed at.
 *
 * 2026-07-06: changed from showing every message/voice inline (a long,
 * heavy scroll) to a compact name-only list — tapping a row opens the full
 * message + voice in LetterModal instead. The "オフライン閲覧用にダウン
 * ロード" ZIP export (downloadOfflineArchive.ts) is removed as part of
 * this change: its exported page reproduced the old inline-everything
 * layout, which no longer matches this page's design, and Niya asked for
 * it gone rather than kept in sync. Full message text + voice URLs are
 * still fine to read here — this page is already behind GATE 2
 * (src/middleware.ts), same as before.
 */
export default function PrivateListPage() {
  const { entries, loading, error } = usePrivateFeed();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PrivateEntry | null>(null);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.nickname.localeCompare(b.nickname, "ja")),
    [entries]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted;
    const q = query.trim().toLowerCase();
    return sorted.filter((e) => e.nickname.toLowerCase().includes(q));
  }, [sorted, query]);

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
          名前一覧リスト
        </h1>
      </header>

      <section className="relative z-10 mb-5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ニックネームで検索"
          className="w-full rounded-full border border-white/40 bg-white/85 px-4 py-2.5 font-body text-sm outline-none placeholder:text-[#b3a6c9]"
          style={{ color: "var(--color-ink)" }}
        />
      </section>

      {error && (
        <section className="relative z-10 mb-5">
          <GlassCard className="px-5 py-4 text-center">
            <p className="font-body text-xs" style={{ color: "var(--color-ink-soft)" }}>
              {error}
            </p>
          </GlassCard>
        </section>
      )}

      <section className="relative z-10 mb-4">
        <p className="font-body text-xs" style={{ color: "#cbb9e0" }}>
          {loading ? "読み込み中…" : `${filtered.length}件`}
        </p>
      </section>

      <section className="relative z-10 grid grid-cols-3 gap-2.5">
        {!loading && filtered.length === 0 && (
          <div className="col-span-3">
            <GlassCard className="px-5 py-6 text-center">
              <p className="font-body text-xs" style={{ color: "var(--color-ink-soft)" }}>
                該当する蝶が見つかりませんでした。
              </p>
            </GlassCard>
          </div>
        )}
        {filtered.map((entry) => (
          <PrivateListItem key={entry.id} entry={entry} onOpen={() => setSelected(entry)} />
        ))}
      </section>

      <LetterModal entry={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

function PrivateListItem({ entry, onOpen }: { entry: PrivateEntry; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex aspect-[3/4] flex-col items-center justify-center rounded-2xl px-2 py-3 text-center transition-transform active:scale-[0.96]"
      style={{
        background: "linear-gradient(180deg, #fdf8ef 0%, #faf1e2 100%)",
        border: "1.5px solid rgba(212,175,110,0.55)",
        boxShadow: "0 6px 16px rgba(60,30,50,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)",
      }}
    >
      <span style={{ color: "#e0a0c0", fontSize: 11 }} aria-hidden>
        ◆
      </span>
      <p
        className="mt-1.5 line-clamp-2 break-all font-display-jp text-xs font-semibold leading-snug"
        style={{ color: "#8a6d3f" }}
      >
        {entry.nickname || "（名前未設定）"}
      </p>
    </button>
  );
}
