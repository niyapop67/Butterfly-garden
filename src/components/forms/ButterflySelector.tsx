"use client";

import { motion } from "framer-motion";
import ButterflyImage from "@/components/butterfly/ButterflyImage";
import {
  BUTTERFLY_TYPES,
  BUTTERFLY_THEMES,
  type ButterflyType,
} from "@/types/submission";

interface ButterflySelectorProps {
  value: ButterflyType | null;
  onChange: (type: ButterflyType) => void;
  /** Disables tap interaction while a submission is in flight (passed from
   * SubmitFlow during handleSubmit). Selection itself stays freely
   * changeable up until the moment of final submission — see chat decision
   * 2026-06-28: "送信前は何回でも選び直してOK" — only the *submitted* choice
   * is permanent (there's no edit-after-submit feature anywhere in the app,
   * which is the real meaning of "送信後は変更できません"). */
  disabled?: boolean;
}

/**
 * 7-type butterfly picker for the submit flow (spec v2.9 §1.8 / §2.2).
 * Renders via ButterflyImage, so placeholder colours for Crystal White /
 * Emerald Garden / Golden Sunshine show up automatically until their real
 * assets land (see src/lib/butterflyAssets.ts).
 */
export default function ButterflySelector({
  value,
  onChange,
  disabled = false,
}: ButterflySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {BUTTERFLY_TYPES.map((type) => {
        const theme = BUTTERFLY_THEMES[type];
        const isSelected = value === type;

        return (
          <motion.button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onChange(type)}
            whileTap={disabled ? undefined : { scale: 0.96 }}
            className={`flex flex-col items-center gap-1 rounded-3xl border px-3 py-4 text-center transition-colors disabled:opacity-60 ${
              isSelected
                ? "border-[var(--color-tiffany)] bg-white/70"
                : "border-white/50 bg-white/30"
            }`}
            style={{
              boxShadow: isSelected ? "var(--shadow-glow-pink)" : "var(--shadow-glass-soft)",
            }}
          >
            <div className="flex h-16 w-16 items-center justify-center">
              <ButterflyImage type={type} size="small" displayWidth={56} displayHeight={64} />
            </div>
            <span className="font-display-jp text-xs" style={{ color: "var(--color-ink)" }}>
              {theme.labelJa}
            </span>
            <span className="font-body text-[11px]" style={{ color: "var(--color-ink-soft)" }}>
              {theme.themeJa}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
