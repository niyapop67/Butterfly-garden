"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ButterflyImage from "@/components/butterfly/ButterflyImage";
import { BUTTERFLY_THEMES } from "@/types/submission";
import { usePrivateFeed } from "@/lib/usePrivateFeed";

const SLIDE_SECONDS_NO_VOICE = 8;
/** Extra buffer after a voice clip finishes before auto-advancing, so the
 * silence doesn't feel like the app stalled. */
const VOICE_BUFFER_SECONDS = 2;

/**
 * 6章 "MIKAプライベート体験" — おまかせ再生モード.
 *
 * Auto-advancing slideshow through every submission, oldest first (a
 * chronological journey through how the garden grew — distinct from
 * 名前一覧リスト's alphabetical lookup and ガーデン探索's free browsing).
 * Best-effort interpretation, not a literal v2.9 §6 implementation — see
 * spec-v2.9-diff-2026-06-28.md §6.
 */
export default function PrivateSlideshowPage() {
  const { entries, loading } = usePrivateFeed();
  const chronological = useMemo(() => [...entries].reverse(), [entries]); // oldest first

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = chronological[index];

  useEffect(() => {
    if (!playing || chronological.length === 0) return;

    function advance() {
      setIndex((i) => (i + 1) % chronological.length);
    }

    if (current?.voiceUrl) {
      // Timed by the actual clip via the <audio> element's onEnded below;
      // this effect just guards against a clip that fails to fire onEnded.
      const fallbackMs = ((current.voiceDurationSeconds ?? 20) + VOICE_BUFFER_SECONDS + 3) * 1000;
      timerRef.current = setTimeout(advance, fallbackMs);
    } else {
      timerRef.current = setTimeout(advance, SLIDE_SECONDS_NO_VOICE * 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing, chronological.length]);

  function handleVoiceEnded() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % chronological.length);
    }, VOICE_BUFFER_SECONDS * 1000);
  }

  function goPrev() {
    setIndex((i) => (i - 1 + chronological.length) % chronological.length);
  }
  function goNext() {
    setIndex((i) => (i + 1) % chronological.length);
  }

  return (
    <main className="bg-night-garden relative flex min-h-screen flex-col overflow-hidden px-5 pb-10 pt-6">
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
          おまかせ再生
        </h1>
      </header>

      {loading ? (
        <p className="relative z-10 mt-20 text-center font-body text-xs" style={{ color: "#cbb9e0" }}>
          読み込み中…
        </p>
      ) : chronological.length === 0 ? (
        <p className="relative z-10 mt-20 text-center font-body text-xs" style={{ color: "#cbb9e0" }}>
          まだ蝶がいません。
        </p>
      ) : (
        <>
          {/* progress dots */}
          <div className="relative z-10 mb-6 flex justify-center gap-1.5">
            {chronological.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 18 : 6,
                  background: i === index ? "#ffb6d9" : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4 }}
                className="flex w-full max-w-sm flex-col items-center text-center"
              >
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                  <ButterflyImage type={current.butterflyType} size="large" displayWidth={120} />
                </motion.div>

                <p className="mt-4 font-display-jp text-base font-semibold" style={{ color: "#fffdf8" }}>
                  {current.nickname || "（名前未設定）"}
                </p>
                <p className="mt-0.5 font-body text-[11px]" style={{ color: "#cbb9e0" }}>
                  {BUTTERFLY_THEMES[current.butterflyType]?.labelJa ?? ""}
                </p>

                <p
                  className="mt-5 max-h-[30vh] overflow-y-auto whitespace-pre-wrap font-body text-sm leading-relaxed"
                  style={{ color: "#f0e8f7" }}
                >
                  {current.message}
                </p>

                {current.voiceUrl && (
                  <audio
                    ref={audioRef}
                    key={current.id}
                    src={current.voiceUrl}
                    autoPlay={playing}
                    onEnded={handleVoiceEnded}
                    controls
                    className="mt-4 h-9 w-full"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-10 mt-6 flex items-center justify-center gap-6">
            <button type="button" onClick={goPrev} aria-label="前へ" className="text-2xl text-white/80">
              ‹
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "一時停止" : "再生"}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"
            >
              <span className="text-lg text-white">{playing ? "⏸" : "▶"}</span>
            </button>
            <button type="button" onClick={goNext} aria-label="次へ" className="text-2xl text-white/80">
              ›
            </button>
          </div>
        </>
      )}
    </main>
  );
}
