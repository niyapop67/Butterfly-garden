"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";
import ButterflyImage from "@/components/butterfly/ButterflyImage";
import { BUTTERFLY_THEMES } from "@/types/submission";
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
 * Full message text + voice playback are shown here — this page is
 * already behind GATE 2 (src/middleware.ts), so usePrivateFeed.ts's full
 * fields are appropriate here in a way they are NOT on the public Garden
 * page (see useGardenFeed.ts's GardenEntry, which omits them).
 */
export default function PrivateListPage() {
  const { entries, loading, error } = usePrivateFeed();
  const [query, setQuery] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiveResult, setArchiveResult] = useState<string | null>(null);

  async function handleDownloadOffline() {
    setArchiving(true);
    setArchiveError(null);
    setArchiveResult(null);
    try {
      const { downloadOfflineArchive } = await import("@/lib/downloadOfflineArchive");
      const { voiceCount } = await downloadOfflineArchive(entries);
      setArchiveResult(`書き出し完了（ボイス${voiceCount}件）。ZIPを展開してindex.htmlを開くと、ネットなしでも見られます。`);
    } catch {
      setArchiveError("書き出しに失敗しました。もう一度お試しください。");
    } finally {
      setArchiving(false);
    }
  }

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

      <section className="relative z-10 mb-5">
        <GlassCard className="px-4 py-4">
          <p className="mb-2 font-body text-[11px] leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            バースデームービーと同じく、ダウンロードしておけばネット環境がなくてもオフラインで開けます。
          </p>
          <CrystalButton className="w-full" onClick={handleDownloadOffline} disabled={loading || archiving || entries.length === 0}>
            {archiving ? "書き出し中…" : "オフライン閲覧用にダウンロード"}
          </CrystalButton>
          {archiveResult && (
            <p className="mt-2 font-body text-[11px]" style={{ color: "var(--color-ink-soft)" }}>
              {archiveResult}
            </p>
          )}
          {archiveError && <p className="mt-2 font-body text-[11px] text-rose-500">{archiveError}</p>}
        </GlassCard>
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

      <section className="relative z-10 flex flex-col gap-3">
        {!loading && filtered.length === 0 && (
          <GlassCard className="px-5 py-6 text-center">
            <p className="font-body text-xs" style={{ color: "var(--color-ink-soft)" }}>
              該当する蝶が見つかりませんでした。
            </p>
          </GlassCard>
        )}
        {filtered.map((entry) => (
          <PrivateListItem key={entry.id} entry={entry} />
        ))}
      </section>
    </main>
  );
}

function PrivateListItem({ entry }: { entry: PrivateEntry }) {
  return (
    <GlassCard className="px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <ButterflyImage type={entry.butterflyType} size="small" displayWidth={40} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-display-jp text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
              {entry.nickname || "（名前未設定）"}
            </p>
            <span className="flex-shrink-0 font-body text-[10px]" style={{ color: "#a89fb3" }}>
              {BUTTERFLY_THEMES[entry.butterflyType]?.labelJa ?? ""}
            </span>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            {entry.message}
          </p>
          {entry.voiceUrl && (
            <audio controls preload="none" src={entry.voiceUrl} className="mt-2 h-8 w-full">
              お使いのブラウザは音声再生に対応していません。
            </audio>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
