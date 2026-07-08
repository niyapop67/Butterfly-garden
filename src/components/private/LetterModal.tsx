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
                className="relative flex min-h-0 flex-1 flex-col rounded-[2px] px-9 py-10 sm:px-11"
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

                <GemDivider />
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
      className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center"
    >
      <img src="/images/decor/close_button_gem.png" alt="" aria-hidden className="h-full w-full object-contain" />
    </button>
  );
}

/** Corner ornament using the new individually-generated jeweled artwork —
 *  each corner is its own image at its own natural aspect ratio, placed at
 *  a fixed size (never stretched to fill the card, so it can't distort or
 *  drift regardless of how tall/short the letter ends up being). */
function CornerFlourish({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const placement: Record<string, string> = {
    tl: "left-0 top-0",
    tr: "right-0 top-0",
    br: "right-0 bottom-0",
    bl: "left-0 bottom-0",
  };
  const src: Record<string, string> = {
    tl: "/images/decor/corner_tl.png",
    tr: "/images/decor/corner_tr.png",
    bl: "/images/decor/corner_bl.png",
    br: "/images/decor/corner_br.png",
  };
  return (
    <img
      src={src[position]}
      alt=""
      aria-hidden
      className={`pointer-events-none absolute ${placement[position]} h-16 w-auto sm:h-20`}
    />
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

/** Top-center decoration — the rose bouquet spray, shown at its own
 *  natural aspect ratio (no stretching, no cropping needed since it's
 *  already a clean horizontal spray with a transparent background). */
function RoseCrest() {
  return (
    <img
      src="/images/decor/rose_bouquet_divider.png"
      alt=""
      aria-hidden
      className="mx-auto flex-shrink-0"
      style={{ width: "76%", maxWidth: "260px", height: "auto", marginBottom: "6px" }}
    />
  );
}

/** Bottom-center decoration — a smaller matching gem+gold flourish that
 *  closes the letter beneath the signature, mirroring the rose bouquet
 *  up top. Same "natural size, never stretched" approach. */
function GemDivider() {
  return (
    <img
      src="/images/decor/gem_divider_bottom.png"
      alt=""
      aria-hidden
      className="mx-auto flex-shrink-0"
      style={{ width: "50%", maxWidth: "170px", height: "auto", marginTop: "14px" }}
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
 * The letter's "wax seal" moment. Uses the provided jeweled player frame
 * as the background (sized at its own aspect ratio so the border artwork
 * never stretches or distorts), an invisible button overlaid on top of the
 * frame's own painted play button, and the glowing waveform image overlaid
 * in two layers — a dim full-width copy plus a bright copy clipped to the
 * playback progress — to fake a real progress bar from a single static
 * graphic.
 */
function VoicePlayer({ src, durationSeconds }: { src: string; durationSeconds: number | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1

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

  const displaySeconds =
    durationSeconds != null
      ? `0:${String(Math.round(durationSeconds)).padStart(2, "0")}`
      : "";

  return (
    <div
      className="relative mt-3 w-full flex-shrink-0"
      style={{ aspectRatio: "1868 / 560" }}
    >
      <audio ref={audioRef} src={src} preload="none" />

      <img
        src="/images/decor/voice_player_frame.png"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-contain"
      />

      {/* Waveform: dim base copy + bright copy clipped to playback progress */}
      <div className="absolute" style={{ left: "27%", right: "8%", top: "28%", height: "44%" }}>
        <img
          src="/images/decor/voice_waveform_glow.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-contain object-left opacity-30"
        />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${progress * 100}%` }}>
          <img
            src="/images/decor/voice_waveform_glow.png"
            alt=""
            aria-hidden
            className="h-full object-contain object-left"
            style={{ width: "calc(100% / " + Math.max(progress, 0.0001) + ")" }}
          />
        </div>
      </div>

      {displaySeconds && (
        <span
          className="absolute font-body text-[11px]"
          style={{ right: "9%", bottom: "12%", color: "#a06080" }}
        >
          {displaySeconds}
        </span>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "一時停止" : "再生"}
        className="absolute flex items-center justify-center"
        style={{ left: "2%", top: "10%", width: "24%", height: "80%" }}
      >
        {isPlaying && (
          <svg width="16" height="16" viewBox="0 0 12 12" fill="none" aria-hidden>
            <rect x="1" y="1" width="3.5" height="10" rx="1" fill="white" fillOpacity="0.9" />
            <rect x="7" y="1" width="3.5" height="10" rx="1" fill="white" fillOpacity="0.9" />
          </svg>
        )}
      </button>
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
