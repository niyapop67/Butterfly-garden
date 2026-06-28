"use client";

import { useState } from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";
import { usePrivateFeed } from "@/lib/usePrivateFeed";

/**
 * Production staging page for 靖史 — NOT part of the MIKA-facing private
 * experience (the 3 modes under /private, or /private/movie /
 * /private/download linked from the Birthday page reveal). Deliberately
 * not linked from anywhere in the public UI; reach it by typing the URL
 * directly. Still sits under /private/** so GATE 2 protects it via the
 * existing middleware matcher — no separate auth needed.
 *
 * Purpose: gather everything needed to edit the birthday digest movie in
 * CapCut (see docs/birthday-movie-five-acts-draft.md) in one batch, instead
 * of opening the Firebase console once per submission.
 */
export default function PrivateProductionPage() {
  const { entries, loading } = usePrivateFeed();
  const [zipping, setZipping] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [zipResult, setZipResult] = useState<string | null>(null);

  const voiceCount = entries.filter((e) => e.voiceUrl).length;

  async function handleDownloadVoiceZip() {
    setZipping(true);
    setZipError(null);
    setZipResult(null);
    try {
      const { downloadVoiceFilesZip } = await import("@/lib/downloadVoiceFilesZip");
      const { voiceCount: downloaded } = await downloadVoiceFilesZip(entries);
      setZipResult(`${downloaded}件のボイスファイルをまとめました（manifest.csv同梱）`);
    } catch {
      setZipError("ZIPの作成に失敗しました。もう一度お試しください。");
    } finally {
      setZipping(false);
    }
  }

  return (
    <main className="bg-night-garden relative min-h-screen overflow-hidden px-5 pb-12 pt-6">
      <header className="relative z-10 mb-8 flex items-center gap-3">
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
          制作用ステージング
        </h1>
      </header>

      <section className="relative z-10 mb-4">
        <p className="font-body text-[11px] leading-relaxed" style={{ color: "#cbb9e0" }}>
          ※このページはMIKA向けではありません。どこからもリンクされていないので、
          このURLを知っている人だけが開けます。
        </p>
      </section>

      <section className="relative z-10">
        <GlassCard className="px-6 py-8 text-center">
          <p className="mb-1 font-display-jp text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
            ボイスファイル一括ダウンロード
          </p>
          <p className="mb-6 font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            {loading
              ? "読み込み中…"
              : `全${entries.length}件中、ボイス付き${voiceCount}件をZIPでまとめます。投稿順に番号を振ったファイル名＋対応表（manifest.csv）が入っています。`}
          </p>

          <CrystalButton
            className="w-full"
            onClick={handleDownloadVoiceZip}
            disabled={loading || zipping || voiceCount === 0}
          >
            {zipping ? "作成中…" : "ボイスをZIPでダウンロード"}
          </CrystalButton>

          {zipResult && (
            <p className="mt-3 font-body text-xs" style={{ color: "var(--color-ink-soft)" }}>
              {zipResult}
            </p>
          )}
          {zipError && <p className="mt-3 font-body text-xs text-rose-500">{zipError}</p>}
        </GlassCard>
      </section>

      <section className="relative z-10 mt-4">
        <GlassCard className="px-6 py-6 text-center">
          <p className="font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            メッセージ全文の確認・検索は「
            <Link href="/private/list" className="underline">
              名前一覧リスト
            </Link>
            」、編集構成のたたき台は{" "}
            <code className="rounded bg-white/40 px-1 py-0.5 text-[10px]">
              docs/birthday-movie-five-acts-draft.md
            </code>{" "}
            を参照してください。
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
