"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ButterflyType } from "@/types/submission";

/**
 * Garden page data model (spec v2.9 §2.3 + docs/spec-v2.9-diff-2026-06-26.md §3).
 *
 * GATE 1 territory only: nickname + butterflyType + a hasVoice flag are all
 * the garden page is allowed to show. Message text and the voice file URL
 * are GATE 2 (chapter-6 Private Experience) territory.
 *
 * docs/firebase-security-rules-draft.md already documents that the real
 * enforcement of this boundary lives in the UI layer, not Firestore Security
 * Rules (a deliberate, documented decision for this "身内向け運用" project).
 * This hook reinforces that boundary one layer earlier than strictly
 * required: the onSnapshot callback below destructures each document and
 * keeps ONLY the fields below in React state. `message` and `voiceUrl`
 * never enter component state or get rendered anywhere on this page, even
 * though the underlying Firestore read technically returns them.
 */
export interface GardenEntry {
  id: string;
  nickname: string;
  butterflyType: ButterflyType;
  hasVoice: boolean;
  createdAtMs: number | null;
}

interface UseGardenFeedResult {
  entries: GardenEntry[];
  loading: boolean;
  error: string | null;
}

export function useGardenFeed(): UseGardenFeedResult {
  const [entries, setEntries] = useState<GardenEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next: GardenEntry[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt;
          // Firestore Timestamp has toMillis(); pending server writes (from
          // this same client, just before the server timestamp resolves)
          // briefly have createdAt === null.
          const createdAtMs =
            createdAt && typeof createdAt.toMillis === "function" ? createdAt.toMillis() : null;

          return {
            id: doc.id,
            nickname: typeof data.nickname === "string" ? data.nickname : "",
            butterflyType: data.butterflyType as ButterflyType,
            hasVoice: Boolean(data.voiceUrl),
            createdAtMs,
          };
        });

        setEntries(next);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("ガーデンの読み込みに失敗しました。もう一度お試しください。");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { entries, loading, error };
}
