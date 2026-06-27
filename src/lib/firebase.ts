/**
 * Firebase client SDK initialization.
 *
 * All config values come from NEXT_PUBLIC_* env vars (set in Vercel project
 * settings and a local .env.local — see .env.local.example). This file is
 * safe to import from both client components and the browser bundle; none
 * of these values are secret (standard for Firebase web apps — access
 * control happens in Firestore/Storage Security Rules, not by hiding this
 * config).
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function createFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    // Fail loudly in development so a missing .env.local is obvious instead
    // of surfacing as a confusing Firestore network error later.
    throw new Error(
      "Firebase config is missing. Did you create .env.local from .env.local.example?"
    );
  }

  return initializeApp(firebaseConfig);
}

const app = createFirebaseApp();

export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export default app;
