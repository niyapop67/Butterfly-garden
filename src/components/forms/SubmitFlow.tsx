"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";
import CrystalIcon from "@/components/ui/CrystalIcon";
import ButterflySelector from "@/components/forms/ButterflySelector";
import VoiceRecorder from "@/components/forms/VoiceRecorder";
import ButterflyImage from "@/components/butterfly/ButterflyImage";
import { submitEntry } from "@/lib/submitEntry";
import {
  EMPTY_DRAFT,
  MESSAGE_MAX_LENGTH,
  NICKNAME_MAX_LENGTH,
  VOICE_MAX_SECONDS,
  BUTTERFLY_THEMES,
  type SubmissionDraft,
} from "@/types/submission";

/**
 * The 5-step submit flow from spec v2.9 §1.10 / §2.2, kept as a single
 * page per the 2026-06-26 chat decision ("同一ページ内でステップ表示").
 * Step order: nickname -> message -> voice -> butterfly -> confirm/submit.
 */
type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<Step, string> = {
  1: "ニックネーム",
  2: "お祝いメッセージ",
  3: "ボイスメッセージ",
  4: "蝶を選ぶ",
  5: "確認して送信",
};

export default function SubmitFlow() {
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<SubmissionDraft>(EMPTY_DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  function goNext() {
    setStep((s) => (s < 5 ? ((s + 1) as Step) : s));
  }
  function goBack() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  function canProceedFromStep(s: Step): boolean {
    if (s === 1) return draft.nickname.trim().length > 0;
    if (s === 2) return draft.message.trim().length > 0;
    if (s === 4) return draft.butterflyType !== null;
    return true; // step 3 (voice) is optional, step 5 is the submit action itself
  }

  async function handleSubmit() {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await submitEntry(draft);
      setIsDone(true);
    } catch (err) {
      console.error(err);
      setSubmitError("送信に失敗しました。通信状況を確認してもう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return <ThankYouScreen />;
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-sm">
      <StepProgress step={step} />

      <GlassCard className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <NicknameStep
                value={draft.nickname}
                onChange={(nickname) => setDraft((d) => ({ ...d, nickname }))}
              />
            )}
            {step === 2 && (
              <MessageStep
                value={draft.message}
                onChange={(message) => setDraft((d) => ({ ...d, message }))}
              />
            )}
            {step === 3 && (
              <VoiceStep
                onRecorded={(voiceBlob, voiceDurationSeconds) =>
                  setDraft((d) => ({ ...d, voiceBlob, voiceDurationSeconds }))
                }
              />
            )}
            {step === 4 && (
              <ButterflyStep
                value={draft.butterflyType}
                onChange={(butterflyType) => setDraft((d) => ({ ...d, butterflyType }))}
              />
            )}
            {step === 5 && <ConfirmStep draft={draft} />}
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <p className="mt-4 text-center text-sm text-rose-500">{submitError}</p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              disabled={isSubmitting}
              className="font-body text-sm underline disabled:opacity-50"
              style={{ color: "var(--color-ink-soft)" }}
            >
              戻る
            </button>
          ) : (
            <span />
          )}

          {step < 5 ? (
            <CrystalButton
              type="button"
              onClick={goNext}
              disabled={!canProceedFromStep(step)}
              className="disabled:opacity-50"
            >
              {step === 4 ? "確認画面へ" : "次へ"}
            </CrystalButton>
          ) : (
            <CrystalButton type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "蝶を届ける"}
            </CrystalButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function StepProgress({ step }: { step: Step }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2">
      {([1, 2, 3, 4, 5] as Step[]).map((s) => (
        <div
          key={s}
          className="h-1.5 w-8 rounded-full transition-colors"
          style={{
            background: s <= step ? "var(--color-tiffany)" : "rgba(255,255,255,0.5)",
          }}
        />
      ))}
      <span className="ml-2 font-body text-[11px]" style={{ color: "var(--color-ink-soft)" }}>
        {STEP_LABELS[step]}
      </span>
    </div>
  );
}

function NicknameStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display-jp text-lg mb-1" style={{ color: "var(--color-ink)" }}>
        ニックネームを入力してください
      </h2>
      <p className="font-body text-xs mb-4" style={{ color: "var(--color-ink-soft)" }}>
        ガーデンに表示される名前です
      </p>
      <input
        type="text"
        value={value}
        maxLength={NICKNAME_MAX_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例：はなこ"
        autoFocus
        className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-tiffany)]"
      />
      <p className="mt-1 text-right font-body text-[11px]" style={{ color: "var(--color-ink-soft)" }}>
        {value.length} / {NICKNAME_MAX_LENGTH}
      </p>
    </div>
  );
}

function MessageStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display-jp text-lg mb-1" style={{ color: "var(--color-ink)" }}>
        お祝いメッセージ
      </h2>
      <p className="font-body text-xs mb-4" style={{ color: "var(--color-ink-soft)" }}>
        MIKAへの想いを込めて、{MESSAGE_MAX_LENGTH}字以内で書いてください
      </p>
      <textarea
        value={value}
        maxLength={MESSAGE_MAX_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        placeholder="MIKAへのメッセージを書いてね..."
        rows={6}
        autoFocus
        className="w-full resize-none rounded-2xl border border-white/60 bg-white/70 px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-tiffany)]"
      />
      <p className="mt-1 text-right font-body text-[11px]" style={{ color: "var(--color-ink-soft)" }}>
        {value.length} / {MESSAGE_MAX_LENGTH}
      </p>
    </div>
  );
}

function VoiceStep({
  onRecorded,
}: {
  onRecorded: (blob: Blob | null, durationSeconds: number | null) => void;
}) {
  return (
    <div>
      <h2 className="font-display-jp text-lg mb-1" style={{ color: "var(--color-ink)" }}>
        ボイスメッセージ
      </h2>
      <p className="font-body text-xs mb-4" style={{ color: "var(--color-ink-soft)" }}>
        声で気持ちを届けたい人はどうぞ（最大{VOICE_MAX_SECONDS}秒・任意）
      </p>
      <VoiceRecorder onRecorded={onRecorded} />
    </div>
  );
}

function ButterflyStep({
  value,
  onChange,
}: {
  value: SubmissionDraft["butterflyType"];
  onChange: (v: NonNullable<SubmissionDraft["butterflyType"]>) => void;
}) {
  return (
    <div>
      <h2 className="font-display-jp text-lg mb-1" style={{ color: "var(--color-ink)" }}>
        蝶を選んでください
      </h2>
      <p className="font-body text-xs mb-4" style={{ color: "var(--color-ink-soft)" }}>
        送信後は変更できません
      </p>
      <ButterflySelector value={value} onChange={onChange} />
    </div>
  );
}

function ConfirmStep({ draft }: { draft: SubmissionDraft }) {
  const theme = draft.butterflyType ? BUTTERFLY_THEMES[draft.butterflyType] : null;

  return (
    <div>
      <h2 className="font-display-jp text-lg mb-4 text-center" style={{ color: "var(--color-ink)" }}>
        この内容で送信します
      </h2>

      <div className="space-y-4 font-body text-sm" style={{ color: "var(--color-ink)" }}>
        <div>
          <p className="text-[11px]" style={{ color: "var(--color-ink-soft)" }}>
            ニックネーム
          </p>
          <p>{draft.nickname}</p>
        </div>
        <div>
          <p className="text-[11px]" style={{ color: "var(--color-ink-soft)" }}>
            メッセージ
          </p>
          <p className="whitespace-pre-wrap">{draft.message}</p>
        </div>
        <div>
          <p className="text-[11px]" style={{ color: "var(--color-ink-soft)" }}>
            ボイス
          </p>
          <p>{draft.voiceBlob ? `録音あり（約${draft.voiceDurationSeconds}秒）` : "録音なし"}</p>
        </div>
        {draft.butterflyType && theme && (
          <div className="flex flex-col items-center gap-2 pt-2">
            <ButterflyImage type={draft.butterflyType} size="medium" displayWidth={88} />
            <p className="font-display-jp text-sm">{theme.labelJa}</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-center font-body text-[11px]" style={{ color: "var(--color-ink-soft)" }}>
        送信後の編集はできません
      </p>
    </div>
  );
}

function ThankYouScreen() {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xs overflow-hidden rounded-3xl"
        style={{ boxShadow: "var(--shadow-glass-soft)" }}
      >
        {/* 2026-07-05: replaced the small bouncing butterfly emblem + plain
            "Thank you!" text with Niya's illustrated thank-you card — it
            already bakes in the title and message, so we don't repeat them
            below (would read as redundant). */}
        <Image
          src="/images/thank-you-card.jpg"
          alt="Thank you! あなたの想いは蝶になってガーデンに届きました"
          width={1023}
          height={1537}
          className="w-full h-auto object-contain"
          priority
        />
      </motion.div>

      <Link href="/garden" className="w-full max-w-xs">
        <CrystalButton className="w-full">
          <CrystalIcon size={18} />
          ガーデンを見る
        </CrystalButton>
      </Link>
    </div>
  );
}
