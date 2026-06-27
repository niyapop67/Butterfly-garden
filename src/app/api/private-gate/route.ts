import { NextResponse, type NextRequest } from "next/server";
import {
  PRIVATE_GATE_COOKIE_NAME,
  verifyPrivateExperiencePassphrase,
} from "@/lib/privateExperienceAuth";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

/**
 * GATE 2 verification endpoint. Mirrors src/app/api/gate/route.ts (GATE 1),
 * but checks PRIVATE_EXPERIENCE_PASSPHRASE and sets a separate cookie
 * (bg_private_gate) so the two gates stay fully independent — passing
 * GATE 1 never implies GATE 2 access, and vice versa.
 *
 * See docs/spec-v2.9-diff-2026-06-26.md §2.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.PRIVATE_EXPERIENCE_PASSPHRASE;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "PRIVATE_EXPERIENCE_PASSPHRASE is not configured on the server." },
      { status: 500 }
    );
  }

  let body: { passphrase?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  if (!body.passphrase || !verifyPrivateExperiencePassphrase(body.passphrase)) {
    return NextResponse.json({ ok: false, error: "合言葉が違います。" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PRIVATE_GATE_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });
  return response;
}
