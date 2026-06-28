"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ButterflyType } from "@/types/submission";

/**
 * Full submission record, INCLUDING message text and the voice file URL.
 * This type must never be imported by any component outside `/private/**`
 * (GATE 2 territory) — see useGardenFeed.ts (GardenEntry) for the
 * GATE-1-safe slim version used everywhere else, which deliberately omits
 * these two fields.
 */
export interface PrivateEntry {
  id: string;
  nickname: string;
  butterflyType: ButterflyType;
  message: string;
  voiceUrl: string | null;
  voiceDurationSeconds: number | null;
  createdAtMs: number | null;
}

interface UsePrivateFeedResult {
  entries: PrivateEntry[];
  loading: boolean;
  error: string | null;
}

/**
 * Realtime subscription to the full `submissions` collection, for use only
 * on pages already behind GATE 2 (everything under src/app/private/**,
 * protected by src/middleware.ts). This is the one place in the codebase
 * that's supposed to read message/voiceUrl — see
 * docs/firebase-security-rules-draft.md for why that boundary lives in the
 * UI/route layer rather than Firestore Security Rules.
 */
export function usePrivateFeed(): UsePrivateFeedResult {
  const [entries, setEntries] = useState<PrivateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next: PrivateEntry[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt;
          const createdAtMs =
            createdAt && typeof createdAt.toMillis === "function" ? createdAt.toMillis() : null;

          return {
            id: doc.id,
            nickname: typeof data.nickname === "string" ? data.nickname : "",
            butterflyType: data.butterflyType as ButterflyType,
            message: typeof data.message === "string" ? data.message : "",
            voiceUrl: typeof data.voiceUrl === "string" ? data.voiceUrl : null,
            voiceDurationSeconds:
              typeof data.voiceDurationSeconds === "number" ? data.voiceDurationSeconds : null,
            createdAtMs,
          };
        });

        setEntries(next);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("読み込みに失敗しました。もう一度お試しください。");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { entries, loading, error };
}
