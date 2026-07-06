/**
 * Lightweight "already submitted" flag stored in this browser's
 * localStorage. This is NOT real duplicate-prevention — clearing browser
 * data, using a different browser, or private/incognito mode all bypass it
 * trivially. It exists purely to catch the common, well-intentioned case
 * (accidental double-submit, forgetting you already sent one) with zero
 * server-side changes. See 2026-07-06 chat decision: real IP-based or
 * account-based blocking was considered and deliberately deferred — this is
 * the intentionally light option. Duplicate/abuse cleanup for anything this
 * doesn't catch stays a manual job via /private/admin.
 */
const STORAGE_KEY = "butterfly-garden:submitted";

interface SubmissionRecord {
  submittedAt: string;
  nickname: string;
}

export function hasSubmittedBefore(): SubmissionRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SubmissionRecord;
  } catch {
    return null;
  }
}

export function markSubmitted(nickname: string): void {
  if (typeof window === "undefined") return;
  try {
    const record: SubmissionRecord = { submittedAt: new Date().toISOString(), nickname };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // localStorage unavailable (private mode edge cases, storage full, etc.)
    // — non-fatal, just means this device won't be flagged next time.
  }
}
