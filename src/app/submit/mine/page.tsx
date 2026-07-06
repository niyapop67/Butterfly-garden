"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";
import ButterflyImage from "@/components/butterfly/ButterflyImage";
import { db } from "@/lib/firebase";
import { hasSubmittedBefore } from "@/lib/submissionFlag";
import { BUTTERFLY_THEMES, type SubmissionDoc } from "@/types/submission";

/**
 * "自分の送信内容を見返す" page — 2026-07-06 feature.
 *
 * Not tied to any account system (there isn't one here) — this only works
 * because markSubmitted() stashes the Firestore doc ID in this browser's
 * localStorage right after a successful submit (see submissionFlag.ts).
 * That means:
 *  - it only ever shows *this device's own* most recent submission
 *  - it stops working if localStorage is cleared, or on a different
 *    device/browser — same limitation as the "already submitted" nudge
 *    on /submit, and accepted for the same reason (see that feature's
 *    2026-07-06 decision — a real account system was out of scope)
 *
 * Firestore read rules are open to everyone (firestore.rules — the garden
 * page already needs public read), so fetching by doc ID here doesn't need
 * any extra backend change. This page is under GATE 1 only (not GATE 2),
 * same tier as /submit itself, since it's just showing you your own words
 * back to you.
 */
export default function MySubmissionPage() {
  const [state, setState] = useState<
    | { status: "checking" }
    | { status: "none" }
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; entry: SubmissionDoc }
  >({ status: "checking" });

  useEffect(() => {
    const record = hasSubmittedBefore();
    if (!record) {
      setState({ status: "none" });
      return;
    }
    setState({ status: "loading" });
    getDoc(doc(db, "submissions", record.id))
      .then((snap) => {
        if (!snap.exists()) {
          setState({ status: "error" });
          return;
        }
        setState({ status: "ready", entry: snap.data() as SubmissionDoc });
      })
      .catch(() => setState({ status: "error" }));
  }, []);

  return (
    <main className="bg-day-garden relative min-h-screen overflow-hidden px-5 pb-12 pt-6">
      <div
        aria-hidden
        className="bg-photo-layer md:hidden"
        style={{ backgroundImage: "url(/images/topsubmit-bg-mobile.jpg)" }}
      />
      <div
        aria-hidden
        className="bg-photo-layer hidden md:block"
        style={{ backgroundImage: "url(/images/topsubmit-bg-desktop.jpg)" }}
      />

      <header className="relative z-10 mb-6 flex items-center gap-3">
        <Link
          href="/submit"
          aria-label="投稿ページへ戻る"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/50 backdrop-blur-md shadow-glass-soft"
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden>
            <path d="M9 1L1 8L9 15" stroke="#a78bdb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="font-display-jp text-base" style={{ color: "var(--color-ink)" }}>
          送った内容
        </h1>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-sm">
        {state.status === "checking" || state.status === "loading" ? (
          <GlassCard className="px-5 py-8 text-center">
            <p className="font-body text-xs" style={{ color: "var(--color-ink-soft)" }}>
              読み込み中…
            </p>
          </GlassCard>
        ) : state.status === "none" ? (
          <GlassCard className="px-5 py-8 text-center">
            <p className="font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
              このブラウザからはまだ蝶を届けていないようです。
            </p>
            <Link href="/submit" className="mt-4 block">
              <CrystalButton className="w-full">蝶を届ける</CrystalButton>
            </Link>
          </GlassCard>
        ) : state.status === "error" ? (
          <GlassCard className="px-5 py-8 text-center">
            <p className="font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
              内容の読み込みに失敗しました。通信状況を確認してもう一度お試しください。
            </p>
          </GlassCard>
        ) : (
          <GlassCard className="px-5 py-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <ButterflyImage type={state.entry.butterflyType} size="small" displayWidth={48} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-display-jp text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                    {state.entry.nickname || "（名前未設定）"}
                  </p>
                  <span className="flex-shrink-0 font-body text-[10px]" style={{ color: "#a89fb3" }}>
                    {BUTTERFLY_THEMES[state.entry.butterflyType]?.labelJa ?? ""}
                  </span>
                </div>
                <p
                  className="mt-1.5 whitespace-pre-wrap font-body text-xs leading-relaxed"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  {state.entry.message}
                </p>
                {state.entry.voiceUrl && (
                  <audio controls preload="none" src={state.entry.voiceUrl} className="mt-2 h-8 w-full">
                    お使いのブラウザは音声再生に対応していません。
                  </audio>
                )}
              </div>
            </div>
          </GlassCard>
        )}
      </section>
    </main>
  );
}
