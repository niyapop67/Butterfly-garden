import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { SubmissionDoc, SubmissionDraft } from "@/types/submission";

/**
 * Submits a completed draft: uploads the voice recording to Storage (if
 * present), then writes the participant doc to Firestore.
 *
 * Collection: "submissions" — also read by the garden page (butterfly
 * count, nickname-only tap reveal) and, later, the chapter-6 Private
 * Experience pages (full message/voice, behind GATE 2).
 */
export async function submitEntry(draft: SubmissionDraft): Promise<string> {
  if (!draft.butterflyType) {
    throw new Error("butterflyType is required before submitting.");
  }

  let voiceUrl: string | null = null;

  if (draft.voiceBlob) {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webm`;
    const storageRef = ref(storage, `voices/${fileName}`);
    await uploadBytes(storageRef, draft.voiceBlob, { contentType: "audio/webm" });
    voiceUrl = await getDownloadURL(storageRef);
  }

  const docPayload: SubmissionDoc = {
    nickname: draft.nickname.trim(),
    message: draft.message.trim(),
    butterflyType: draft.butterflyType,
    voiceUrl,
    voiceDurationSeconds: draft.voiceDurationSeconds,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "submissions"), docPayload);
  return docRef.id;
}
