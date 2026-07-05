/**
 * Firebase Admin SDK initialization — SERVER-ONLY.
 *
 * firestore.rules / storage.rules deliberately have `allow update, delete:
 * if false` for the "submissions" collection and "voices/" files (see
 * comments in both rule files) — client-side deletes are hard-blocked no
 * matter what UI-layer gate a page sits behind, since a client-side check
 * alone isn't real access control.
 *
 * The Admin SDK bypasses security rules entirely (it authenticates as a
 * service account, not an end user), which is exactly what the /private/admin
 * delete tool needs. Never import this file from a Client Component or
 * anything bundled for the browser — only from Route Handlers
 * (src/app/api/**) and Server Components.
 *
 * Requires 3 env vars (from a Firebase service account key JSON —
 * Firebase Console > Project Settings > Service Accounts > Generate new
 * private key):
 *   FIREBASE_ADMIN_PROJECT_ID
 *   FIREBASE_ADMIN_CLIENT_EMAIL
 *   FIREBASE_ADMIN_PRIVATE_KEY  (paste the whole "-----BEGIN PRIVATE
 *     KEY-----...-----END PRIVATE KEY-----" block; the \n escaping is
 *     handled below so it's fine to paste it as a single line in Vercel's
 *     env var UI or a local .env.local)
 */
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

function createAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      "Firebase Admin config is missing. Set FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY (see " +
        "src/lib/firebaseAdmin.ts for where to get these)."
    );
  }

  // Env var UIs often collapse real newlines to the literal two-character
  // sequence "\n" — undo that so the PEM block parses correctly.
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// Lazy singletons — NOT initialized at module load time. Next.js evaluates
// API route modules during `next build` (to collect route metadata), which
// would otherwise throw here whenever the 3 admin env vars aren't set yet
// (true for every environment until they're first configured in Vercel).
// Call adminDb()/adminStorage() *inside* a request handler instead of at
// module scope.
let _db: Firestore | null = null;
let _storage: Storage | null = null;

export function adminDb(): Firestore {
  if (!_db) {
    _db = getFirestore(createAdminApp());
  }
  return _db;
}

export function adminStorage(): Storage {
  if (!_storage) {
    _storage = getStorage(createAdminApp());
  }
  return _storage;
}
