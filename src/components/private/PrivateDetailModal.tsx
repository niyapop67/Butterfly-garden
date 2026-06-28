"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ButterflyImage from "@/components/butterfly/ButterflyImage";
import { BUTTERFLY_THEMES } from "@/types/submission";
import type { PrivateEntry } from "@/lib/usePrivateFeed";

interface PrivateDetailModalProps {
  entry: PrivateEntry | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

/**
 * Full-detail overlay for ガーデン探索 mode — tapping a butterfly tile in
 * the grid opens this instead of inline-expanding (message text + an
 * audio player don't fit in a packed multi-column grid). Closing returns
 * to the grid so browsing feels spatial/exploratory rather than linear —
 * the trait that's meant to set this mode apart from 名前一覧リスト (a
 * flat list) and おまかせ再生 (a fixed sequence).
 */
export default function PrivateDetailModal({ entry, onClose, onPrev, onNext }: PrivateDetailModalProps) {
  useEffect(() => {
    if (!entry) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && onPrev) onPrev();
      else if (e.key === "ArrowRight" && onNext) onNext();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [entry, onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={entry.nickname || "蝶の詳細"}
            className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/60 bg-white/95 backdrop-blur-md"
            style={{ boxShadow: "var(--shadow-glass-soft)" }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/70"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 1L13 13M13 1L1 13" stroke="#5a4f6e" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="flex flex-col items-center px-6 py-8 text-center">
              <ButterflyImage type={entry.butterflyType} size="medium" displayWidth={96} />
              <p className="mt-3 font-display-jp text-base font-semibold" style={{ color: "var(--color-ink)" }}>
                {entry.nickname || "（名前未設定）"}
              </p>
              <p className="mt-0.5 font-body text-[11px]" style={{ color: "var(--color-ink-soft)" }}>
                {BUTTERFLY_THEMES[entry.butterflyType]?.labelJa ?? ""}
              </p>

              <p className="mt-5 whitespace-pre-wrap text-left font-body text-sm leading-relaxed" style={{ color: "var(--color-ink)" }}>
                {entry.message}
              </p>

              {entry.voiceUrl && (
                <audio controls preload="none" src={entry.voiceUrl} className="mt-4 h-9 w-full" />
              )}
            </div>

            {(onPrev || onNext) && (
              <div className="flex items-center justify-between border-t border-white/50 px-4 py-3">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={!onPrev}
                  className="font-body text-xs underline disabled:opacity-30"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  ← 前の蝶
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!onNext}
                  className="font-body text-xs underline disabled:opacity-30"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  次の蝶 →
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
