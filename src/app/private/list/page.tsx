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
 *
 * 2026-08-06: replaced the flat .bg-night-garden fill with a dedicated
 * "crystal palace fountain garden" illustration (private_list_bg.jpg).
 * Reuses .bg-photo-layer (globals.css) rather than inventing new CSS: that
 * class already handles the two things this needed — capped to one
 * viewport (100dvh) on mobile so background-size:cover doesn't blow the
 * image up against this page's full scrollable height (see that class's
 * own comment for why), and position:fixed at the site's md:(768px)
 * breakpoint to escape .mobile-frame so it fills the real desktop
 * viewport instead of just the (still-narrow, max 640px) column — same
 * technique /private/mika's desktop hero uses. Passing backgroundImage
 * directly via inline style overrides the class's var(--bg-photo-mobile)
 * hook (inline style wins over the class rule for that one property), so
 * no CSS var wiring is needed for this single static image.
 * Grid also widens on desktop (4 → 6 cols) with larger name text, since
 * the crystal-card tiles read as cramped once the frame grows past phone
 * width.
 *
 * 2026-08-06 follow-up: dropped the readability-wash overlay and the
 * lg:8-col step per feedback from the deployed screenshot — the
 * illustration read better unfiltered, and 8 columns made name tiles too
 * narrow; settled on a flat 6-col cap from md up.
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
    <main
      className="relative z-0 min-h-screen overflow-hidden px-5 pb-12 pt-6 md:px-8"
      style={{ backgroundColor: "#08060f" }}
    >
      <div
        aria-hidden
        className="bg-photo-layer"
        style={{ backgroundImage: "url(/images/decor/private_list_bg.jpg)" }}
      />

      <header className="relative z-10 mb-6 text-center">
        <img
          src="/images/decor/birthday_banner_v2.png"
          alt="Happy Birthday 2026.8.23"
          className="mx-auto w-full max-w-xl"
        />
      </header>

      <section className="relative z-10 mb-5 md:mx-auto md:max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ニックネームで検索"
          className="w-full rounded-full border border-white/40 bg-white/85 px-4 py-2.5 font-body text-sm outline-none placeholder:text-[#b3a6c9] md:text-base"
          style={{ color: "var(--color-ink)" }}
        />
      </section>

      {error && (
        <section className="relative z-10 mb-5 md:mx-auto md:max-w-2xl">
          <GlassCard className="px-5 py-4 text-center">
            <p className="font-body text-xs md:text-sm" style={{ color: "var(--color-ink-soft)" }}>
              {error}
            </p>
          </GlassCard>
        </section>
      )}

      <section className="relative z-10 mb-4 md:mx-auto md:max-w-2xl">
        <p className="font-body text-xs md:text-sm" style={{ color: "#cbb9e0" }}>
          {loading ? "読み込み中…" : `${filtered.length}件`}
        </p>
      </section>

      <section className="relative z-10 grid grid-cols-4 gap-2.5 md:mx-auto md:max-w-2xl md:grid-cols-6 md:gap-3">
        {!loading && filtered.length === 0 && (
          <div className="col-span-4 md:col-span-6">
            <GlassCard className="px-5 py-6 text-center">
              <p className="font-body text-xs md:text-sm" style={{ color: "var(--color-ink-soft)" }}>
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
      className="flex aspect-[8/5] flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-center transition-transform active:scale-[0.94]"
      style={{
        background: "linear-gradient(180deg, #fdf8ef 0%, #faf1e2 100%)",
        border: "2px solid #9c7238",
        boxShadow: "0 3px 8px rgba(60,30,50,0.16), inset 0 0 0 1px rgba(255,255,255,0.6)",
      }}
    >
      <span style={{ color: "#e0a0c0", fontSize: 9 }} aria-hidden>
        ◆
      </span>
      <div className="w-full overflow-hidden">
        {needsScroll ? (
          <div className="flex w-max animate-marquee">
            <p
              className="whitespace-nowrap px-1 font-display-jp text-sm font-bold leading-tight md:text-base"
              style={{ color: "#8a6d3f" }}
            >
              {name}
            </p>
            <p
              className="whitespace-nowrap px-1 font-display-jp text-sm font-bold leading-tight md:text-base"
              style={{ color: "#8a6d3f" }}
              aria-hidden
            >
              {name}
            </p>
          </div>
        ) : (
          <p
            className="whitespace-nowrap text-center font-display-jp text-sm font-bold leading-tight md:text-base"
            style={{ color: "#8a6d3f" }}
          >
            {name}
          </p>
        )}
      </div>
    </button>
  );
}
