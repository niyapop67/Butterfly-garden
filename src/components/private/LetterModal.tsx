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
            className="relative w-full"
            style={{
              // Back to width-first sizing (the previous 2:3.45 ratio),
              // just bigger overall and wider so ~20 characters fit
              // comfortably per line. If the card is ever taller than the
              // viewport, the overlay itself scrolls (it has its own
              // overflow-y-auto) rather than the card being height-clamped
              // and squished — squishing is what threw the percentage
              // padding out of sync with the frame artwork before.
              maxWidth: "36rem",
              aspectRatio: "2 / 3.45",
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
                paddingLeft: "10%",
                paddingRight: "10%",
                paddingTop: "26%",
                paddingBottom: "16%",
              }}
            >
              <Greeting />
              <MessageScrollArea message={entry.message} sizeClass={messageSizeClass} />
              {/* Sender + player are a single fixed block: the name sits at
                  the player's top-right corner, both flex-shrink:0, neither
                  ever scrolls. */}
              <div className="flex flex-shrink-0 flex-col" style={{ marginBottom: "24px" }}>
                <Sender name={entry.nickname} />
                {entry.voiceUrl && (
                  <VoicePlayer src={entry.voiceUrl} durationSeconds={entry.voiceDurationSeconds} />
                )}
              </div>
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

  useEffect(() => {
    function handleEnded() {
      setIsPlaying(false);
    }

    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener("ended", handleEnded);
    return () => {
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

  const displaySeconds =
    durationSeconds != null
      ? `0:${String(Math.round(durationSeconds)).padStart(2, "0")}`
      : "";

  return (
    <div
      className="flex w-full flex-shrink-0 items-center gap-3 rounded-full px-4 py-2"
      style={{
        minHeight: "52px",
        background: "rgba(255,245,245,0.65)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 6px 20px rgba(139,90,60,0.14), inset 0 1px 1px rgba(255,255,255,0.6)",
      }}
    >
      <audio ref={audioRef} src={src} preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "一時停止" : "再生"}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
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

      <span className="font-body text-[12px]" style={{ color: "#a06080" }}>
        {isPlaying ? "再生中…" : "ボイスメッセージ"}
      </span>

      {displaySeconds && (
        <span className="ml-auto flex-shrink-0 font-body text-[11px]" style={{ color: "#a06080" }}>
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
    <div className="flex-shrink-0 text-right" style={{ marginBottom: "8px" }}>
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

