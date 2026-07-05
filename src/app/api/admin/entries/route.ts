import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebaseAdmin";

/**
 * Admin-only entry list + delete API, backing /private/admin.
 *
 * Auth model: the ADMIN_KEY env var, sent as a Bearer token, checked on
 * every request here (never trust the page-level check alone — see the
 * comment in /private/admin/page.tsx). This is separate from NIYA_PREVIEW_KEY
 * (that one's for the TOP-page preview toggle, a different, non-destructive
 * feature) so the two can be rotated independently.
 *
 * Uses the Admin SDK (src/lib/firebaseAdmin.ts), which bypasses
 * firestore.rules / storage.rules — those rules intentionally block
 * update/delete for every other caller (see the rules files).
 */

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.ADMIN_KEY;
  if (!expected) return false;
  const header = request.headers.get("authorization");
  const provided = header?.startsWith("Bearer ") ? header.slice(7) : null;
  return provided === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const snapshot = await adminDb().collection("submissions").orderBy("createdAt", "desc").get();
  const entries = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nickname: data.nickname ?? "",
      message: data.message ?? "",
      butterflyType: data.butterflyType ?? "",
      voiceUrl: data.voiceUrl ?? null,
      createdAtMs: data.createdAt?.toMillis?.() ?? null,
    };
  });

  return NextResponse.json({ entries });
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const docRef = adminDb().collection("submissions").doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const voiceUrl: string | null = doc.data()?.voiceUrl ?? null;

  // Delete the Firestore doc first — if Storage cleanup fails, we'd rather
  // have an orphaned file (harmless, invisible to users) than an orphaned
  // doc still showing up in the garden/list.
  await docRef.delete();

  if (voiceUrl) {
    try {
      const path = storagePathFromUrl(voiceUrl);
      if (path) {
        await adminStorage().bucket().file(path).delete();
      }
    } catch {
      // Swallow — the doc is already gone, which is what actually matters
      // to the person who asked to be removed. A leftover audio file in
      // Storage isn't linked from anywhere once its doc is deleted.
    }
  }

  return NextResponse.json({ ok: true });
}

/** Extracts the Storage object path (e.g. "voices/xyz.webm") from a Firebase
 *  download URL. Returns null if the URL doesn't match the expected shape. */
function storagePathFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/o\/(.+)$/);
    if (!match) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}
