"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BUTTERFLY_THEMES } from "@/types/submission";
import type { PrivateEntry } from "@/lib/usePrivateFeed";

interface LetterModalProps {
  entry: PrivateEntry | null;
  onClose: () => void;
}

/**
 * 2026-07-06: "名前一覧リスト" changed from showing every message/voice
 * inline to a name-only list — tapping a name opens this modal instead.
 * Design follows the ChatGPT mockup Niya shared (Dear MIKA parchment card,
 * gold filigree border, rose bouquet crest).
 * 2026-07-07: rose-bouquet frame art arrived (public/images/decor/letter_frame_rose.png)
 * and replaced the CSS-drawn gold divider placeholder. The card is now the
 * full frame image itself (background-size 100% 100%, aspect-ratio locked
 * to the asset's 2:3), with content absolutely positioned inside on top,
 * scrollable for longer messages so the frame art never stretches oddly.
 */
export default function LetterModal({ entry, onClose }: LetterModalProps) {
  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          key="letter-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8"
          onClick={onClose}
        >
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm"
            style={{
              aspectRatio: "2 / 3",
              backgroundImage: "url(/images/decor/letter_frame_rose.png)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              filter: "drop-shadow(0 20px 45px rgba(60,30,50,0.35))",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M1 1L11 11M11 1L1 11" stroke="#8b8398" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="absolute inset-0 flex flex-col overflow-y-auto px-[13%] pb-[9%] pt-[19%]">
              <h2
                className="text-center font-display text-3xl italic"
                style={{ color: "#8a6d3f" }}
              >
                Dear MIKA
              </h2>

              <p
                className="mt-4 whitespace-pre-wrap text-center font-message-jp text-base leading-relaxed"
                style={{ color: "#4a4058" }}
              >
                {entry.message}
              </p>

              {entry.voiceUrl && <VoicePlayer src={entry.voiceUrl} durationSeconds={entry.voiceDurationSeconds} />}

              <div className="mt-6 text-right">
                <p className="font-body text-[11px]" style={{ color: "#a89060" }}>
                  From
                </p>
                <p className="font-display text-lg italic" style={{ color: "#8a6d3f" }}>
                  {entry.nickname || "（名前未設定）"}
                </p>
              </div>

              <p className="mt-3 text-center font-body text-[10px]" style={{ color: "#b3a690" }}>
                {BUTTERFLY_THEMES[entry.butterflyType]?.labelJa ?? ""}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Custom pink circular play/pause + static waveform bars (heights seeded
 * per-clip so they don't all look identical, not derived from real audio
 * analysis — same convention as most chat-app voice bubbles). Bars ahead
 * of playback position are solid pink, bars behind are faded, giving a
 * simple progress readout without a standard scrub bar.
 */
function VoicePlayer({ src, durationSeconds }: { src: string; durationSeconds: number | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1

  const barCount = 28;
  const bars = useSeededBarHeights(src, barCount);

  useEffect(() => {
    function handleTimeUpdate() {
      const audio = audioRef.current;
      if (!audio || !audio.duration) return;
      setProgress(audio.currentTime / audio.duration);
    }
    function handleEnded() {
      setIsPlaying(false);
      setProgress(0);
    }

    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }

  const activeBars = Math.round(progress * barCount);
  const displaySeconds =
    durationSeconds != null
      ? `0:${String(Math.round(durationSeconds)).padStart(2, "0")}`
      : "";

  return (
    <div
      className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{ background: "rgba(224,160,192,0.12)", border: "1px solid rgba(224,160,192,0.35)" }}
    >
      <audio ref={audioRef} src={src} preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "一時停止" : "再生"}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(135deg, #ff9ec4, #ff6fa8)" }}
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <rect x="1" y="1" width="3.5" height="10" rx="1" fill="white" />
            <rect x="7" y="1" width="3.5" height="10" rx="1" fill="white" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2 1L11 6L2 11V1Z" fill="white" />
          </svg>
        )}
      </button>

      <div className="flex flex-1 items-center gap-[2px]" aria-hidden>
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[2.5px] rounded-full"
            style={{
              height: `${h}%`,
              background: i < activeBars ? "#ff6fa8" : "rgba(224,160,192,0.35)",
            }}
          />
        ))}
      </div>

      {displaySeconds && (
        <span className="flex-shrink-0 font-body text-[11px]" style={{ color: "#a06080" }}>
          {displaySeconds}
        </span>
      )}
    </div>
  );
}

/** Deterministic per-src pseudo-random bar heights (30–100%) so the same
 *  clip always draws the same waveform shape across re-renders. */
function useSeededBarHeights(seed: string, count: number): number[] {
  const [heights] = useState(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      h = (h * 1103515245 + 12345) >>> 0;
      out.push(30 + (h % 1000) / 1000 * 70);
    }
    return out;
  });
  return heights;
}
