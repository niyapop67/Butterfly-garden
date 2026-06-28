import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { BUTTERFLY_THEMES } from "@/types/submission";
import type { PrivateEntry } from "@/lib/usePrivateFeed";

/**
 * Generates the "みんなからのメッセージ" keepsake PDF — one of the two
 * final deliverables for MIKA (the other being the birthday digest movie,
 * see docs/spec-v2.9-diff-2026-06-28.md). Runs entirely client-side via
 * pdf-lib + fontkit; no server/Admin SDK needed.
 *
 * Japanese text requires embedding an actual font (pdf-lib's built-in
 * StandardFonts only cover Latin glyphs) — this fetches a public copy of
 * Zen Maru Gothic (public/fonts/ZenMaruGothic-Regular.ttf) at call time
 * rather than next/font/local's internal copy, since that one's served
 * from a build-hashed path this code can't predict. See chat decision
 * 2026-06-28.
 *
 * Voice recordings aren't embeddable in a plain-text PDF — entries that
 * have one get a short note pointing to ガーデン探索 instead.
 */

const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const INK = rgb(0.353, 0.31, 0.431); // matches --color-ink (#5a4f6e)
const INK_SOFT = rgb(0.553, 0.51, 0.61); // matches --color-ink-soft-ish
const ACCENT = rgb(1, 0.62, 0.78); // pink accent

export async function generateMessagesPdf(entries: PrivateEntry[]): Promise<void> {
  const fontBytes = await fetch("/fonts/ZenMaruGothic-Regular.ttf").then((r) => {
    if (!r.ok) throw new Error("フォントの取得に失敗しました");
    return r.arrayBuffer();
  });

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);

  pdfDoc.setTitle("Butterfly Garden for MIKA — みんなからのメッセージ");
  pdfDoc.setProducer("Butterfly Garden for MIKA");

  // chronological, oldest first — same narrative ordering as おまかせ再生
  const chronological = [...entries].sort((a, b) => (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0));

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPage() {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) newPage();
  }

  function drawWrapped(text: string, size: number, color = INK, lineGap = 1.45) {
    const lineHeight = size * lineGap;
    for (const paragraph of text.split("\n")) {
      const lines = wrapText(paragraph, font, size, CONTENT_WIDTH);
      for (const line of lines) {
        ensureSpace(lineHeight);
        page.drawText(line, { x: MARGIN, y, size, font, color });
        y -= lineHeight;
      }
      if (paragraph === "") {
        ensureSpace(lineHeight);
        y -= lineHeight * 0.4;
      }
    }
  }

  // --- title page ---
  page.drawText("Butterfly Garden for MIKA", { x: MARGIN, y, size: 22, font, color: ACCENT });
  y -= 34;
  page.drawText("みんなからのメッセージ", { x: MARGIN, y, size: 16, font, color: INK });
  y -= 28;
  const dateStr = new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(new Date());
  page.drawText(`${dateStr}　全${chronological.length}件`, { x: MARGIN, y, size: 10, font, color: INK_SOFT });
  y -= 40;

  // --- entries ---
  chronological.forEach((entry, i) => {
    ensureSpace(70);

    const typeLabel = BUTTERFLY_THEMES[entry.butterflyType]?.labelJa ?? "";
    page.drawText(`${i + 1}.  ${entry.nickname || "（名前未設定）"}`, {
      x: MARGIN,
      y,
      size: 13,
      font,
      color: INK,
    });
    page.drawText(typeLabel, {
      x: MARGIN,
      y: y - 16,
      size: 9,
      font,
      color: INK_SOFT,
    });
    y -= 30;

    drawWrapped(entry.message || "（メッセージなし）", 11, INK);

    if (entry.voiceUrl) {
      y -= 4;
      drawWrapped("※ボイスメッセージあり（「ガーデン探索」でお聴きください）", 9, INK_SOFT);
    }

    y -= 22; // gap between entries
  });

  const pdfBytes = await pdfDoc.save();
  downloadBlob(pdfBytes, "butterfly-garden-mika-messages.pdf");
}

/** Greedy line-wrap. Breaks at any character boundary (not just spaces) —
 * correct behavior for Japanese, and an acceptable simplification for any
 * mixed-in English/Latin text. */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  if (text.length === 0) return [""];

  const lines: string[] = [];
  let current = "";

  for (const char of text) {
    const candidate = current + char;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current.length > 0) {
      lines.push(current);
      current = char;
    } else {
      current = candidate;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

function downloadBlob(bytes: Uint8Array, filename: string) {
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
