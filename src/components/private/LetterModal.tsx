"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PrivateEntry } from "@/lib/usePrivateFeed";

interface LetterModalProps {
  entry: PrivateEntry | null;
  onClose: () => void;
}

/** メッセージは最大500文字。短いほど大きく、長いほど小さく、
 *  常に読みやすいサイズに収まるよう段階的に調整する。 */
function getMessageFontSizeClass(length: number): string {
  if (length <= 40) return "text-3xl";
  if (length <= 80) return "text-2xl";
  if (length <= 150) return "text-xl";
  if (length <= 260) return "text-lg";
  if (length <= 380) return "text-base";
  return "text-sm";
}

/**
 * 2026-07-08: Cinematic redesign pass. The letter should feel like a
 * collectible prop from the ending scene of a live-action fairytale — warm
 * candlelight parchment, italic Cormorant Garamond greeting, a refined
 * Zen Old Mincho serif for the Japanese message and signature, and a
 * glassmorphic voice player standing in as the letter's "wax seal" moment.
 *
 * Layout stays a single vertical flex column (Greeting → MessageScrollArea →
 * VoicePlayer → Sender). The message body is the only element that can ever
 * change height; the player and signature never move. The parchment's own
 * aspect ratio was made taller than the source art's native 2:3 so every
 * section — including the signature — always sits safely inside the paper,
 * never spilling past the frame artwork.
 */
export default function LetterModal({ entry, onClose }: LetterModalProps) {
  const messageSizeClass = entry ? getMessageFontSizeClass(entry.message.length) : "text-base";

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
            className="relative w-full max-w-md"
            style={{
              // Native frame art is 2:3, but the parchment is stretched
              // ~100px taller so the signature always has room to breathe
              // inside the paper rather than crowding the bottom border.
              aspectRatio: "2 / 3.45",
              maxHeight: "calc(100vh - 4rem)",
              backgroundImage: "url(/images/decor/letter_frame_rose.png)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              filter: "drop-shadow(0 20px 45px rgba(60,30,50,0.35))",
            }}
          >
            <CloseButton onClose={onClose} />

            {/* Single vertical flex column — every section flows naturally,
                nothing is absolutely positioned. Side/top padding lines the
                content up with the rose frame artwork; bottom padding keeps
                the signature clear of the bottom border, plus the letter's
                own 24px of closing breathing room. */}
            <div
              className="flex h-full w-full flex-col"
              style={{
                paddingLeft: "13%",
                paddingRight: "13%",
                paddingTop: "26%",
                paddingBottom: "calc(15% + 24px)",
              }}
            >
              <Greeting />
              <MessageScrollArea message={entry.message} sizeClass={messageSizeClass} />
              {entry.voiceUrl && (
                <VoicePlayer src={entry.voiceUrl} durationSeconds={entry.voiceDurationSeconds} />
              )}
              <Sender name={entry.nickname} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="閉じる"
      className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M1 1L11 11M11 1L1 11" stroke="#8b8398" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/** Fixed-height greeting line. Never shrinks, never scrolls. Italic
 *  Cormorant Garamond in warm antique gold — the letter's opening flourish. */
function Greeting() {
  return (
    <h2
      className="flex-shrink-0 text-center font-display text-3xl font-semibold italic"
      style={{ color: "#8A6A3E", marginBottom: "40px" }}
    >
      Dear MIKA
    </h2>
  );
}

/**
 * The ONLY scrollable region in the letter. Grows to fill whatever space is
 * left between the greeting and the player/signature below, with a
 * guaranteed min/max height so the letter never feels cramped or runs away
 * on very long messages. Short messages sit at the top with open, elegant
 * space beneath; long messages scroll internally and never push the player
 * or signature out of place.
 */
function MessageScrollArea({ message, sizeClass }: { message: string; sizeClass: string }) {
  return (
    <div
      className="flex flex-col items-center px-4"
      style={{
        flex: "1 1 auto",
        minHeight: "220px",
        maxHeight: "420px",
        overflowY: "auto",
        overflowX: "hidden",
        marginBottom: "32px",
      }}
    >
      <p
        className={`w-full whitespace-pre-wrap text-center font-letter-jp ${sizeClass}`}
        style={{ color: "#5B4B43", lineHeight: 1.8, letterSpacing: "0.02em" }}
      >
        {message}
      </p>
    </div>
  );
}

/**
 * The letter's "wax seal" moment — a soft glassmorphic capsule that always
 * stays in place beneath the message, never compressed or displaced.
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
      className="flex w-full flex-shrink-0 items-center gap-3 rounded-[24px] px-[18px]"
      style={{
        marginBottom: "16px",
        minHeight: "74px",
        background: "rgba(255,245,245,0.65)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 8px 28px rgba(139,90,60,0.14), inset 0 1px 1px rgba(255,255,255,0.6)",
      }}
    >
      <audio ref={audioRef} src={src} preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "一時停止" : "再生"}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          background: "linear-gradient(135deg, #ff9ec4, #ff6fa8)",
          boxShadow: "0 4px 14px rgba(255,111,168,0.45)",
        }}
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

/** The handwritten signature. Always inside the parchment, right-aligned,
 *  directly beneath the player, with the letter's closing breathing room
 *  handled by the parent's own bottom padding. */
function Sender({ name }: { name: string | null | undefined }) {
  return (
    <div className="flex-shrink-0 text-right">
      <p className="font-body text-[11px]" style={{ color: "#A6885A" }}>
        From
      </p>
      <p
        className="font-letter-jp text-xl font-semibold"
        style={{ color: "#7A5B34" }}
      >
        {name || "（名前未設定）"}
      </p>
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
