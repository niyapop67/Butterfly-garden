"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PrivateEntry } from "@/lib/usePrivateFeed";

interface LetterModalProps {
  entry: PrivateEntry | null;
  onClose: () => void;
}

function getMessageFontSizeClass(length: number): string {
  if (length <= 40) return "text-3xl";
  if (length <= 80) return "text-2xl";
  if (length <= 150) return "text-xl";
  if (length <= 260) return "text-lg";
  if (length <= 380) return "text-lg";
  return "text-base";
}

function getModalMaxWidth(length: number): string {
  if (length <= 150) return "29rem";
  if (length <= 300) return "32rem";
  return "35rem";
}

export default function LetterModal({ entry, onClose }: LetterModalProps) {
  const messageSizeClass = entry ? getMessageFontSizeClass(entry.message.length) : "text-base";
  const modalMaxWidth = entry ? getModalMaxWidth(entry.message.length) : "29rem";

  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          key="letter-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-5 py-10"
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
            style={{ maxWidth: modalMaxWidth }}
          >
            {/*
             * Decoration layer — sits ABOVE the paper so ornaments overlap the border.
             * All three images are positioned with their "arm" (the horizontal gold
             * branch) at the same CSS top/bottom value so the lines visually connect:
             *
             *   Corner arm centre  = 23.6% of corner image height
             *   Rose arm centre    = 49.0% of rose image height
             *   Crystal arm centre = 45.7% of crystal image height
             *
             * The card's top padding (5.5rem ≈ 88px) leaves room for the rose to
             * overlap from above; bottom padding (4.5rem ≈ 72px) leaves room for
             * the crystal to overlap from below.
             */}

            {/* ── Corner flourishes ── */}
            <img src="/images/decor/corner_tl_new.png" alt="" aria-hidden className="pointer-events-none absolute"
              style={{ width: "21%", top: "-6px", left: "-6px", zIndex: 20 }} />
            <img src="/images/decor/corner_tl_new.png" alt="" aria-hidden className="pointer-events-none absolute"
              style={{ width: "21%", top: "-6px", right: "-6px", zIndex: 20, transform: "scaleX(-1)" }} />
            <img src="/images/decor/corner_tl_new.png" alt="" aria-hidden className="pointer-events-none absolute"
              style={{ width: "21%", bottom: "-6px", left: "-6px", zIndex: 20, transform: "scaleY(-1)" }} />
            <img src="/images/decor/corner_tl_new.png" alt="" aria-hidden className="pointer-events-none absolute"
              style={{ width: "21%", bottom: "-6px", right: "-6px", zIndex: 20, transform: "scale(-1,-1)" }} />

            <CloseButton onClose={onClose} />
            <div className="pointer-events-none absolute left-0 right-0 flex justify-center"
              style={{ top: 0, transform: "translateY(-42%)", zIndex: 25 }}>
              <img src="/images/decor/rose_top.png" alt="" aria-hidden style={{ width: "46%", height: "auto" }} />
            </div>

            {/* ── Crystal — bottom centre ── */}
            <div className="pointer-events-none absolute left-0 right-0 flex justify-center"
              style={{ bottom: 0, transform: "translateY(38%)", zIndex: 25 }}>
              <img src="/images/decor/crystal_bottom.png" alt="" aria-hidden style={{ width: "30%", height: "auto" }} />
            </div>

            {/* ── Paper card ── */}
            <div
              className="relative flex flex-col rounded-sm"
              style={{
                background: "linear-gradient(160deg, #FFFDF6 0%, #FDF3E7 55%, #FBEEDD 100%)",
                border: "1px solid rgba(184,147,90,0.40)",
                boxShadow: "0 24px 50px rgba(60,30,50,0.28)",
                zIndex: 10,
                paddingLeft: entry && entry.message.length > 260 ? "3rem" : "1.75rem",
                paddingRight: entry && entry.message.length > 260 ? "3rem" : "1.75rem",
                paddingTop: "3.25rem",
                paddingBottom: "3.5rem",
              }}
            >
              <Greeting />
              <Divider />
              <MessageScrollArea message={entry.message} sizeClass={messageSizeClass} />
              <div className="flex flex-shrink-0 flex-col">
                {entry.voiceUrl && (
                  <VoicePlayer src={entry.voiceUrl} durationSeconds={entry.voiceDurationSeconds} />
                )}
                <Sender name={entry.nickname} />
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
      className="pointer-events-auto absolute flex h-9 w-9 items-center justify-center"
      style={{ top: "-14px", right: "-14px", zIndex: 40 }}
    >
      <img src="/images/decor/close_button_gem.png" alt="" aria-hidden className="h-full w-full object-contain drop-shadow-md" />
    </button>
  );
}

function Divider() {
  return (
    <div
      className="flex-shrink-0 select-none text-center"
      style={{ color: "#C7A876", letterSpacing: "6px", margin: "12px 0", fontSize: "11px" }}
      aria-hidden
    >
      • • •
    </div>
  );
}

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

function MessageScrollArea({ message, sizeClass }: { message: string; sizeClass: string }) {
  const isShort = message.length <= 30 && !message.includes("\n");
  return (
    <div
      className="flex flex-col items-center self-center px-1"
      style={{
        width: "19.3em",
      }}
    >
      <p
        className={`w-full whitespace-pre-wrap font-letter-jp ${isShort ? "text-center" : "text-left"} ${sizeClass}`}
        style={{ color: "#3B2A1A", lineHeight: 1.9, letterSpacing: "0.02em", fontWeight: 600 }}
      >
        {message}
      </p>
    </div>
  );
}

function VoicePlayer({ src, durationSeconds }: { src: string; durationSeconds: number | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const barCount = 28;
  const bars = useSeededBarHeights(src, barCount);

  useEffect(() => {
    function handleTimeUpdate() {
      const audio = audioRef.current;
      if (!audio || !audio.duration) return;
      setProgress(audio.currentTime / audio.duration);
    }
    function handleEnded() { setIsPlaying(false); setProgress(0); }
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
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play(); setIsPlaying(true); }
  }

  const activeBars = Math.round(progress * barCount);
  const displaySeconds = durationSeconds != null
    ? `0:${String(Math.round(durationSeconds)).padStart(2, "0")}`
    : "";

  return (
    <div
      className="mt-2 flex w-full flex-shrink-0 items-center gap-2 rounded-full px-3 py-2"
      style={{
        minHeight: "44px",
        background: "rgba(255,245,245,0.70)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,200,210,0.50)",
        boxShadow: "0 4px 14px rgba(139,90,60,0.10), inset 0 1px 1px rgba(255,255,255,0.7)",
      }}
    >
      <audio ref={audioRef} src={src} preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "一時停止" : "再生"}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(135deg,#ff9ec4,#ff6fa8)", boxShadow: "0 3px 10px rgba(255,111,168,0.40)" }}
      >
        {isPlaying ? (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
            <rect x="1" y="1" width="3.5" height="10" rx="1" fill="white" />
            <rect x="7" y="1" width="3.5" height="10" rx="1" fill="white" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2 1L11 6L2 11V1Z" fill="white" />
          </svg>
        )}
      </button>

      <div className="flex flex-1 items-end gap-[2px]" style={{ height: "22px" }} aria-hidden>
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[2px] flex-shrink-0 rounded-full"
            style={{
              height: `${Math.max(3, Math.round((h / 100) * 22))}px`,
              background: i < activeBars ? "#ff6fa8" : "rgba(224,160,192,0.45)",
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

function Sender({ name }: { name: string | null | undefined }) {
  return (
    <div className="flex flex-shrink-0 items-baseline justify-end gap-1.5 pt-3">
      <span className="font-body text-xs" style={{ color: "#A6885A" }}>From</span>
      <span className="font-body text-base font-semibold" style={{ color: "#7A5B34" }}>
        {name || "（名前未設定）"}
      </span>
    </div>
  );
}

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
