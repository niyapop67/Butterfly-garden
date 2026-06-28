"use client";

import { useState } from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";
import { usePrivateFeed } from "@/lib/usePrivateFeed";

/**
 * MIKA-only download (spec mockup §2.4 "ダウンロードする"). Per project
 * history, the two final deliverables are the birthday digest movie
 * (separate, /private/movie — still needs the actual edited video file)
 * and a keepsake PDF of every message, which THIS page generates for real,
 * client-side, from live Firestore data — see generateMessagesPdf.ts.
 */
export default function PrivateDownloadPage() {
  const { entries, loading } = usePrivateFeed();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setGenerating(true);
    setError(null);
    try {
      const { generateMessagesPdf } = await import("@/lib/generateMessagesPdf");
      await generateMessagesPdf(entries);
    } catch {
      setError("PDFの作成に失敗しました。もう一度お試しください。");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="bg-night-garden relative min-h-screen overflow-hidden px-5 pb-12 pt-6">
      <header className="relative z-10 mb-8 flex items-center gap-3">
        <Link
          href="/birthday"
          aria-label="誕生日ページへ戻る"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/50 backdrop-blur-md shadow-glass-soft"
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden>
            <path d="M9 1L1 8L9 15" stroke="#a78bdb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="font-display-jp text-base" style={{ color: "#fffdf8" }}>
          ダウンロード
        </h1>
      </header>

      <section className="relative z-10 mt-6 flex justify-center">
        <GlassCard className="w-full max-w-sm px-6 py-10 text-center">
          <p className="mb-2 text-2xl" aria-hidden>
            🎁
          </p>
          <p className="mb-1 font-display-jp text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
            みんなからのメッセージ集
          </p>
          <p className="mb-6 font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            {loading ? (
              "読み込み中…"
            ) : (
              <>
                参加してくれた{entries.length}人分のメッセージを、
                <br />
                1つのPDFにまとめてダウンロードできます。
              </>
            )}
          </p>

          <CrystalButton className="w-full" onClick={handleDownload} disabled={loading || generating || entries.length === 0}>
            {generating ? "作成中…" : "PDFをダウンロード"}
          </CrystalButton>

          {error && (
            <p className="mt-3 font-body text-xs text-rose-500">{error}</p>
          )}

          <p className="mt-4 font-body text-[10px] leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            ボイスメッセージはPDFには含まれません。「ガーデン探索」から再生してお聴きください。
          </p>
        </GlassCard>
      </section>

      <section className="relative z-10 mt-6 flex justify-center">
        <GlassCard className="w-full max-w-sm px-6 py-6 text-center opacity-70">
          <p className="font-display-jp text-xs font-semibold" style={{ color: "var(--color-ink)" }}>
            バースデームービー
          </p>
          <p className="mt-1 font-body text-[10px] leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            準備中です。完成したら別途お届けします。
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
