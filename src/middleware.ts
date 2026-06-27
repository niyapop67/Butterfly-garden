import { NextResponse, type NextRequest } from "next/server";
import { hasPrivateExperienceAccess } from "@/lib/privateExperienceAuth";

/**
 * GATE 1 — site-wide passphrase gate, PLUS a light GATE 2 redirect for
 * /private/** paths (other than the GATE 2 entry page itself).
 * See docs/spec-v2.9-diff-2026-06-26.md §2.
 *
 * Next.js only runs one middleware per app, so both gates live here:
 *
 *   - GATE 1 (bg_site_gate cookie / SITE_PASSPHRASE) protects everything.
 *     /private/enter is exempted from GATE 1 itself so a visitor who
 *     somehow already has a GATE 1 cookie but not a GATE 2 cookie can
 *     still reach the GATE 2 prompt — but note GATE 1 still runs first
 *     for every other /private/** path, so you need BOTH cookies to
 *     reach the real chapter-6 pages once they exist.
 *   - GATE 2 (bg_private_gate cookie / PRIVATE_EXPERIENCE_PASSPHRASE)
 *     additionally protects /private/** (excluding /private/enter and
 *     the verification API), redirecting to /private/enter if missing.
 *
 * GATE 2 has no real destination page yet (chapter-6 auto-play / garden
 * explore / name list are out of scope for this build) — this wiring is
 * prep so that whichever /private/* routes get added later are already
 * covered by the matcher below.
 */

const SITE_GATE_COOKIE_NAME = "bg_site_gate";
const SITE_GATE_PATH = "/enter";

const PRIVATE_GATE_PATH = "/private/enter";
const PRIVATE_PATH_PREFIX = "/private";

// Paths that must stay reachable even without the GATE 1 cookie, so the
// gate page itself and its form submission can work, plus Next.js
// internals/assets. /private/enter is included so GATE 2 can be reached
// independently of GATE 1's own redirect loop.
const SITE_GATE_PUBLIC_PATHS = [
  SITE_GATE_PATH,
  "/api/gate",
  PRIVATE_GATE_PATH,
  "/api/private-gate",
  "/_next",
  "/favicon.ico",
  "/images",
  "/fonts",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- GATE 1: site-wide passphrase ---
  if (!SITE_GATE_PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const siteExpected = process.env.SITE_PASSPHRASE;
    const siteCookie = request.cookies.get(SITE_GATE_COOKIE_NAME)?.value;

    if (siteExpected && siteCookie !== siteExpected) {
      const url = request.nextUrl.clone();
      url.pathname = SITE_GATE_PATH;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // --- GATE 2: private experience passphrase (chapter 6, /private/**) ---
  // Independent of GATE 1. Exempt the GATE 2 prompt itself and its API.
  const isPrivatePath = pathname.startsWith(PRIVATE_PATH_PREFIX);
  const isPrivateGateOwnPath =
    pathname.startsWith(PRIVATE_GATE_PATH) || pathname.startsWith("/api/private-gate");

  if (isPrivatePath && !isPrivateGateOwnPath) {
    if (!hasPrivateExperienceAccess(request)) {
      const url = request.nextUrl.clone();
      url.pathname = PRIVATE_GATE_PATH;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match everything except Next.js internals and static files, which
     * are already excluded above too (belt and suspenders).
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
