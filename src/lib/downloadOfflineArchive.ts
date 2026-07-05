import JSZip from "jszip";
import { BUTTERFLY_THEMES } from "@/types/submission";
import type { PrivateEntry } from "@/lib/usePrivateFeed";

/**
 * Bundles every message + voice recording into a single self-contained ZIP
 * that works fully offline once downloaded and extracted — same idea as the
 * birthday movie (download once, watch anywhere, no internet needed).
 *
 * Unlike downloadVoiceFilesZip.ts (which is a CapCut editing aid — numbered
 * audio files + a CSV manifest), this produces an index.html that embeds
 * the nickname/message text directly and references the audio files with
 * plain relative paths (voices/NNN.ext), so double-clicking index.html in
 * any browser — with no server, no Firebase, no network — shows the full
 * "名前一覧リスト" experience (usePrivateFeed's live version needs Firestore
 * + Storage to be reachable; this is the same content frozen at export
 * time into static files).
 */
export async function downloadOfflineArchive(entries: PrivateEntry[]): Promise<{ voiceCount: number }> {
  const sorted = [...entries].sort((a, b) => (a.nickname || "").localeCompare(b.nickname || "", "ja"));

  const zip = new JSZip();
  let voiceCount = 0;

  const cards = await Promise.all(
    sorted.map(async (entry, i) => {
      const typeLabel = BUTTERFLY_THEMES[entry.butterflyType]?.labelJa ?? "";
      let audioTag = "";

      if (entry.voiceUrl) {
        try {
          const res = await fetch(entry.voiceUrl);
          if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
          const blob = await res.blob();
          const ext = extensionFromContentType(res.headers.get("content-type")) ?? "webm";
          const filename = `voice_${String(i + 1).padStart(3, "0")}.${ext}`;
          zip.file(`voices/${filename}`, blob);
          voiceCount++;
          audioTag = `<audio controls preload="none" src="voices/${filename}"></audio>`;
        } catch {
          audioTag = `<p class="voice-error">（ボイスの取得に失敗しました）</p>`;
        }
      }

      return `
        <div class="card">
          <div class="card-head">
            <span class="nickname">${escapeHtml(entry.nickname || "（名前未設定）")}</span>
            <span class="type">${escapeHtml(typeLabel)}</span>
          </div>
          <p class="message">${escapeHtml(entry.message || "")}</p>
          ${audioTag}
        </div>`;
    })
  );

  const html = buildHtml(cards.join("\n"), sorted.length, voiceCount);
  zip.file("index.html", html);

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, "butterfly-garden-mika-offline.zip");

  return { voiceCount };
}

function buildHtml(cardsHtml: string, total: number, voiceCount: number): string {
  const generatedAt = new Date().toLocaleString("ja-JP");
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Butterfly Garden for MIKA — みんなの想い</title>
<style>
  body {
    margin: 0;
    padding: 24px 16px 64px;
    background: linear-gradient(180deg, #fdf3f8 0%, #f3e9fb 100%);
    font-family: "Hiragino Maru Gothic ProN", "Zen Maru Gothic", sans-serif;
    color: #5a4f6e;
  }
  h1 {
    text-align: center;
    font-size: 22px;
    margin-bottom: 4px;
  }
  .meta {
    text-align: center;
    font-size: 12px;
    color: #8b8398;
    margin-bottom: 28px;
  }
  .card {
    max-width: 520px;
    margin: 0 auto 16px;
    background: rgba(255,255,255,0.75);
    border: 1px solid rgba(232,193,112,0.35);
    border-radius: 18px;
    padding: 16px 18px;
    box-shadow: 0 4px 18px rgba(90,79,110,0.08);
  }
  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
  }
  .nickname {
    font-weight: 700;
    font-size: 15px;
  }
  .type {
    font-size: 11px;
    color: #a89fb3;
  }
  .message {
    font-size: 13px;
    line-height: 1.7;
    white-space: pre-wrap;
    margin: 0 0 10px;
  }
  audio {
    width: 100%;
    height: 32px;
  }
  .voice-error {
    font-size: 11px;
    color: #c94f4f;
  }
</style>
</head>
<body>
  <h1>Butterfly Garden for MIKA</h1>
  <p class="meta">全${total}件（ボイス${voiceCount}件）／ ${escapeHtml(generatedAt)} 時点で書き出し・オフライン閲覧用</p>
  ${cardsHtml}
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
