/**
 * GATE 2 — "MIKA Private Experience" passphrase helper.
 * See docs/spec-v2.9-diff-2026-06-26.md §2.
 *
 * The entry page (/private/enter) and its verification API
 * (/api/private-gate) are wired up — see src/middleware.ts for how
 * /private/** paths get checked against the bg_private_gate cookie. What's
 * still missing is the actual chapter-6 content (auto-play / garden
 * explore / name list, spec v2.9 §6) — those pages are out of scope for
 * this build, but once they exist under /private/**, this gate already
 * protects them.
 *
 * Deliberately NOT merged into GATE 1 — the two gates are independent. A
 * visitor can pass GATE 1 and still be blocked by GATE 2, and vice versa
 * (/private/enter itself is reachable without a GATE 1 cookie).
 */
import type { NextRequest } from "next/server";

export const PRIVATE_GATE_COOKIE_NAME = "bg_private_gate";

/** True if the given passphrase matches PRIVATE_EXPERIENCE_PASSPHRASE. */
export function verifyPrivateExperiencePassphrase(candidate: string): boolean {
  const expected = process.env.PRIVATE_EXPERIENCE_PASSPHRASE;
  if (!expected) return false;
  return candidate === expected;
}

/** True if the incoming request already carries a valid GATE 2 cookie.
 * Mirrors GATE 1's behaviour in src/middleware.ts: if
 * PRIVATE_EXPERIENCE_PASSPHRASE isn't configured (e.g. local dev without
 * .env.local), this returns true so nobody gets locked out of their own
 * machine — same reasoning as GATE 1, see that file's comment. */
export function hasPrivateExperienceAccess(request: NextRequest): boolean {
  const expected = process.env.PRIVATE_EXPERIENCE_PASSPHRASE;
  if (!expected) return true;
  const cookie = request.cookies.get(PRIVATE_GATE_COOKIE_NAME)?.value;
  return cookie === expected;
}
