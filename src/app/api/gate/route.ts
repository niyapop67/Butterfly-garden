import { NextResponse, type NextRequest } from "next/server";

const GATE_COOKIE_NAME = "bg_site_gate";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

/**
 * GATE 1 verification endpoint. Checks the submitted passphrase against
 * SITE_PASSPHRASE and, if it matches, sets the gate cookie that
 * src/middleware.ts looks for.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.SITE_PASSPHRASE;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "SITE_PASSPHRASE is not configured on the server." },
      { status: 500 }
    );
  }

  let body: { passphrase?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  if (body.passphrase !== expected) {
    return NextResponse.json({ ok: false, error: "合言葉が違います。" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(GATE_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });
  return response;
}
