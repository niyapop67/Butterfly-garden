"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CrystalButton from "@/components/ui/CrystalButton";
import { VOICE_MAX_SECONDS } from "@/types/submission";

interface VoiceRecorderProps {
  onRecorded: (blob: Blob | null, durationSeconds: number | null) => void;
  disabled?: boolean;
}

type RecorderState = "idle" | "recording" | "recorded" | "unsupported" | "permission-denied";

/**
 * Voice message recorder for submit step 3 (spec v2.9 §1.10 / §2.2).
 * Records WebM via MediaRecorder, hard-stops at VOICE_MAX_SECONDS (60s,
 * see docs/spec-v2.9-diff-2026-06-26.md §1). Recording is optional —
 * participants can skip straight to the butterfly-selection step.
 */
export default function VoiceRecorder({ onRecorded, disabled = false }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // recorder.onstop is a closure created back when startRecording() ran, so
  // it would otherwise always see elapsedSeconds as it was at that moment
  // (0) rather than the latest tick from setInterval. Mirror the latest
  // value into a ref so onstop can read it without going stale.
  const elapsedSecondsRef = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.MediaRecorder) {
      setState("unsupported");
    }
  }, []);

  // Clean up the object URL and any open mic stream on unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setState("recorded");
        onRecorded(blob, elapsedSecondsRef.current);
      };

      recorder.start();
      setState("recording");
      setElapsedSeconds(0);
      elapsedSecondsRef.current = 0;

      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          elapsedSecondsRef.current = next;
          if (next >= VOICE_MAX_SECONDS) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch {
      setState("permission-denied");
    }
  }

  function handleRerecord() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;
    setState("idle");
    onRecorded(null, null);
  }

  function handleSkip() {
    onRecorded(null, null);
  }

  if (state === "unsupported") {
    return (
      <p className="font-body text-sm" style={{ color: "var(--color-ink-soft)" }}>
        お使いのブラウザはボイス録音に対応していません。メッセージのみで送信できます。
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {state === "idle" && (
        <>
          <CrystalButton type="button" onClick={startRecording} disabled={disabled}>
            🎙️ 録音を始める
          </CrystalButton>
          <button
            type="button"
            onClick={handleSkip}
            disabled={disabled}
            className="font-body text-xs underline disabled:opacity-50"
            style={{ color: "var(--color-ink-soft)" }}
          >
            ボイスは録音しない
          </button>
        </>
      )}

      {state === "recording" && (
        <>
          <p className="font-display-jp text-lg" style={{ color: "var(--color-ink)" }}>
            {elapsedSeconds} / {VOICE_MAX_SECONDS} 秒
          </p>
          <CrystalButton type="button" variant="ghost" onClick={stopRecording}>
            ⏹ 録音を終える
          </CrystalButton>
        </>
      )}

      {state === "recorded" && previewUrl && (
        <>
          <audio src={previewUrl} controls className="w-full" />
          <p className="font-body text-xs" style={{ color: "var(--color-ink-soft)" }}>
            録音時間：約{elapsedSeconds}秒
          </p>
          <button
            type="button"
            onClick={handleRerecord}
            disabled={disabled}
            className="font-body text-xs underline disabled:opacity-50"
            style={{ color: "var(--color-ink-soft)" }}
          >
            録音し直す
          </button>
        </>
      )}

      {state === "permission-denied" && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-center font-body text-sm text-rose-500">
            マイクへのアクセスが許可されませんでした。設定を確認するか、ボイスなしで進んでください。
          </p>
          <button
            type="button"
            onClick={() => setState("idle")}
            className="font-body text-xs underline"
            style={{ color: "var(--color-ink-soft)" }}
          >
            もう一度試す
          </button>
        </div>
      )}
    </div>
  );
}
