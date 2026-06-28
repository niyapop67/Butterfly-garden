import JSZip from "jszip";
import { BUTTERFLY_THEMES } from "@/types/submission";
import type { PrivateEntry } from "@/lib/usePrivateFeed";

/**
 * Bundles every submitted voice recording into one ZIP, for importing into
 * CapCut when editing the birthday digest movie (see
 * docs/birthday-movie-five-acts-draft.md). Runs entirely client-side.
 *
 * Files are numbered in chronological (submission) order so the ZIP's file
 * listing already matches the edit order assumed by the five-act draft —
 * no need to cross-reference timestamps by hand while editing.
 *
 * A manifest.csv is included alongside the audio so every entry (including
 * ones with no voice) is listed with nickname/butterfly type/message —
 * useful for laying out captions even where there's no audio to import.
 */
export async function downloadVoiceFilesZip(entries: PrivateEntry[]): Promise<{ voiceCount: number }> {
  const chronological = [...entries].sort((a, b) => (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0));

  const zip = new JSZip();
  const manifestRows: string[] = ["順番,ファイル名,ニックネーム,蝶タイプ,ボイス有無,メッセージ"];
  let voiceCount = 0;

  await Promise.all(
    chronological.map(async (entry, i) => {
      const order = String(i + 1).padStart(2, "0");
      const safeName = sanitizeFilename(entry.nickname || "名前未設定");
      const typeLabel = BUTTERFLY_THEMES[entry.butterflyType]?.labelJa ?? "";
      const escapedMessage = csvEscape(entry.message ?? "");

      let filename = "";
      if (entry.voiceUrl) {
        try {
          const res = await fetch(entry.voiceUrl);
          if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
          const blob = await res.blob();
          const ext = extensionFromContentType(res.headers.get("content-type")) ?? "webm";
          filename = `${order}_${safeName}.${ext}`;
          zip.file(filename, blob);
          voiceCount++;
        } catch {
          // Skip this one file rather than aborting the whole zip; it'll
          // still show up in the manifest as ボイス有無=取得失敗 so it's
          // obvious something needs manual follow-up.
          manifestRows.push(`${i + 1},(取得失敗),${csvEscape(entry.nickname)},${typeLabel},取得失敗,${escapedMessage}`);
          return;
        }
      }

      manifestRows.push(
        `${i + 1},${filename || "(なし)"},${csvEscape(entry.nickname)},${typeLabel},${entry.voiceUrl ? "あり" : "なし"},${escapedMessage}`
      );
    })
  );

  // \uFEFF BOM so Excel on Windows opens the CSV as UTF-8 instead of
  // mangling the Japanese text.
  zip.file("manifest.csv", "\uFEFF" + manifestRows.join("\n"));

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, "butterfly-garden-mika-voices.zip");

  return { voiceCount };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 30) || "no-name";
}

function csvEscape(value: string): string {
  const v = (value ?? "").replace(/\r?\n/g, " ");
  if (v.includes(",") || v.includes('"')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function extensionFromContentType(contentType: string | null): string | null {
  if (!contentType) return null;
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("mp4") || contentType.includes("m4a")) return "m4a";
  if (contentType.includes("ogg")) return "ogg";
  if (contentType.includes("wav")) return "wav";
  if (contentType.includes("mpeg") || contentType.includes("mp3")) return "mp3";
  return null;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
