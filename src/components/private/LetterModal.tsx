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
  if (length <= 40) return "text-2xl";
  if (length <= 80) return "text-xl";
  if (length <= 150) return "text-lg";
  if (length <= 260) return "text-base";
  if (length <= 380) return "text-[15px]";
  return "text-sm";
}

/**
 * 2026-07-08 (rebuild #2): The previous version stretched a single frame
 * photo across a fixed aspect-ratio box — every time the message got long
 * or the viewport got short, that box either squished the artwork or spilled
 * content past its border. Rewritten to match the reference the birthday
 * team shared: a compact, CONTENT-SIZED card (no aspect-ratio, no stretched
 * background) with a simple double gold line border and small corner
 * flourishes. Height now comes from the content itself, capped by a
 * max-height on the card and an internal scroll region for the message, so
 * nothing can ever spill outside the paper again.
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
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-5 py-8"
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
            style={{ maxWidth: "26rem", maxHeight: "88vh" }}
          >
            {/* Outer frame: thin gold line, soft paper gradient, gentle shadow */}
            <div
              className="relative flex h-full flex-col rounded-sm p-[6px]"
              style={{
                background: "linear-gradient(160deg, #FFFDF6 0%, #FDF3E7 55%, #FBEEDD 100%)",
                border: "1px solid rgba(184,147,90,0.55)",
                boxShadow: "0 24px 50px rgba(60,30,50,0.28)",
                maxHeight: "88vh",
              }}
            >
              {/* Inner line: the double-border look from the reference */}
              <div
                className="relative flex min-h-0 flex-1 flex-col rounded-[2px] px-7 py-8 sm:px-9"
                style={{ border: "1px solid rgba(184,147,90,0.32)" }}
              >
                <CornerFlourish position="tl" />
                <CornerFlourish position="tr" />
                <CornerFlourish position="bl" />
                <CornerFlourish position="br" />

                <CloseButton onClose={onClose} />

                <RoseCrest />
                <Greeting />
                <Divider />
                <MessageScrollArea message={entry.message} sizeClass={messageSizeClass} />
                <Divider />

                {/* Sender + player: a single fixed block that never scrolls
                    and never moves — the name sits right above the player. */}
                <div className="flex flex-shrink-0 flex-col">
                  <Sender name={entry.nickname} />
                  {entry.voiceUrl && (
                    <VoicePlayer src={entry.voiceUrl} durationSeconds={entry.voiceDurationSeconds} />
                  )}
                </div>
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
      className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm"
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M1 1L11 11M11 1L1 11" stroke="#8b8398" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/** Small quarter-corner ornament, fixed pixel size — unlike a stretched
 *  background, this never distorts or drifts regardless of card size. */
function CornerFlourish({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const rotation: Record<string, number> = { tl: 0, tr: 90, br: 180, bl: 270 };
  const placement: Record<string, string> = {
    tl: "left-1 top-1",
    tr: "right-1 top-1",
    br: "right-1 bottom-1",
    bl: "left-1 bottom-1",
  };
  return (
    <svg
      className={`pointer-events-none absolute ${placement[position]} h-6 w-6`}
      style={{ transform: `rotate(${rotation[position]}deg)` }}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 26 V10 C2 5 5 2 10 2 H26"
        stroke="#B8935A"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="9" cy="9" r="1.3" fill="#B8935A" />
    </svg>
  );
}

/** Small centered divider, standing in for the reference's "•••" rule. */
function Divider() {
  return (
    <div
      className="flex-shrink-0 select-none text-center"
      style={{ color: "#C7A876", letterSpacing: "6px", margin: "14px 0", fontSize: "11px" }}
      aria-hidden
    >
      • • •
    </div>
  );
}

/** Small crest — crops just the rose bouquet from the top of the frame
 *  artwork into a fixed, non-stretching size, so the richer decoration
 *  from the original design comes back without reintroducing the
 *  full-frame scaling problems. */
function RoseCrest() {
  return (
    <div
      className="mx-auto flex-shrink-0"
      style={{
        width: "72%",
        maxWidth: "220px",
        height: "64px",
        marginBottom: "8px",
        backgroundImage: "url(/images/decor/letter_frame_rose.png)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
      aria-hidden
    />
  );
}

/** Fixed-height greeting line. Never shrinks, never scrolls. Italic
 *  Cormorant Garamond in warm antique gold — the letter's opening flourish. */
function Greeting() {
  return (
    <h2
      className="flex-shrink-0 text-center font-display text-2xl font-semibold italic"
      style={{ color: "#8A6A3E" }}
    >
      Dear MIKA
    </h2>
  );
}

/**
 * The ONLY scrollable region in the letter. A generous but bounded
 * max-height keeps the whole card content-sized and predictable; short
 * messages just take up less room (no forced empty space), long messages
 * scroll internally and never push the player or signature out of place.
 */
function MessageScrollArea({ message, sizeClass }: { message: string; sizeClass: string }) {
  return (
    <div
      className="flex min-h-0 flex-col items-center px-1"
      style={{
        flex: "0 1 auto",
        maxHeight: "38vh",
        overflowY: "auto",
        overflowX: "hidden",
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
      className="mt-3 flex w-full flex-shrink-0 items-center gap-3 rounded-full px-4 py-2"
      style={{
        minHeight: "48px",
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

/** The handwritten signature. Right-aligned, directly above the player,
 *  always inside the card since the card is content-sized. */
function Sender({ name }: { name: string | null | undefined }) {
  return (
    <div className="flex-shrink-0 text-center">
      <p className="font-body text-[11px]" style={{ color: "#A6885A" }}>
        From
      </p>
      <p className="font-letter-jp text-lg font-semibold" style={{ color: "#7A5B34" }}>
        {name || "（名前未設定）"}
      </p>
    </div>
  );
}
