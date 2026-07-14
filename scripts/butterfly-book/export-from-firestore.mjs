// Exports all "submissions" documents from Firestore into the flat JSON
// shape that generate-book.mjs expects. Run this once (near/after the
// event) with a Firebase service-account key, then feed the output into
// generate-book.mjs.
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node export-from-firestore.mjs entries.json
//
// Notes:
// - Skips documents flagged deletionRequested (respects takedown requests).
//   Pass --include-deletion-requested to override.
// - createdAt (Firestore Timestamp) is converted to createdAtMs so the
//   book generator can sort chronologically without needing firebase-admin.

import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const [, , outPath, ...flags] = process.argv;
const includeDeletionRequested = flags.includes("--include-deletion-requested");

if (!outPath) {
  console.error("Usage: node export-from-firestore.mjs <output.json> [--include-deletion-requested]");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: applicationDefault() });
}

const db = getFirestore();

async function main() {
  const snap = await db.collection("submissions").get();
  const entries = [];

  snap.forEach((doc) => {
    const data = doc.data();
    if (data.deletionRequested && !includeDeletionRequested) return;

    entries.push({
      id: doc.id,
      nickname: data.nickname ?? "",
      message: data.message ?? "",
      butterflyType: data.butterflyType ?? "pink-heart",
      voiceUrl: data.voiceUrl ?? null,
      voiceDurationSeconds: data.voiceDurationSeconds ?? null,
      createdAtMs: data.createdAt?.toMillis ? data.createdAt.toMillis() : null,
    });
  });

  fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), "utf-8");
  console.log(`Exported ${entries.length} entries to ${outPath}`);
  const skipped = snap.size - entries.length;
  if (skipped > 0) console.log(`(skipped ${skipped} deletion-requested submissions — use --include-deletion-requested to include)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
