/**
 * Butterfly types & Firestore submission schema.
 *
 * Source of truth: redesign spec v2.9 §1.8 (theme keywords) + chat log
 * 2026-06-26 diff (message/voice limits, password gate). See
 * docs/spec-v2.9-diff-2026-06-26.md for the full list of changes.
 */

/** The 6 official butterfly types (2026-07-05: reduced from 7 — see
 *  src/lib/butterflyAssets.ts for why twinkle-premium was folded into
 *  crystal-white). Order matches v2.9 §1.8 minus that entry. */
export const BUTTERFLY_TYPES = [
  "pink-heart",
  "tiffany-sky",
  "crystal-white",
  "aurora-dream",
  "emerald-garden",
  "golden-sunshine",
] as const;

export type ButterflyType = (typeof BUTTERFLY_TYPES)[number];

export interface ButterflyThemeInfo {
  type: ButterflyType;
  labelEn: string;
  labelJa: string;
  themeJa: string;
}

/** Theme keyword table, v2.9 §1.8. */
export const BUTTERFLY_THEMES: Record<ButterflyType, ButterflyThemeInfo> = {
  "pink-heart": {
    type: "pink-heart",
    labelEn: "Pink Heart / Love",
    labelJa: "ピンクハート",
    themeJa: "愛・応援・癒し",
  },
  "tiffany-sky": {
    type: "tiffany-sky",
    labelEn: "Tiffany Sky / Dream",
    labelJa: "ティファニースカイ",
    themeJa: "夢・希望・未来",
  },
  "crystal-white": {
    type: "crystal-white",
    labelEn: "Crystal White / Pure",
    labelJa: "クリスタルホワイト",
    themeJa: "純粋・誠実・絆",
  },
  "aurora-dream": {
    type: "aurora-dream",
    labelEn: "Rainbow Butterfly / Fantasy",
    labelJa: "レインボーバタフライ",
    themeJa: "神秘・ときめき",
  },
  "emerald-garden": {
    type: "emerald-garden",
    labelEn: "Emerald Garden / Growth",
    labelJa: "エメラルドガーデン",
    themeJa: "見守り・絆",
  },
  "golden-sunshine": {
    type: "golden-sunshine",
    labelEn: "Golden Sunshine / Smile",
    labelJa: "ゴールデンサンシャイン",
    themeJa: "元気・幸運",
  },
};

/** v2.9 diff: message limit raised 300 -> 500 chars. */
export const MESSAGE_MAX_LENGTH = 500;

/** v2.9 diff: voice limit raised 10-20s -> 60s. */
export const VOICE_MAX_SECONDS = 60;

/** Nickname is short and unconstrained by spec beyond "required". Keep a
 * sane upper bound so it can't be used to smuggle in a huge string. */
export const NICKNAME_MAX_LENGTH = 40;

/**
 * Firestore document shape for a single participant submission.
 * Collection: "submissions"
 */
export interface SubmissionDoc {
  nickname: string;
  message: string;
  butterflyType: ButterflyType;
  /** Storage download URL, or null if the participant skipped voice recording. */
  voiceUrl: string | null;
  /** Duration of the recorded voice clip in seconds, rounded. Null if no voice. */
  voiceDurationSeconds: number | null;
  /** Server timestamp (Firestore Timestamp at write time, via serverTimestamp()). */
  createdAt: unknown;
}

/** Shape used while the form is being filled out, before submission. */
export interface SubmissionDraft {
  nickname: string;
  message: string;
  butterflyType: ButterflyType | null;
  voiceBlob: Blob | null;
  voiceDurationSeconds: number | null;
}

export const EMPTY_DRAFT: SubmissionDraft = {
  nickname: "",
  message: "",
  butterflyType: null,
  voiceBlob: null,
  voiceDurationSeconds: null,
};
