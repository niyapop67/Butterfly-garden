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
import emojiRegexFactory from "emoji-regex";
import subsetFont from "subset-font";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// This script lives at <repo>/scripts/butterfly-book/generate-book.mjs
const REPO_ROOT = path.resolve(__dirname, "../..");
const REPO_FONTS = path.join(REPO_ROOT, "src/fonts");
// Downloaded Twemoji PNGs are cached here so repeat runs (and repeated
// emoji across entries) don't re-fetch. Safe to delete; it will just
// re-download on next run. Not committed to git (see .gitignore note in
// README) since it's a rebuildable cache, not source content.
const EMOJI_CACHE_DIR = path.join(__dirname, ".emoji-cache");
const EMOJI_RE = emojiRegexFactory();

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

/** Sets both the classic PDF /Info dictionary (Title/Author/Subject/
 * Keywords — what Finder/Explorer "Get Info" panels read) and a proper
 * XMP metadata stream (what archival tools and modern DAM software read).
 * Invisible while reading, but this is what makes the file behave like a
 * real archival deliverable instead of an anonymous PDF. */
function setMetadata(pdfDoc) {
  const title = "Butterfly Garden Book";
  const author = "Butterfly Garden Project";
  const subject = "Happy Birthday to MIKA";
  const keywords = ["Butterfly Garden", "Moon Garden", "Collector's Edition"];
  const now = new Date();

  // ---- Classic Info dictionary ----
  pdfDoc.setTitle(title);
  pdfDoc.setAuthor(author);
  pdfDoc.setSubject(subject);
  pdfDoc.setKeywords(keywords);
  pdfDoc.setCreator("Butterfly Garden Book generator (pdf-lib)");
  pdfDoc.setProducer("Butterfly Garden for MIKA");
  pdfDoc.setCreationDate(now);
  pdfDoc.setModificationDate(now);

  // ---- XMP metadata stream (dc:, pdf:, xmp: namespaces) ----
  const isoDate = now.toISOString();
  const xmp = `<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <dc:title>
        <rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(title)}</rdf:li></rdf:Alt>
      </dc:title>
      <dc:creator>
        <rdf:Seq><rdf:li>${escapeXml(author)}</rdf:li></rdf:Seq>
      </dc:creator>
      <dc:description>
        <rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(subject)}</rdf:li></rdf:Alt>
      </dc:description>
      <dc:subject>
        <rdf:Bag>${keywords.map((k) => `<rdf:li>${escapeXml(k)}</rdf:li>`).join("")}</rdf:Bag>
      </dc:subject>
      <pdf:Keywords>${escapeXml(keywords.join(", "))}</pdf:Keywords>
      <pdf:Producer>Butterfly Garden for MIKA</pdf:Producer>
      <xmp:CreatorTool>Butterfly Garden Book generator (pdf-lib)</xmp:CreatorTool>
      <xmp:CreateDate>${isoDate}</xmp:CreateDate>
      <xmp:ModifyDate>${isoDate}</xmp:ModifyDate>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  // context.stream() does a naive charCodeAt-per-byte conversion for plain
  // JS strings, which corrupts the multi-byte xpacket BOM. Encode to real
  // UTF-8 bytes first (a Buffer is a Uint8Array subclass, so pdf-lib uses
  // it as-is instead of re-encoding it).
  const xmpBytes = Buffer.from(xmp, "utf-8");
  const context = pdfDoc.context;
  const metadataRef = context.register(
    context.stream(xmpBytes, {
      Type: PDFName.of("Metadata"),
      Subtype: PDFName.of("XML"),
      Length: xmpBytes.length,
    })
  );
  pdfDoc.catalog.set(PDFName.of("Metadata"), metadataRef);
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Klee One / Noto Sans JP have no emoji glyphs, and MIKA's fan symbols
 * (🦋 / 💕) mean nearly every nickname will contain one. Stripping them
 * would remove content people specifically chose to include, so instead
 * each emoji is rendered as a small embedded Twemoji PNG positioned
 * inline with the surrounding text — not dropped, not a font glyph.
 *
 * A non-emoji character with no glyph in the rendering font (true
 * .notdef case — extremely rare, e.g. an obscure symbol) is still
 * silently dropped as a last-resort safety net so generation never
 * breaks or shows a visible tofu box; this filter is intentionally
 * narrow now that emoji are handled separately. */
function makeGlyphFilter(fontBuffer) {
  const rawFont = fontkit.create(fontBuffer);
  return function filterUnsupported(text) {
    if (!text) return text;
    let out = "";
    for (const char of text) {
      const cp = char.codePointAt(0);
      let glyph;
      try {
        glyph = rawFont.glyphForCodePoint(cp);
      } catch {
        continue;
      }
      if (!glyph || glyph.id === 0) continue; // true .notdef — drop silently
      out += char;
    }
    return out;
  };
}

/** Splits text into alternating {type:'text'} / {type:'emoji'} tokens.
 * emoji-regex correctly handles multi-codepoint sequences (ZWJ joins,
 * skin-tone modifiers, variation selectors) as one grapheme, so 👨‍👩‍👧
 * or ❤️ stay intact as a single emoji token instead of splitting. */
function tokenizeEmoji(text) {
  const tokens = [];
  let lastIndex = 0;
  for (const match of text.matchAll(EMOJI_RE)) {
    if (match.index > lastIndex) tokens.push({ type: "text", value: text.slice(lastIndex, match.index) });
    tokens.push({ type: "emoji", value: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) tokens.push({ type: "text", value: text.slice(lastIndex) });
  return tokens;
}

function emojiCodepointsHex(str, stripVariationSelectors) {
  let codes = [...str].map((c) => c.codePointAt(0));
  if (stripVariationSelectors) codes = codes.filter((cp) => cp !== 0xfe0f && cp !== 0xfe0e);
  return codes.map((cp) => cp.toString(16)).join("-");
}

/** Downloads (or reads from local cache) the Twemoji 72x72 PNG for one
 * emoji grapheme. Tries the exact codepoint sequence first, then retries
 * with variation selectors stripped (Twemoji's own filenames often omit
 * FE0F — e.g. ❤️ ships as 2764.png, not 2764-fe0f.png). Returns null if
 * no variant is found in either source (caller should skip that one
 * emoji rather than fail the whole run).
 *
 * Source priority: jdecked/twemoji first — twitter/twemoji was archived
 * in 2023 and is frozen at an older Unicode emoji set, missing anything
 * added since (including 🩷 pink heart, Unicode 15.0 — one of MIKA's two
 * core fan symbols, so this isn't optional). jdecked/twemoji is the
 * actively-maintained community continuation. The original repo is kept
 * as a fallback mirror in case jdecked ever becomes unavailable. */
const TWEMOJI_SOURCES = [
  "https://raw.githubusercontent.com/jdecked/twemoji/main/assets/72x72",
  "https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72",
];

async function fetchTwemojiPng(emojiStr) {
  const primaryKey = emojiCodepointsHex(emojiStr, false);
  const cachePath = path.join(EMOJI_CACHE_DIR, `${primaryKey}.png`);
  if (fs.existsSync(cachePath)) return fs.readFileSync(cachePath);

  const candidates = [...new Set([primaryKey, emojiCodepointsHex(emojiStr, true)])];
  for (const base of TWEMOJI_SOURCES) {
    for (const hex of candidates) {
      const url = `${base}/${hex}.png`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.mkdirSync(EMOJI_CACHE_DIR, { recursive: true });
          fs.writeFileSync(cachePath, buf);
          return buf;
        }
      } catch {
        // network hiccup — try next candidate/source, treat like not-found
      }
    }
  }
  return null;
}

/** Scans every nickname/message for unique emoji, fetches+embeds each
 * exactly once (regardless of how many entries reuse it — 🦋 and 💕 will
 * appear dozens of times), and returns a Map from the emoji string to its
 * embedded pdf-lib image, ready for synchronous lookup during page
 * drawing. Entries whose emoji can't be fetched (offline, or truly not
 * in Twemoji) are logged and simply omitted from the map; the drawing
 * code skips any emoji with no map entry rather than failing. */
async function buildEmojiImageMap(pdfDoc, entries) {
  const unique = new Set();
  for (const entry of entries) {
    for (const t of tokenizeEmoji(entry.nickname || "")) if (t.type === "emoji") unique.add(t.value);
    for (const t of tokenizeEmoji(entry.message || "")) if (t.type === "emoji") unique.add(t.value);
  }

  const map = new Map();
  for (const emoji of unique) {
    const bytes = await fetchTwemojiPng(emoji);
    if (!bytes) {
      console.warn(`  (emoji not found in Twemoji, will be omitted: ${JSON.stringify(emoji)})`);
      continue;
    }
    try {
      map.set(emoji, await pdfDoc.embedPng(bytes));
    } catch (e) {
      console.warn(`  (failed to embed emoji image ${JSON.stringify(emoji)}: ${e.message})`);
    }
  }
  return map;
}

/** Measures the rendered width of a run list (mix of {type:'text'} and
 * {type:'emoji'} entries) at a given font size. Emoji are drawn as
 * square images sized to `emojiSize`. */
function measureRunsWidth(runs, font, size, emojiSize) {
  let w = 0;
  for (const run of runs) {
    w += run.type === "emoji" ? emojiSize : font.widthOfTextAtSize(run.value, size);
  }
  return w;
}

/** Draws a run list left-to-right starting at (x, y), where y is the text
 * baseline. Emoji images are nudged down slightly so their visual center
 * sits closer to the surrounding text's optical center (square images
 * anchored at their bottom-left by pdf-lib would otherwise sit too high
 * relative to a baseline-anchored font). Returns the ending x. */
function drawMixedRuns(page, runs, x, y, { font, size, color, emojiMap, emojiSize }) {
  let cursor = x;
  for (const run of runs) {
    if (run.type === "emoji") {
      const img = emojiMap.get(run.value);
      if (img) {
        page.drawImage(img, { x: cursor, y: y - emojiSize * 0.12, width: emojiSize, height: emojiSize });
      }
      cursor += emojiSize; // reserve the slot even if the image was missing
    } else {
      page.drawText(run.value, { x: cursor, y, size, font, color });
      cursor += font.widthOfTextAtSize(run.value, size);
    }
  }
  return cursor;
}

/** Tokenizes text into emoji + text runs, filters each text run through
 * the font's real glyph coverage (safety net for the rare truly-unusable
 * character), then greedily wraps the combined run stream into lines no
 * wider than maxWidth — treating each emoji as one atomic unit (never
 * split across a line break) and each character as a candidate break
 * point (matches how Japanese wraps without spaces). Returns an array of
 * lines, each an array of merged runs ready for measureRunsWidth /
 * drawMixedRuns. */
function wrapMixedText(text, font, size, emojiSize, maxWidth, glyphFilter) {
  const atoms = [];
  for (const token of tokenizeEmoji(text)) {
    if (token.type === "emoji") {
      atoms.push({ type: "emoji", value: token.value });
    } else {
      for (const ch of glyphFilter(token.value)) atoms.push({ type: "char", value: ch });
    }
  }
  if (atoms.length === 0) return [[]];

  const lines = [];
  let runs = [];
  let textBuf = "";
  let width = 0;

  const flushText = () => {
    if (textBuf) {
      runs.push({ type: "text", value: textBuf });
      textBuf = "";
    }
  };
  const flushLine = () => {
    flushText();
    lines.push(runs);
    runs = [];
    width = 0;
  };

  for (const atom of atoms) {
    const w = atom.type === "emoji" ? emojiSize : font.widthOfTextAtSize(atom.value, size);
    if (width + w > maxWidth && width > 0) flushLine();
    if (atom.type === "emoji") {
      flushText();
      runs.push({ type: "emoji", value: atom.value });
    } else {
      textBuf += atom.value;
    }
    width += w;
  }
  flushLine();
  return lines;
}

/** Builds the exact set of characters that need a Klee One glyph: every
 * character in every nickname/message (across all entries, not just the
 * ones that end up on a given page — simplest to keep correct), plus the
 * static strings actually drawn with Klee One outside of user content
 * (must stay in sync with drawLetterEntry / drawProloguePage / renderToc
 * if those literal strings change, or a subsetted font will be missing a
 * glyph it needs). Computed lazily (not as a module-level constant)
 * because PROLOGUE_LINES is declared further down in this file. */
function collectKleeCharSet(entries) {
  const staticStrings = ["（名前未設定）", ...PROLOGUE_LINES];
  const chars = new Set();
  for (const s of staticStrings) for (const ch of s) chars.add(ch);
  for (const entry of entries) {
    for (const ch of entry.nickname || "") chars.add(ch);
    for (const ch of entry.message || "") chars.add(ch);
  }
  return [...chars].join("");
}

/** Subsets a font to only the given characters using hb-subset (via the
 * subset-font package — WASM, no Python dependency). Falls back to the
 * original, full font bytes if subsetting fails for any reason (missing
 * chars, an unexpected font structure, etc.) — a larger file is a much
 * better failure mode than a broken build. */
async function safeSubsetFont(fontBytes, chars, label) {
  try {
    const subset = await subsetFont(fontBytes, chars, { targetFormat: "sfnt" });
    console.log(`  ${label}: ${fontBytes.length} -> ${subset.length} bytes (subset)`);
    return subset;
  } catch (e) {
    console.warn(`  ${label}: subsetting failed (${e.message}), embedding full font instead`);
    return fontBytes;
  }
}

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
  setMetadata(pdfDoc);

  // ---- Fonts ----
  // Font subsetting history (read before changing this section):
  // pdf-lib's built-in `{ subset: true }` looked like an easy file-size
  // win but corrupts glyph outlines — confirmed with MuPDF (a strict,
  // FreeType-based renderer much closer to real phone PDF viewers than
  // Poppler, which stayed silent about the corruption and is why this
  // wasn't caught earlier). This affected Noto Sans JP, both Cormorant
  // Garamond weights (variable fonts), AND Klee One (a static font) — so
  // it's not just a variable-font problem, pdf-lib's subsetter just isn't
  // reliable here.
  //
  // subset-font (hb-subset compiled to WASM — the same subsetter behind
  // Google Fonts, pure JS/no Python needed) IS safe for Klee One (verified
  // via MuPDF: zero errors). It crashes fontkit on the variable fonts
  // though, so those stay fully embedded — their combined size is modest
  // next to Klee One's ~17MB (both weights, full CJK coverage), so this
  // still keeps most of the win without the risk. If you touch this
  // again: change it, then run `mutool draw -r 150 -o /dev/null out.pdf`
  // and grep for "invalid"/"cannot render" — Poppler alone will not
  // catch a regression here.
  const kleeUsedChars = collectKleeCharSet(chronological);
  const kleeRegularBytes = fs.readFileSync(path.join(REPO_FONTS, "klee-one/KleeOne-Regular.ttf"));
  const kleeSemiBytes = fs.readFileSync(path.join(REPO_FONTS, "klee-one/KleeOne-SemiBold.ttf"));
  const kleeRegular = await pdfDoc.embedFont(await safeSubsetFont(kleeRegularBytes, kleeUsedChars, "KleeOne-Regular"));
  const kleeSemi = await pdfDoc.embedFont(await safeSubsetFont(kleeSemiBytes, kleeUsedChars, "KleeOne-SemiBold"));
  const notoSans = await pdfDoc.embedFont(fs.readFileSync(path.join(REPO_FONTS, "noto-sans-jp/NotoSansJP-Variable.ttf")));
  const cormorantItalic = await pdfDoc.embedFont(
    fs.readFileSync(path.join(REPO_FONTS, "cormorant-garamond/CormorantGaramond-Italic-Variable.ttf"))
  );
  const cormorant = await pdfDoc.embedFont(
    fs.readFileSync(path.join(REPO_FONTS, "cormorant-garamond/CormorantGaramond-Variable.ttf"))
  );

  // ---- Emoji handling: MIKA's fan symbols (🦋 / 💕) mean most nicknames
  // will contain emoji, and people write them into messages too. Klee One
  // has no emoji glyphs, so fetch+embed each unique emoji once as a small
  // Twemoji image; drawLetterEntry/renderToc render them inline with the
  // surrounding text instead of dropping them. Requires network access
  // (raw.githubusercontent.com) — falls back to omitting just that one
  // emoji (not the whole entry) if a fetch fails. ----
  console.log("Fetching emoji images (Twemoji)...");
  const emojiMap = await buildEmojiImageMap(pdfDoc, chronological);
  console.log(`  embedded ${emojiMap.size} unique emoji`);

  // Safety net for any remaining non-emoji character with no glyph in the
  // rendering font (true .notdef edge case) — applied per text-run inside
  // wrapMixedText, not to the raw strings, so emoji tokens are untouched.
  const kleeGlyphFilter = makeGlyphFilter(fs.readFileSync(path.join(REPO_FONTS, "klee-one/KleeOne-SemiBold.ttf")));

  // ---- Decoration images ----
  // ---- Decoration images ----
  // Use downscaled copies (scripts/butterfly-book/assets/) rather than the
  // site's full-resolution originals (public/images/decor/). Those are
  // sized for the responsive web LetterModal; here they're drawn at a
  // fixed ~110-215pt on the page, so embedding the 1536x1024 web originals
  // was pure waste (roughly 5.5MB of the file for artwork rendered at a
  // few hundred pixels). See assets/README or generate-book.mjs history
  // for how these were produced (Lanczos downscale, same aspect ratio).
  const ASSETS_DIR = path.join(__dirname, "assets");
  const cornerImg = await pdfDoc.embedPng(fs.readFileSync(path.join(ASSETS_DIR, "corner_tl_new.png")));
  const roseImg = await pdfDoc.embedPng(fs.readFileSync(path.join(ASSETS_DIR, "rose_top.png")));
  const crystalImg = await pdfDoc.embedPng(fs.readFileSync(path.join(ASSETS_DIR, "crystal_bottom.png")));

  // ==== Page flow: Movie ends → this Book opens ====
  // Cover (closing-curtain feel, minimal) → Title Page (formal) →
  // Prologue (short narrative bridge from movie to letters) → Contents →
  // Letters. Each top-level section also gets its own outline entry.
  const sectionOutline = [];

  sectionOutline.push({ title: "Cover", pageIndex: pdfDoc.getPageCount() });
  drawCoverPage(pdfDoc, { cormorantItalic, notoSans, cormorant });

  sectionOutline.push({ title: "Title Page", pageIndex: pdfDoc.getPageCount() });
  drawTitlePage(pdfDoc, { cormorant, cormorantItalic, notoSans, count: chronological.length });

  sectionOutline.push({ title: "Prologue", pageIndex: pdfDoc.getPageCount() });
  drawProloguePage(pdfDoc, { cormorantItalic, kleeRegular, notoSans });

  const TOC_ENTRIES_PER_PAGE = Math.floor((PAGE_H - 130 - 70) / 25); // matches renderToc's layout math
  const tocPageCount = Math.max(1, Math.ceil(chronological.length / TOC_ENTRIES_PER_PAGE));
  sectionOutline.push({ title: "Contents", pageIndex: pdfDoc.getPageCount() });
  const tocPages = [];
  for (let i = 0; i < tocPageCount; i++) tocPages.push(pdfDoc.addPage([PAGE_W, PAGE_H]));

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
      emojiMap,
      glyphFilter: kleeGlyphFilter,
    });
    outlineTargets.push({ title: `${i + 1}. ${entry.nickname || "（名前未設定）"}`, pageIndex: startPageIndex });
  }

  // ---- Fill in TOC (across as many pages as needed) now that we know final page numbers ----
  renderToc(tocPages, chronological, outlineTargets, notoSans, cormorantItalic, kleeSemi, TOC_ENTRIES_PER_PAGE, emojiMap);

  // ---- Add PDF outline (bookmarks): section markers + a "Letters" group ----
  const lettersNode = { title: "Letters", pageIndex: outlineTargets[0]?.pageIndex, children: outlineTargets };
  addOutline(pdfDoc, [...sectionOutline, lettersNode]);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`Wrote ${outPath} (${pdfDoc.getPageCount()} pages, ${chronological.length} entries)`);
}

/** Cover: the last frame of the movie, held on screen — just the mark,
 * nothing else. The Title Page (next) is where the book formally
 * introduces itself. Keeping the cover this quiet is what makes the
 * "movie ends, book begins" hand-off feel intentional rather than
 * abrupt. */
function drawCoverPage(pdfDoc, { cormorantItalic, notoSans, cormorant }) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: NIGHT_BG });

  const title = "Butterfly Garden";
  const titleSize = 34;
  const titleWidth = cormorant.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: (PAGE_W - titleWidth) / 2,
    y: PAGE_H / 2 + 10,
    size: titleSize,
    font: cormorant,
    color: COVER_ACCENT,
  });

  const sub = "for MIKA";
  const subSize = 18;
  const subWidth = cormorantItalic.widthOfTextAtSize(sub, subSize);
  page.drawText(sub, {
    x: (PAGE_W - subWidth) / 2,
    y: PAGE_H / 2 - 22,
    size: subSize,
    font: cormorantItalic,
    color: rgb(0.9, 0.9, 0.95),
  });
}

/** Formal title page — where the book properly states what it is,
 * separate from the quiet cover mark. */
function drawTitlePage(pdfDoc, { cormorant, cormorantItalic, notoSans, count }) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: NIGHT_BG });

  const edition = "Collector's Edition";
  const editionSize = 10;
  const editionWidth = notoSans.widthOfTextAtSize(edition, editionSize);
  page.drawText(edition, {
    x: (PAGE_W - editionWidth) / 2,
    y: PAGE_H / 2 + 130,
    size: editionSize,
    font: notoSans,
    color: rgb(0.75, 0.75, 0.85),
  });

  const title = "Butterfly Garden";
  const titleSize = 38;
  const titleWidth = cormorant.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: (PAGE_W - titleWidth) / 2,
    y: PAGE_H / 2 + 80,
    size: titleSize,
    font: cormorant,
    color: COVER_ACCENT,
  });

  const sub = "for MIKA";
  const subSize = 22;
  const subWidth = cormorantItalic.widthOfTextAtSize(sub, subSize);
  page.drawText(sub, {
    x: (PAGE_W - subWidth) / 2,
    y: PAGE_H / 2 + 44,
    size: subSize,
    font: cormorantItalic,
    color: rgb(1, 1, 1),
  });

  const bookLabel = "— Butterfly Garden Book —";
  const bookSize = 13;
  const bookWidth = notoSans.widthOfTextAtSize(bookLabel, bookSize);
  page.drawText(bookLabel, {
    x: (PAGE_W - bookWidth) / 2,
    y: PAGE_H / 2 - 4,
    size: bookSize,
    font: notoSans,
    color: rgb(0.85, 0.85, 0.9),
  });

  const countLabel = `全${count}通のメッセージ`;
  const countSize = 11;
  const countWidth = notoSans.widthOfTextAtSize(countLabel, countSize);
  page.drawText(countLabel, {
    x: (PAGE_W - countWidth) / 2,
    y: PAGE_H / 2 - 26,
    size: countSize,
    font: notoSans,
    color: rgb(0.7, 0.7, 0.78),
  });

  const dateStr = new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(new Date());
  const dateSize = 9;
  const dateWidth = notoSans.widthOfTextAtSize(dateStr, dateSize);
  page.drawText(dateStr, {
    x: (PAGE_W - dateWidth) / 2,
    y: PAGE_H / 2 - 60,
    size: dateSize,
    font: notoSans,
    color: rgb(0.55, 0.55, 0.65),
  });
}

/** Prologue — the quiet afterglow just after the movie ends, before the
 * first letter. Deliberately minimal: no explanation of what came before,
 * just the image the movie's last shot leaves behind. Edit
 * PROLOGUE_LINES below to change the wording. */
const PROLOGUE_LINES = ["最後の蝶が、", "静かに降りた場所。"];

function drawProloguePage(pdfDoc, { cormorantItalic, kleeRegular, notoSans }) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: NIGHT_BG });

  const label = "Prologue";
  const labelSize = 16;
  const labelWidth = cormorantItalic.widthOfTextAtSize(label, labelSize);
  page.drawText(label, {
    x: (PAGE_W - labelWidth) / 2,
    y: PAGE_H - 160,
    size: labelSize,
    font: cormorantItalic,
    color: COVER_ACCENT,
  });

  const bodySize = 17; // bumped for phone-screen legibility
  const lineHeight = bodySize * 2.1;
  let y = PAGE_H / 2 + (PROLOGUE_LINES.length * lineHeight) / 2 - lineHeight;

  for (const line of PROLOGUE_LINES) {
    if (line === "") {
      y -= lineHeight * 0.6;
      continue;
    }
    const w = kleeRegular.widthOfTextAtSize(line, bodySize);
    page.drawText(line, {
      x: (PAGE_W - w) / 2,
      y,
      size: bodySize,
      font: kleeRegular,
      color: rgb(0.92, 0.9, 0.94),
    });
    y -= lineHeight;
  }
}

/** Renders the Contents across as many pages as needed — `pages` is the
 * array of blank TOC pages already reserved in main(). Splitting by
 * entriesPerPage keeps every participant listed and linked, no matter
 * how many submissions there are. */
function renderToc(pages, entries, outlineTargets, notoSans, cormorantItalic, kleeSemi, entriesPerPage, emojiMap) {
  const TOC_FONT_SIZE = 13;
  const TOC_EMOJI_SIZE = 14;

  pages.forEach((page, pageNum) => {
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: NIGHT_BG });
    const headTitle = pages.length > 1 ? `Contents ${pageNum + 1}/${pages.length}` : "Contents";
    const headSize = 22;
    page.drawText(headTitle, {
      x: CARD_MARGIN_X,
      y: PAGE_H - 90,
      size: headSize,
      font: cormorantItalic,
      color: COVER_ACCENT,
    });

    let y = PAGE_H - 130;
    const lineH = 25;
    const start = pageNum * entriesPerPage;
    const end = Math.min(entries.length, start + entriesPerPage);

    for (let i = start; i < end; i++) {
      const entry = entries[i];
      const nickname = entry.nickname || "（名前未設定）";
      const nameRuns = [{ type: "text", value: `${i + 1}.  ` }, ...tokenizeEmoji(nickname)];
      const nameWidth = measureRunsWidth(nameRuns, notoSans, TOC_FONT_SIZE, TOC_EMOJI_SIZE);
      drawMixedRuns(page, nameRuns, CARD_MARGIN_X, y, {
        font: notoSans,
        size: TOC_FONT_SIZE,
        color: rgb(0.9, 0.9, 0.95),
        emojiMap,
        emojiSize: TOC_EMOJI_SIZE,
      });

      const humanPage = outlineTargets[i].pageIndex + 1;
      const pageLabel = String(humanPage);
      const pageLabelW = notoSans.widthOfTextAtSize(pageLabel, TOC_FONT_SIZE);
      page.drawText(pageLabel, {
        x: PAGE_W - CARD_MARGIN_X - pageLabelW,
        y,
        size: TOC_FONT_SIZE,
        font: notoSans,
        color: rgb(0.7, 0.7, 0.8),
      });
      // dotted leader
      const dotsStart = CARD_MARGIN_X + nameWidth + 8;
      const dotsEnd = PAGE_W - CARD_MARGIN_X - pageLabelW - 8;
      if (dotsEnd > dotsStart) {
        page.drawText(".".repeat(Math.max(0, Math.floor((dotsEnd - dotsStart) / 3))), {
          x: dotsStart,
          y,
          size: TOC_FONT_SIZE,
          font: notoSans,
          color: rgb(0.4, 0.4, 0.48),
        });
      }
      y -= lineH;
    }
  });
}

/** Draws one participant's letter, paginating across multiple pages if the
 * message is long. Every page gets the full decorative frame so the
 * "book" feels consistent no matter where you open it. */
function drawLetterEntry(pdfDoc, entry, index, assets) {
  const { kleeRegular, kleeSemi, notoSans, cormorantItalic, cornerImg, roseImg, crystalImg, emojiMap, glyphFilter } =
    assets;
  const message = entry.message || "（メッセージなし）";
  const isShort = message.length <= 30 && !message.includes("\n");

  const bodySize = messageFontSize(message.length);
  const emojiSize = bodySize * 1.05; // emoji sit slightly larger than the surrounding CJK text
  const lineGap = 1.9;
  const lineHeight = bodySize * lineGap;
  const textWidth = CARD_W - 2 * 44; // inner padding ~44pt each side

  const paragraphs = message.split("\n");
  const allLines = [];
  for (const para of paragraphs) {
    if (para === "") {
      allLines.push({ runs: [], isBlank: true });
      continue;
    }
    // Measure and draw with the same font (kleeSemi) — a previous version
    // measured with kleeRegular here but drew with kleeSemi, which could
    // silently mis-wrap since the two weights aren't the same width.
    const wrapped = wrapMixedText(para, kleeSemi, bodySize, emojiSize, textWidth, glyphFilter);
    for (const runs of wrapped) allLines.push({ runs, isBlank: false });
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
        const lw = measureRunsWidth(line.runs, kleeSemi, bodySize, emojiSize);
        const x = isShort ? (PAGE_W - lw) / 2 : CARD_LEFT + 44;
        drawMixedRuns(page, line.runs, x, y, {
          font: kleeSemi,
          size: bodySize,
          color: INK,
          emojiMap,
          emojiSize,
        });
        y -= lineHeight;
      }
      lineCursor++;
    }

    const isLastPageOfEntry = lineCursor >= allLines.length;

    if (isLastPageOfEntry) {
      // Voice note
      let footerY = CARD_BOTTOM + 40;
      if (entry.voiceUrl) {
        const note = "♪ ボイスメッセージあり（Voice Collection に収録）";
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
      const nameSize = 16;
      const nameEmojiSize = nameSize * 1.05;
      const resolvedNameRuns = entry.nickname ? tokenizeEmoji(entry.nickname) : tokenizeEmoji("（名前未設定）");
      const fromSize = 11;
      const nameWidth = measureRunsWidth(resolvedNameRuns, kleeSemi, nameSize, nameEmojiSize);
      const fromWidth = notoSans.widthOfTextAtSize(fromLabel, fromSize);
      const gap = 6;
      const totalW = fromWidth + gap + nameWidth;
      const startX = CARD_RIGHT - 44 - totalW;
      page.drawText(fromLabel, { x: startX, y: CARD_BOTTOM + 24, size: fromSize, font: notoSans, color: SENDER_LABEL });
      drawMixedRuns(page, resolvedNameRuns, startX + fromWidth + gap, CARD_BOTTOM + 22, {
        font: kleeSemi,
        size: nameSize,
        color: SENDER_NAME,
        emojiMap,
        emojiSize: nameEmojiSize,
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
  // Sized for phone-screen reading (the primary viewing context — this
  // is opened in a PDF viewer on a phone, not printed), not print-page
  // legibility. Bumped up from the original print-oriented scale.
  if (length <= 40) return 24;
  if (length <= 80) return 21;
  if (length <= 150) return 18;
  if (length <= 260) return 16;
  if (length <= 380) return 15;
  return 14;
}

/** Low-level PDF outline (bookmarks) so viewers show a jump-to-entry
 * sidebar — Preview, Acrobat, most phone PDF apps all read this. pdf-lib
 * has no high-level API for this, so we build the /Outlines dictionary
 * tree directly via pdfDoc.context.
 *
 * `nodes` is a tree: each node is either a leaf ({ title, pageIndex }) or
 * a group ({ title, pageIndex?, children: [...] }). Groups render as an
 * expandable folder in the sidebar (e.g. "Letters" containing one entry
 * per participant). */
function addOutline(pdfDoc, nodes) {
  const context = pdfDoc.context;
  const pages = pdfDoc.getPages();

  function destFor(pageIndex) {
    const page = pages[pageIndex];
    return context.obj([page.ref, PDFName.of("Fit")]);
  }

  // Returns { firstRef, lastRef, count } for this sibling level; count is
  // the number of visible rows this level contributes (used by the
  // parent's /Count).
  function buildLevel(levelNodes, parentRef) {
    const refs = levelNodes.map(() => context.nextRef());
    let totalCount = 0;

    levelNodes.forEach((node, i) => {
      const dict = {
        Title: PDFHexString.fromText(node.title),
        Parent: parentRef,
      };
      if (i > 0) dict.Prev = refs[i - 1];
      if (i < levelNodes.length - 1) dict.Next = refs[i + 1];
      if (typeof node.pageIndex === "number") dict.Dest = destFor(node.pageIndex);

      if (node.children && node.children.length > 0) {
        const child = buildLevel(node.children, refs[i]);
        dict.First = child.firstRef;
        dict.Last = child.lastRef;
        dict.Count = PDFNumber.of(child.count);
      }

      context.assign(refs[i], context.obj(dict));
      totalCount += 1 + (node.children ? node.children.length : 0);
    });

    return { firstRef: refs[0], lastRef: refs[refs.length - 1], count: totalCount };
  }

  const outlinesRootRef = context.nextRef();
  const top = buildLevel(nodes, outlinesRootRef);

  context.assign(
    outlinesRootRef,
    context.obj({
      Type: PDFName.of("Outlines"),
      First: top.firstRef,
      Last: top.lastRef,
      Count: PDFNumber.of(top.count),
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
