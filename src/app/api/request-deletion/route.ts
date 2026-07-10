import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

/**
 * "Delete request" API — lets a submitter ask for their own entry to be
 * taken down, without giving clients real delete access (firestore.rules
 * still hard-blocks update/delete for everyone — see that file).
 *
 * Auth model: none beyond "you know the Firestore doc ID", which matches
 * this project's existing pattern for "your own submission" pages (see
 * /submit/mine and submissionFlag.ts) — the doc ID is stashed in this
 * browser's localStorage right after a successful submit, and is a random
 * Firestore-generated string nobody else would have. This is intentionally
 * light, same tradeoff as the rest of the "own submission" features here:
 * it only flags the doc for Niya to review, it does NOT delete anything
 * itself, so a guessed/leaked ID can at worst cause a spurious review ping,
 * never an actual deletion.
 *
 * On a valid request: sets deletionRequested + deletionRequestedAt on the
 * Firestore doc (so /private/admin can surface it), and pings a Discord
 * webhook so Niya notices right away. Both best-effort — a Discord failure
 * still returns success to the caller, since the flag itself is the part
 * that actually matters for follow-up.
 */
export async function POST(request: NextRequest) {
  const { id } = await request.json();
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const docRef = adminDb().collection("submissions").doc(id);
  const snap = await docRef.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const data = snap.data();

  // Idempotent — resubmitting the same request is harmless, just refreshes
  // the timestamp instead of erroring or double-notifying in a confusing way.
  await docRef.update({
    deletionRequested: true,
    deletionRequestedAt: new Date().toISOString(),
  });

  const webhookUrl = process.env.DISCORD_DELETE_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const adminKey = process.env.ADMIN_KEY;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://butterfly-garden-alpha.vercel.app";
      const adminLink = adminKey ? `${siteUrl}/private/admin?key=${adminKey}` : `${siteUrl}/private/admin`;

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content:
            `🦋 **削除依頼が届きました**\n` +
            `ニックネーム: ${data?.nickname ?? "（不明）"}\n` +
            `投稿ID: ${id}\n` +
            `${adminLink}`,
        }),
      });
    } catch {
      // Non-fatal — the flag on the doc is what actually matters; Niya will
      // still see it in /private/admin even if the Discord ping fails.
    }
  }

  return NextResponse.json({ ok: true });
}
