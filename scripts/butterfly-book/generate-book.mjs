// Butterfly Garden for MIKA — "Butterfly Garden Book" PDF generator
//
// Renders every participant's letter as a decorated page matching the
// LetterModal design (paper card, gold border, corner/rose/crystal
// flourishes, Klee One handwriting font) and combines everything into a
// single offline PDF with a cover, a table of contents, and PDF outline
// bookmarks for jump-navigation. Pure pdf-lib — no headless browser, no
// server — matches the "no Web / OS-standard viewer only" requirement.
//
// Usage:
//   node generate-book.mjs <entries.json> <output.pdf>
//
// entries.json shape: array of
//   { nickname, message, butterflyType, voiceUrl, createdAtMs }

import { PDFDocument, rgb, degrees, PDFName, PDFHexString, PDFNumber, PDFRef, PDFArray, PDFDict } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// This script lives at <repo>/scripts/butterfly-book/generate-book.mjs
const REPO_ROOT = path.resolve(__dirname, "../..");
const REPO_PUBLIC = path.join(REPO_ROOT, "public");
const REPO_FONTS = path.join(REPO_ROOT, "src/fonts");

const PAGE_W = 595.28; // A4 pt
const PAGE_H = 841.89;

// Card geometry (inset from page edges)
const CARD_MARGIN_X = 56;
const CARD_TOP = PAGE_H - 130; // leave room for rose overlap above
const CARD_BOTTOM = 110; // leave room for crystal overlap below
const CARD_LEFT = CARD_MARGIN_X;
const CARD_RIGHT = PAGE_W - CARD_MARGIN_X;
const CARD_W = CARD_RIGHT - CARD_LEFT;

const INK = rgb(0.231, 0.165, 0.102); // #3B2A1A message text
const GOLD = rgb(0.611, 0.447, 0.219); // #9c7238 border
const GOLD_SOFT = rgb(0.78, 0.66, 0.44);
const GREETING_COLOR = rgb(0.541, 0.416, 0.243); // #8A6A3E
const SENDER_LABEL = rgb(0.651, 0.533, 0.353); // #A6885A
const SENDER_NAME = rgb(0.478, 0.357, 0.204); // #7A5B34
const COVER_ACCENT = rgb(0.937, 0.694, 0.792); // pink
const PAPER_TOP = rgb(1, 0.992, 0.965);
const PAPER_MID = rgb(0.992, 0.953, 0.906);
const PAPER_BOTTOM = rgb(0.984, 0.933, 0.867);
const NIGHT_BG = rgb(0.031, 0.024, 0.059); // #08060f

const BUTTERFLY_THEME_LABELS = {
  "pink-heart": "ピンクハート",
  "tiffany-sky": "ティファニースカイ",
  "crystal-white": "クリスタルホワイト",
  "aurora-dream": "レインボーバタフライ",
  "emerald-garden": "エメラルドガーデン",
  "golden-sunshine": "ゴールデンサンシャイン",
};

async function main() {
  const [, , entriesPath, outPath] = process.argv;
  if (!entriesPath || !outPath) {
    console.error("Usage: node generate-book.mjs <entries.json> <output.pdf>");
    process.exit(1);
  }

  const entries = JSON.parse(fs.readFileSync(entriesPath, "utf-8"));
  const chronological = [...entries].sort((a, b) => (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0));

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  pdfDoc.setTitle("Butterfly Garden for MIKA — Book");
  pdfDoc.setProducer("Butterfly Garden for MIKA");
  pdfDoc.setAuthor("Butterfly Garden for MIKA");

  // ---- Fonts ----
  const kleeRegular = await pdfDoc.embedFont(fs.readFileSync(path.join(REPO_FONTS, "klee-one/KleeOne-Regular.ttf")));
  const kleeSemi = await pdfDoc.embedFont(fs.readFileSync(path.join(REPO_FONTS, "klee-one/KleeOne-SemiBold.ttf")));
  const notoSans = await pdfDoc.embedFont(fs.readFileSync(path.join(REPO_FONTS, "noto-sans-jp/NotoSansJP-Variable.ttf")));
  const cormorantItalic = await pdfDoc.embedFont(
    fs.readFileSync(path.join(REPO_FONTS, "cormorant-garamond/CormorantGaramond-Italic-Variable.ttf"))
  );
  const cormorant = await pdfDoc.embedFont(
    fs.readFileSync(path.join(REPO_FONTS, "cormorant-garamond/CormorantGaramond-Variable.ttf"))
  );

  // ---- Decoration images ----
  const cornerImg = await pdfDoc.embedPng(fs.readFileSync(path.join(REPO_PUBLIC, "images/decor/corner_tl_new.png")));
  const roseImg = await pdfDoc.embedPng(fs.readFileSync(path.join(REPO_PUBLIC, "images/decor/rose_top.png")));
  const crystalImg = await pdfDoc.embedPng(fs.readFileSync(path.join(REPO_PUBLIC, "images/decor/crystal_bottom.png")));

  // ==== Cover page ====
  drawCoverPage(pdfDoc, { cormorantItalic, notoSans, cormorant, count: chronological.length });

  // ==== Table of contents (page numbers filled in after render) ====
  const tocPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const tocEntryPositions = []; // {y, nickname}

  // ==== Letter pages ====
  const outlineTargets = []; // { title, pageIndex }
  for (let i = 0; i < chronological.length; i++) {
    const entry = chronological[i];
    const startPageIndex = pdfDoc.getPageCount();
    drawLetterEntry(pdfDoc, entry, i + 1, {
      kleeRegular,
      kleeSemi,
      notoSans,
      cormorantItalic,
      cornerImg,
      roseImg,
      crystalImg,
    });
    outlineTargets.push({ title: `${i + 1}. ${entry.nickname || "（名前未設定）"}`, pageIndex: startPageIndex });
  }

  // ---- Fill in TOC now that we know final page numbers ----
  renderToc(tocPage, chronological, outlineTargets, notoSans, cormorantItalic, kleeSemi);

  // ---- Add PDF outline (bookmarks) for jump navigation ----
  addOutline(pdfDoc, outlineTargets);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`Wrote ${outPath} (${pdfDoc.getPageCount()} pages, ${chronological.length} entries)`);
}

function drawCoverPage(pdfDoc, { cormorantItalic, notoSans, cormorant, count }) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: NIGHT_BG });

  const title = "Butterfly Garden";
  const titleSize = 40;
  const titleWidth = cormorant.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: (PAGE_W - titleWidth) / 2,
    y: PAGE_H / 2 + 60,
    size: titleSize,
    font: cormorant,
    color: COVER_ACCENT,
  });

  const sub = "for MIKA";
  const subSize = 24;
  const subWidth = cormorantItalic.widthOfTextAtSize(sub, subSize);
  page.drawText(sub, {
    x: (PAGE_W - subWidth) / 2,
    y: PAGE_H / 2 + 20,
    size: subSize,
    font: cormorantItalic,
    color: rgb(1, 1, 1),
  });

  const bookLabel = "— Butterfly Garden Book —";
  const bookSize = 13;
  const bookWidth = notoSans.widthOfTextAtSize(bookLabel, bookSize);
  page.drawText(bookLabel, {
    x: (PAGE_W - bookWidth) / 2,
    y: PAGE_H / 2 - 30,
    size: bookSize,
    font: notoSans,
    color: rgb(0.85, 0.85, 0.9),
  });

  const countLabel = `全${count}通のメッセージ`;
  const countSize = 11;
  const countWidth = notoSans.widthOfTextAtSize(countLabel, countSize);
  page.drawText(countLabel, {
    x: (PAGE_W - countWidth) / 2,
    y: PAGE_H / 2 - 52,
    size: countSize,
    font: notoSans,
    color: rgb(0.7, 0.7, 0.78),
  });
}

function renderToc(page, entries, outlineTargets, notoSans, cormorantItalic, kleeSemi) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: NIGHT_BG });
  const headTitle = "Contents";
  const headSize = 22;
  page.drawText(headTitle, {
    x: CARD_MARGIN_X,
    y: PAGE_H - 90,
    size: headSize,
    font: cormorantItalic,
    color: COVER_ACCENT,
  });

  let y = PAGE_H - 130;
  const lineH = 22;
  const perPageLimit = Math.floor((y - 60) / lineH);

  entries.forEach((entry, i) => {
    if (y < 70) return; // simple single-page TOC; overflow entries still get bookmarks
    const label = `${i + 1}.  ${entry.nickname || "（名前未設定）"}`;
    // +2 because cover=page1, toc=page2, first letter page = page3 (1-indexed for humans)
    const humanPage = outlineTargets[i].pageIndex + 1;
    page.drawText(label, { x: CARD_MARGIN_X, y, size: 11, font: notoSans, color: rgb(0.9, 0.9, 0.95) });
    const pageLabel = String(humanPage);
    const pageLabelW = notoSans.widthOfTextAtSize(pageLabel, 11);
    page.drawText(pageLabel, {
      x: PAGE_W - CARD_MARGIN_X - pageLabelW,
      y,
      size: 11,
      font: notoSans,
      color: rgb(0.7, 0.7, 0.8),
    });
    // dotted leader
    const dotsStart = CARD_MARGIN_X + notoSans.widthOfTextAtSize(label, 11) + 8;
    const dotsEnd = PAGE_W - CARD_MARGIN_X - pageLabelW - 8;
    if (dotsEnd > dotsStart) {
      page.drawText(".".repeat(Math.max(0, Math.floor((dotsEnd - dotsStart) / 3))), {
        x: dotsStart,
        y,
        size: 11,
        font: notoSans,
        color: rgb(0.4, 0.4, 0.48),
      });
    }
    y -= lineH;
  });
}

/** Draws one participant's letter, paginating across multiple pages if the
 * message is long. Every page gets the full decorative frame so the
 * "book" feels consistent no matter where you open it. */
function drawLetterEntry(pdfDoc, entry, index, assets) {
  const { kleeRegular, kleeSemi, notoSans, cormorantItalic, cornerImg, roseImg, crystalImg } = assets;
  const message = entry.message || "（メッセージなし）";
  const isShort = message.length <= 30 && !message.includes("\n");

  const bodySize = messageFontSize(message.length);
  const lineGap = 1.9;
  const lineHeight = bodySize * lineGap;
  const textWidth = CARD_W - 2 * 44; // inner padding ~44pt each side

  const paragraphs = message.split("\n");
  const allLines = [];
  for (const para of paragraphs) {
    if (para === "") {
      allLines.push({ text: "", isBlank: true });
      continue;
    }
    const wrapped = wrapText(para, kleeRegular, bodySize, textWidth);
    for (const line of wrapped) allLines.push({ text: line, isBlank: false });
  }

  let lineCursor = 0;
  let pageInSeries = 0;

  while (lineCursor < allLines.length || pageInSeries === 0) {
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    drawPageFrame(page, cornerImg, roseImg, crystalImg);

    let y = CARD_TOP - 56;

    if (pageInSeries === 0) {
      // Greeting
      const greeting = "Dear MIKA";
      const gSize = 22;
      const gWidth = cormorantItalic.widthOfTextAtSize(greeting, gSize);
      page.drawText(greeting, {
        x: (PAGE_W - gWidth) / 2,
        y,
        size: gSize,
        font: cormorantItalic,
        color: GREETING_COLOR,
      });
      y -= 30;

      // Divider
      const divider = "•  •  •";
      const dSize = 11;
      const dWidth = notoSans.widthOfTextAtSize(divider, dSize);
      page.drawText(divider, { x: (PAGE_W - dWidth) / 2, y, size: dSize, font: notoSans, color: GOLD_SOFT });
      y -= 28;
    } else {
      // Continuation header
      const contLabel = `— つづき —`;
      const cSize = 10;
      const cWidth = notoSans.widthOfTextAtSize(contLabel, cSize);
      page.drawText(contLabel, { x: (PAGE_W - cWidth) / 2, y, size: cSize, font: notoSans, color: GOLD_SOFT });
      y -= 26;
    }

    const bottomLimit = CARD_BOTTOM + 70; // leave room for sender/footer
    while (lineCursor < allLines.length && y - lineHeight > bottomLimit) {
      const line = allLines[lineCursor];
      if (line.isBlank) {
        y -= lineHeight * 0.5;
      } else {
        const font = kleeSemi;
        const lw = font.widthOfTextAtSize(line.text, bodySize);
        const x = isShort ? (PAGE_W - lw) / 2 : CARD_LEFT + 44;
        page.drawText(line.text, { x, y, size: bodySize, font, color: INK });
        y -= lineHeight;
      }
      lineCursor++;
    }

    const isLastPageOfEntry = lineCursor >= allLines.length;

    if (isLastPageOfEntry) {
      // Voice note
      let footerY = CARD_BOTTOM + 40;
      if (entry.voiceUrl) {
        const note = "🎤 ボイスメッセージあり（Voice Collection に収録）";
        const nSize = 9;
        const nWidth = notoSans.widthOfTextAtSize(note, nSize);
        page.drawText(note, {
          x: (PAGE_W - nWidth) / 2,
          y: footerY,
          size: nSize,
          font: notoSans,
          color: GOLD_SOFT,
        });
        footerY -= 20;
      }

      // Sender
      const fromLabel = "From";
      const name = entry.nickname || "（名前未設定）";
      const fromSize = 9;
      const nameSize = 13;
      const nameWidth = notoSans.widthOfTextAtSize(name, nameSize);
      const fromWidth = notoSans.widthOfTextAtSize(fromLabel, fromSize);
      const gap = 6;
      const totalW = fromWidth + gap + nameWidth;
      const startX = CARD_RIGHT - 44 - totalW;
      page.drawText(fromLabel, { x: startX, y: CARD_BOTTOM + 24, size: fromSize, font: notoSans, color: SENDER_LABEL });
      page.drawText(name, {
        x: startX + fromWidth + gap,
        y: CARD_BOTTOM + 22,
        size: nameSize,
        font: kleeSemi,
        color: SENDER_NAME,
      });
    } else {
      const moreLabel = "つづく →";
      const mSize = 9;
      const mWidth = notoSans.widthOfTextAtSize(moreLabel, mSize);
      page.drawText(moreLabel, {
        x: (PAGE_W - mWidth) / 2,
        y: CARD_BOTTOM + 24,
        size: mSize,
        font: notoSans,
        color: GOLD_SOFT,
      });
    }

    pageInSeries++;
    if (allLines.length === 0) break;
  }
}

function drawPageFrame(page, cornerImg, roseImg, crystalImg) {
  // Night background behind everything (matches site's near-black tone)
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: NIGHT_BG });

  // Paper card — approximate the diagonal gradient with three stacked bands
  const cardH = CARD_TOP - CARD_BOTTOM;
  const band = cardH / 3;
  page.drawRectangle({ x: CARD_LEFT, y: CARD_TOP - band, width: CARD_W, height: band, color: PAPER_TOP });
  page.drawRectangle({ x: CARD_LEFT, y: CARD_TOP - 2 * band, width: CARD_W, height: band, color: PAPER_MID });
  page.drawRectangle({ x: CARD_LEFT, y: CARD_BOTTOM, width: CARD_W, height: band, color: PAPER_BOTTOM });

  // Gold border
  page.drawRectangle({
    x: CARD_LEFT,
    y: CARD_BOTTOM,
    width: CARD_W,
    height: cardH,
    borderColor: GOLD,
    borderWidth: 1,
    color: undefined,
  });

  // Corner flourishes (4 corners, mirrored like the web version)
  const cornerScale = 0.19;
  const cornerDrawW = CARD_W * cornerScale;
  const cornerDrawH = cornerDrawW * (cornerImg.height / cornerImg.width);

  // top-left
  page.drawImage(cornerImg, { x: CARD_LEFT - 4, y: CARD_TOP - cornerDrawH + 4, width: cornerDrawW, height: cornerDrawH });
  // top-right (mirrored horizontally)
  page.drawImage(cornerImg, {
    x: CARD_RIGHT + 4,
    y: CARD_TOP - cornerDrawH + 4,
    width: -cornerDrawW,
    height: cornerDrawH,
  });
  // bottom-left (mirrored vertically)
  page.drawImage(cornerImg, {
    x: CARD_LEFT - 4,
    y: CARD_BOTTOM - 4,
    width: cornerDrawW,
    height: -cornerDrawH,
  });
  // bottom-right (mirrored both)
  page.drawImage(cornerImg, {
    x: CARD_RIGHT + 4,
    y: CARD_BOTTOM - 4,
    width: -cornerDrawW,
    height: -cornerDrawH,
  });

  // Rose — top center, overlapping above the card edge
  const roseDrawW = CARD_W * 0.42;
  const roseDrawH = roseDrawW * (roseImg.height / roseImg.width);
  page.drawImage(roseImg, {
    x: (PAGE_W - roseDrawW) / 2,
    y: CARD_TOP - roseDrawH * 0.42,
    width: roseDrawW,
    height: roseDrawH,
  });

  // Crystal — bottom center, overlapping below the card edge
  const crystalDrawW = CARD_W * 0.26;
  const crystalDrawH = crystalDrawW * (crystalImg.height / crystalImg.width);
  page.drawImage(crystalImg, {
    x: (PAGE_W - crystalDrawW) / 2,
    y: CARD_BOTTOM - crystalDrawH * 0.62,
    width: crystalDrawW,
    height: crystalDrawH,
  });
}

function messageFontSize(length) {
  if (length <= 40) return 20;
  if (length <= 80) return 17;
  if (length <= 150) return 15;
  if (length <= 260) return 13;
  if (length <= 380) return 13;
  return 12;
}

function wrapText(text, font, size, maxWidth) {
  if (text.length === 0) return [""];
  const lines = [];
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

/** Low-level PDF outline (bookmarks) so viewers show a jump-to-entry
 * sidebar — Preview, Acrobat, most phone PDF apps all read this. pdf-lib
 * has no high-level API for this, so we build the /Outlines dictionary
 * tree directly via pdfDoc.context. */
function addOutline(pdfDoc, targets) {
  const context = pdfDoc.context;
  const pages = pdfDoc.getPages();

  const outlineItemRefs = targets.map(() => context.nextRef());
  const outlinesRootRef = context.nextRef();

  targets.forEach((target, i) => {
    const page = pages[target.pageIndex];
    const destArray = context.obj([page.ref, PDFName.of("Fit")]);

    const dict = {
      Title: PDFHexString.fromText(target.title),
      Parent: outlinesRootRef,
      Dest: destArray,
    };
    if (i > 0) dict.Prev = outlineItemRefs[i - 1];
    if (i < targets.length - 1) dict.Next = outlineItemRefs[i + 1];

    context.assign(outlineItemRefs[i], context.obj(dict));
  });

  context.assign(
    outlinesRootRef,
    context.obj({
      Type: PDFName.of("Outlines"),
      First: outlineItemRefs[0],
      Last: outlineItemRefs[outlineItemRefs.length - 1],
      Count: PDFNumber.of(targets.length),
    })
  );

  const catalog = pdfDoc.catalog;
  catalog.set(PDFName.of("Outlines"), outlinesRootRef);
  catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
