"use client";

import { useMemo, useState } from "react";
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
      <header className="relative z-10 mb-6 text-center">
        <img
          src="/images/decor/birthday_banner_v2.png"
          alt="Happy Birthday 2026.8.23"
          className="mx-auto w-full max-w-xl"
        />
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

      <section className="relative z-10 grid grid-cols-4 gap-2">
        {!loading && filtered.length === 0 && (
          <div className="col-span-4">
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
  const name = entry.nickname || "（名前未設定）";
  const needsScroll = name.length > 7;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex aspect-[8/5] flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 text-center transition-transform active:scale-[0.94]"
      style={{
        background: "linear-gradient(180deg, #fdf8ef 0%, #faf1e2 100%)",
        border: "1.5px solid #b8925a",
        boxShadow: "0 3px 8px rgba(60,30,50,0.16), inset 0 0 0 1px rgba(255,255,255,0.6)",
      }}
    >
      <span style={{ color: "#e0a0c0", fontSize: 8 }} aria-hidden>
        ◆
      </span>
      <div className="w-full overflow-hidden">
        {needsScroll ? (
          <div className="flex w-max animate-marquee">
            <p
              className="whitespace-nowrap px-1 font-display-jp text-sm font-bold leading-tight"
              style={{ color: "#8a6d3f" }}
            >
              {name}
            </p>
            <p
              className="whitespace-nowrap px-1 font-display-jp text-sm font-bold leading-tight"
              style={{ color: "#8a6d3f" }}
              aria-hidden
            >
              {name}
            </p>
          </div>
        ) : (
          <p
            className="whitespace-nowrap text-center font-display-jp text-sm font-bold leading-tight"
            style={{ color: "#8a6d3f" }}
          >
            {name}
          </p>
        )}
      </div>
    </button>
  );
}
