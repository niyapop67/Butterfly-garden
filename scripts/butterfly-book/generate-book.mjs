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

// English chapter titles for the Contents page (2026-07-19 request: list
// each butterfly type as a "chapter" — English title, nicknames indented
// underneath — rather than one flat numbered list). Deliberately separate
// from BUTTERFLY_THEME_LABELS (Japanese, used on the divider pages) since
// the desired chapter wording is shorter/simpler than labelEn in
// src/types/submission.ts (e.g. "Pink Butterfly" not "Pink Heart / Love").
const TOC_CHAPTER_LABELS_EN = {
  "pink-heart": "Pink Butterfly",
  "tiffany-sky": "Blue Butterfly",
  "crystal-white": "White Butterfly",
  "aurora-dream": "Rainbow Butterfly",
  "emerald-garden": "Green Butterfly",
  "golden-sunshine": "Gold Butterfly",
};
const TOC_CHAPTER_LABEL_OTHER = "Other";

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
 * Separately, Klee One / Noto Sans JP don't cover every script either —
 * a Thai fan's nickname needs Noto Sans Thai instead. makeCoverageChecker
 * builds a synchronous hasGlyph(char) test against a font's real glyph
 * table (via fontkit directly, independent of pdf-lib); resolveFontChain
 * below uses one of these per font to pick which embedded font renders
 * each character, falling through in priority order. A character with no
 * glyph in ANY font in the chain (true .notdef case — extremely rare) is
 * silently dropped as a last-resort safety net so generation never breaks
 * or shows a visible tofu box. */
function makeCoverageChecker(fontBuffer) {
  const rawFont = fontkit.create(fontBuffer);
  return function hasGlyph(char) {
    const cp = char.codePointAt(0);
    let glyph;
    try {
      glyph = rawFont.glyphForCodePoint(cp);
    } catch {
      return false;
    }
    return !!glyph && glyph.id !== 0;
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

/** Measures the rendered width of a run list (mix of {type:'text', font}
 * and {type:'emoji'} entries) at a given font size. Emoji are drawn as
 * square images sized to `emojiSize`. */
function measureRunsWidth(runs, size, emojiSize) {
  let w = 0;
  for (const run of runs) {
    w += run.type === "emoji" ? emojiSize : run.font.widthOfTextAtSize(run.value, size);
  }
  return w;
}

/** Draws a run list left-to-right starting at (x, y), where y is the text
 * baseline. Each text run carries its own resolved font (from the
 * fallback chain), so mixed-script strings like "🦋前田chie" or a Thai
 * nickname render correctly in one call. Emoji images are nudged down
 * slightly so their visual center sits closer to the surrounding text's
 * optical center (square images anchored at their bottom-left by pdf-lib
 * would otherwise sit too high relative to a baseline-anchored font).
 * Returns the ending x. */
function drawMixedRuns(page, runs, x, y, { size, color, emojiMap, emojiSize }) {
  let cursor = x;
  for (const run of runs) {
    if (run.type === "emoji") {
      const img = emojiMap.get(run.value);
      if (img) {
        page.drawImage(img, { x: cursor, y: y - emojiSize * 0.12, width: emojiSize, height: emojiSize });
      }
      cursor += emojiSize; // reserve the slot even if the image was missing
    } else {
      page.drawText(run.value, { x: cursor, y, size, font: run.font, color });
      cursor += run.font.widthOfTextAtSize(run.value, size);
    }
  }
  return cursor;
}

/** Picks the first font in `fontChain` (an array of { font, hasGlyph })
 * that has a glyph for `char`. Returns null if none do (safety-net drop
 * case). */
function pickFontForChar(char, fontChain) {
  for (const entry of fontChain) {
    if (entry.hasGlyph(char)) return entry.font;
  }
  return null;
}

/** Tokenizes text into emoji + text runs, resolves each non-emoji
 * character against `fontChain` in priority order (e.g. Klee One first,
 * Noto Sans Thai as fallback for a Thai nickname — a character with no
 * glyph anywhere in the chain is silently dropped), then greedily wraps
 * the combined run stream into lines no wider than maxWidth — treating
 * each emoji as one atomic unit (never split across a line break) and
 * each character as a candidate break point (matches how Japanese wraps
 * without spaces). A font change mid-line (e.g. Japanese text followed by
 * a Thai name) starts a new run so drawMixedRuns can switch fonts at the
 * right spot. Returns an array of lines, each an array of runs ready for
 * measureRunsWidth / drawMixedRuns. */
function wrapMixedText(text, fontChain, size, emojiSize, maxWidth) {
  const atoms = [];
  for (const token of tokenizeEmoji(text)) {
    if (token.type === "emoji") {
      atoms.push({ type: "emoji", value: token.value });
    } else {
      for (const ch of token.value) {
        const font = pickFontForChar(ch, fontChain);
        if (!font) continue; // no font in the chain covers this char — drop
        atoms.push({ type: "char", value: ch, font });
      }
    }
  }
  if (atoms.length === 0) return [[]];

  const lines = [];
  let runs = [];
  let textBuf = "";
  let textBufFont = null;
  let width = 0;

  const flushText = () => {
    if (textBuf) {
      runs.push({ type: "text", value: textBuf, font: textBufFont });
      textBuf = "";
      textBufFont = null;
    }
  };
  const flushLine = () => {
    flushText();
    lines.push(runs);
    runs = [];
    width = 0;
  };

  for (const atom of atoms) {
    const w = atom.type === "emoji" ? emojiSize : atom.font.widthOfTextAtSize(atom.value, size);
    if (width + w > maxWidth && width > 0) flushLine();
    if (atom.type === "emoji") {
      flushText();
      runs.push({ type: "emoji", value: atom.value });
    } else {
      if (textBufFont && textBufFont !== atom.font) flushText(); // font changed — start a new run
      textBuf += atom.value;
      textBufFont = atom.font;
    }
    width += w;
  }
  flushLine();
  return lines;
}

/** Same font-chain + emoji resolution as wrapMixedText, but for text that
 * should never wrap (sender names, TOC entries) — returns one run list
 * instead of an array of lines. */
function resolveMixedRuns(text, fontChain) {
  const lines = wrapMixedText(text, fontChain, 1, 1, Infinity);
  return lines[0] || [];
}

/** Greedy romaji→hiragana table, longest match first. Covers the common
 * Hepburn patterns (digraphs like "kya", the sokuon doubled-consonant
 * "kk" → っk, "shi"/"chi"/"tsu" irregulars, n-row). Good enough to turn
 * "maeda" into "まえだ" so it sorts under ま like a Japanese reader would
 * expect — not a full romaji parser, but real nicknames are short and
 * simple enough that this covers the common cases. */
const ROMAJI_TABLE = (() => {
  const rows = {
    a: "あ", i: "い", u: "う", e: "え", o: "お",
    ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
    sa: "さ", shi: "し", su: "す", se: "せ", so: "そ",
    ta: "た", chi: "ち", tsu: "つ", te: "て", to: "と",
    na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
    ha: "は", hi: "ひ", fu: "ふ", he: "へ", ho: "ほ",
    ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
    ya: "や", yu: "ゆ", yo: "よ",
    ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
    wa: "わ", wo: "を", wi: "うぃ", we: "うぇ",
    ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
    za: "ざ", ji: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
    da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
    ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
    pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
    kya: "きゃ", kyu: "きゅ", kyo: "きょ",
    sha: "しゃ", shu: "しゅ", sho: "しょ",
    cha: "ちゃ", chu: "ちゅ", cho: "ちょ",
    nya: "にゃ", nyu: "にゅ", nyo: "にょ",
    hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",
    mya: "みゃ", myu: "みゅ", myo: "みょ",
    rya: "りゃ", ryu: "りゅ", ryo: "りょ",
    gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",
    ja: "じゃ", ju: "じゅ", jo: "じょ",
    bya: "びゃ", byu: "びゅ", byo: "びょ",
    pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ",
    fa: "ふぁ", fi: "ふぃ", fe: "ふぇ", fo: "ふぉ",
    n: "ん",
  };
  // Longest keys first so greedy matching prefers "kya" over "ka"+"ya".
  return Object.entries(rows).sort((a, b) => b[0].length - a[0].length);
})();

function romajiWordToHiragana(word) {
  const lower = word.toLowerCase();
  let out = "";
  let i = 0;
  while (i < lower.length) {
    // Sokuon: doubled consonant (not n) → っ + rest, e.g. "kko" → っこ
    if (
      i + 1 < lower.length &&
      lower[i] === lower[i + 1] &&
      "bcdfghjklmpqrstvwxyz".includes(lower[i])
    ) {
      out += "っ";
      i += 1;
      continue;
    }
    let matched = false;
    for (const [key, kana] of ROMAJI_TABLE) {
      if (lower.startsWith(key, i)) {
        out += kana;
        i += key.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += lower[i]; // unrecognized letter — keep literally, still sorts stably
      i += 1;
    }
  }
  return out;
}

/** Builds a sort key that approximates gojuon (五十音) order for a mixed
 * nickname: strips emoji/decorative symbols, normalizes half-width
 * katakana to full-width and then to hiragana (NFKC + a code-point
 * shift), and converts runs of ASCII letters via the romaji table above
 * so "maeda" sorts under ま like "前田" would if we had its reading.
 * Kanji (and any other untranslated script, e.g. Thai) pass through
 * literally — there's no reading dictionary here, so those fall back to
 * plain Unicode order, which is a reasonable degradation but not truly
 * gojuon-correct. Compare the results with `.localeCompare(other, "ja")`
 * for proper Japanese collation. */
function kanaSortKey(nickname) {
  const noEmoji = tokenizeEmoji(nickname || "")
    .filter((t) => t.type === "text")
    .map((t) => t.value)
    .join("");
  const normalized = noEmoji.normalize("NFKC"); // half-width katakana -> full-width
  let out = "";
  let i = 0;
  while (i < normalized.length) {
    const ch = normalized[i];
    const cp = ch.codePointAt(0);
    if (cp >= 0x30a1 && cp <= 0x30f6) {
      // Full-width katakana -> hiragana (same relative layout, -0x60)
      out += String.fromCodePoint(cp - 0x60);
      i += 1;
    } else if (/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < normalized.length && /[a-zA-Z]/.test(normalized[j])) j += 1;
      out += romajiWordToHiragana(normalized.slice(i, j));
      i = j;
    } else {
      out += ch; // hiragana, kanji, digits, Thai, symbols — pass through
      i += 1;
    }
  }
  return out.trim();
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

/** Groups entries by butterfly type (in BUTTERFLY_THEME_LABELS' key
 * order — treated as the site's own type ordering, since there's no
 * other defined ranking), then sorts each group in gojuon order via
 * kanaSortKey (createdAtMs as a stable tiebreaker for identical/near-
 * identical keys). Returns the flattened, ordered entry list plus the
 * group boundaries (type, label, start index, count) needed to insert a
 * section-divider page and a nested outline entry per group. Any entry
 * with a butterflyType not in BUTTERFLY_THEME_LABELS is grouped last
 * under a plain "その他" label rather than dropped. */
function groupAndSortEntries(entries) {
  const orderedTypes = Object.keys(BUTTERFLY_THEME_LABELS);
  const byType = new Map(orderedTypes.map((t) => [t, []]));
  const other = [];
  for (const entry of entries) {
    if (byType.has(entry.butterflyType)) byType.get(entry.butterflyType).push(entry);
    else other.push(entry);
  }

  const sortGroup = (group) =>
    [...group].sort((a, b) => {
      const cmp = kanaSortKey(a.nickname || "").localeCompare(kanaSortKey(b.nickname || ""), "ja");
      return cmp !== 0 ? cmp : (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0);
    });

  const ordered = [];
  const groups = [];
  for (const type of orderedTypes) {
    const sorted = sortGroup(byType.get(type));
    if (sorted.length === 0) continue;
    groups.push({ type, label: BUTTERFLY_THEME_LABELS[type], startIndex: ordered.length, count: sorted.length });
    ordered.push(...sorted);
  }
  if (other.length > 0) {
    const sorted = sortGroup(other);
    groups.push({ type: null, label: "その他", startIndex: ordered.length, count: sorted.length });
    ordered.push(...sorted);
  }
  return { ordered, groups };
}

async function main() {
  const [, , entriesPath, outPath] = process.argv;
  if (!entriesPath || !outPath) {
    console.error("Usage: node generate-book.mjs <entries.json> <output.pdf>");
    process.exit(1);
  }

  const entries = JSON.parse(fs.readFileSync(entriesPath, "utf-8"));
  const { ordered: orderedEntries, groups: butterflyGroups } = groupAndSortEntries(entries);

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
  const kleeUsedChars = collectKleeCharSet(orderedEntries);
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
  // Fallback for scripts Klee One / Noto Sans JP don't cover (e.g. a Thai
  // fan's nickname — 92026-07-17 real-world case). Variable font, so it
  // stays fully embedded (unsubset) per the note above.
  const notoSansThaiBytes = fs.readFileSync(path.join(REPO_FONTS, "noto-sans-thai/NotoSansThai-Variable.ttf"));
  const notoSansThai = await pdfDoc.embedFont(notoSansThaiBytes);

  // Font-fallback chains: try the primary font first, fall through to
  // Thai for any character the primary font doesn't cover. A character
  // covered by neither is dropped (see makeCoverageChecker).
  const kleeCoverage = makeCoverageChecker(kleeSemiBytes);
  const notoCoverage = makeCoverageChecker(fs.readFileSync(path.join(REPO_FONTS, "noto-sans-jp/NotoSansJP-Variable.ttf")));
  const thaiCoverage = makeCoverageChecker(notoSansThaiBytes);
  const kleeFontChain = [
    { font: kleeSemi, hasGlyph: kleeCoverage },
    { font: notoSansThai, hasGlyph: thaiCoverage },
  ];
  const tocFontChain = [
    { font: notoSans, hasGlyph: notoCoverage },
    { font: notoSansThai, hasGlyph: thaiCoverage },
  ];

  // ---- Emoji handling: MIKA's fan symbols (🦋 / 💕) mean most nicknames
  // will contain emoji, and people write them into messages too. Klee One
  // has no emoji glyphs, so fetch+embed each unique emoji once as a small
  // Twemoji image; drawLetterEntry/renderToc render them inline with the
  // surrounding text instead of dropping them. Requires network access
  // (raw.githubusercontent.com) — falls back to omitting just that one
  // emoji (not the whole entry) if a fetch fails. ----
  console.log("Fetching emoji images (Twemoji)...");
  const emojiMap = await buildEmojiImageMap(pdfDoc, orderedEntries);
  console.log(`  embedded ${emojiMap.size} unique emoji`);

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
  // The site's real Moon Garden photo (mobile crop — closest orientation
  // match to our portrait page), used as the background everywhere the
  // book previously had a flat NIGHT_BG fill.
  const bgImage = await pdfDoc.embedJpg(fs.readFileSync(path.join(ASSETS_DIR, "night-bg.jpg")));

  // Butterfly-type icons for the section dividers between groups (①/⑧
  // request: split letters by butterfly type). Only load icons for types
  // actually present, in case an icon file is ever missing — a divider
  // with no icon still works, it just draws label + count.
  const butterflyIcons = new Map();
  for (const group of butterflyGroups) {
    if (!group.type) continue; // "その他" fallback group has no icon
    const iconPath = path.join(ASSETS_DIR, "butterflies", `${group.type}.png`);
    if (fs.existsSync(iconPath)) {
      butterflyIcons.set(group.type, await pdfDoc.embedPng(fs.readFileSync(iconPath)));
    }
  }

  // ==== Page flow: Movie ends → this Book opens ====
  // Cover (closing-curtain feel, minimal) → Title Page (formal) →
  // Prologue (short narrative bridge from movie to letters) → Contents →
  // Letters. Each top-level section also gets its own outline entry.
  const sectionOutline = [];

  sectionOutline.push({ title: "Cover", pageIndex: pdfDoc.getPageCount() });
  drawCoverPage(pdfDoc, { cormorantItalic, notoSans, cormorant, bgImage });

  sectionOutline.push({ title: "Title Page", pageIndex: pdfDoc.getPageCount() });
  drawTitlePage(pdfDoc, { cormorant, cormorantItalic, notoSans, count: orderedEntries.length, bgImage });

  sectionOutline.push({ title: "Prologue", pageIndex: pdfDoc.getPageCount() });
  drawProloguePage(pdfDoc, { cormorantItalic, kleeRegular, notoSans, bgImage });

  // ---- Contents layout: one "chapter" per butterfly type, nicknames
  // indented underneath (2026-07-19 request) instead of one flat numbered
  // list. Build the full row list first (headers + entries), then paginate
  // by actual row height so a header never gets stranded as the last line
  // on a page with none of its entries following it. ----
  const tocRows = buildTocRows(butterflyGroups);
  const tocRowPages = paginateTocRows(tocRows);
  const tocPageCount = tocRowPages.length;
  sectionOutline.push({ title: "Contents", pageIndex: pdfDoc.getPageCount() });
  const tocPages = [];
  for (let i = 0; i < tocPageCount; i++) tocPages.push(pdfDoc.addPage([PAGE_W, PAGE_H]));

  // ==== Letter pages (grouped by butterfly type, gojuon order within
  // each group — see groupAndSortEntries) ====
  const outlineTargets = []; // flat list, still used by TOC page numbers
  const letterGroupNodes = []; // nested outline: one node per butterfly type
  let cursor = 0;
  for (const group of butterflyGroups) {
    // Section divider page for this butterfly type.
    const dividerPageIndex = pdfDoc.getPageCount();
    drawGroupDividerPage(pdfDoc, {
      cormorantItalic,
      notoSans,
      bgImage,
      label: group.label,
      count: group.count,
      icon: group.type ? butterflyIcons.get(group.type) : null,
    });

    const groupOutlineChildren = [];
    for (let j = 0; j < group.count; j++) {
      const globalIndex = cursor + j; // 0-based position in orderedEntries
      const entry = orderedEntries[globalIndex];
      const startPageIndex = pdfDoc.getPageCount();
      drawLetterEntry(pdfDoc, entry, globalIndex + 1, {
        kleeRegular,
        kleeSemi,
        notoSans,
        cormorantItalic,
        cornerImg,
        roseImg,
        crystalImg,
        emojiMap,
        kleeFontChain,
        bgImage,
      });
      const target = { title: `${globalIndex + 1}. ${entry.nickname || "（名前未設定）"}`, pageIndex: startPageIndex };
      outlineTargets.push(target);
      groupOutlineChildren.push(target);
    }
    letterGroupNodes.push({ title: group.label, pageIndex: dividerPageIndex, children: groupOutlineChildren });
    cursor += group.count;
  }

  // ---- Fill in TOC (across as many pages as needed) now that we know final page numbers ----
  renderToc(tocPages, tocRowPages, orderedEntries, outlineTargets, notoSans, cormorantItalic, emojiMap, bgImage, tocFontChain);

  // ---- Add PDF outline (bookmarks): section markers + a "Letters" group nested by butterfly type ----
  const lettersNode = { title: "Letters", pageIndex: letterGroupNodes[0]?.pageIndex, children: letterGroupNodes };
  addOutline(pdfDoc, [...sectionOutline, lettersNode]);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`Wrote ${outPath} (${pdfDoc.getPageCount()} pages, ${orderedEntries.length} entries)`);
}

/** Cover: the last frame of the movie, held on screen — just the mark,
 * nothing else. The Title Page (next) is where the book formally
 * introduces itself. Keeping the cover this quiet is what makes the
 * "movie ends, book begins" hand-off feel intentional rather than
 * abrupt. */
/** pdf-lib draws text via simple cmap → glyph → hmtx-advance placement;
 * it has no OpenType shaping engine, so it never applies GSUB ligature
 * substitution ('liga'). Cormorant Garamond (like many display serifs)
 * designs its standalone 'f' with a short hook on the assumption it will
 * either ligate with a following 'l' or get pulled in by GPOS kerning —
 * neither happens here, so "Butterfly" shows a visible gap right where
 * the 'f' hook should meet the 'l'. Confirmed via HarfBuzz shaping
 * (proper ligature substitution changes the total word width by under
 * 0.3pt — so this is a glyph-design/visual gap, not a wrong advance
 * width — manual kerning is the pragmatic fix without a full shaper).
 *
 * Draws `text` left-to-right, pulling the draw cursor back by
 * `size * FL_KERN_EM` right before any "fl" pair. Centering math
 * elsewhere can keep using the unadjusted widthOfTextAtSize — the pull-in
 * is a few points out of a 250+pt title, not worth re-deriving centering
 * for. */
const FL_KERN_EM = -0.1;

function drawTitleTextWithFlFix(page, text, { x, y, size, font, color }) {
  let cursor = x;
  let i = 0;
  while (i < text.length) {
    const isFl = text[i] === "f" && text[i + 1] === "l";
    const segEnd = isFl ? i + 2 : (text.indexOf("f", i + 1) === -1 ? text.length : text.indexOf("f", i + 1));
    const segment = text.slice(i, segEnd);
    if (isFl) cursor += size * FL_KERN_EM;
    page.drawText(segment, { x: cursor, y, size, font, color });
    cursor += font.widthOfTextAtSize(segment, size);
    i = segEnd;
  }
}

/** Draws the site's real Moon Garden background photo full-bleed on the
 * page (cover-fit: scaled so it fills both dimensions, overflow clipped
 * by the page's own boundaries — standard PDF behavior, no explicit clip
 * needed), then a translucent dark overlay on top so the existing text
 * colors (gold, pink, white) stay legible regardless of what's brightest
 * in that particular crop of the photo. Replaces the old flat NIGHT_BG
 * fill everywhere it was used. */
function drawNightBackground(page, bgImage) {
  const scale = Math.max(PAGE_W / bgImage.width, PAGE_H / bgImage.height);
  const drawW = bgImage.width * scale;
  const drawH = bgImage.height * scale;
  page.drawImage(bgImage, {
    x: (PAGE_W - drawW) / 2,
    y: (PAGE_H - drawH) / 2,
    width: drawW,
    height: drawH,
  });
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: NIGHT_BG, opacity: 0.45 });
}

function drawCoverPage(pdfDoc, { cormorantItalic, notoSans, cormorant, bgImage }) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  drawNightBackground(page, bgImage);

  const title = "Butterfly Garden";
  const titleSize = 34;
  const titleWidth = cormorant.widthOfTextAtSize(title, titleSize);
  drawTitleTextWithFlFix(page, title, {
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

  const dateLabel = "2026.8.23";
  const dateSize = 13;
  const dateWidth = cormorantItalic.widthOfTextAtSize(dateLabel, dateSize);
  page.drawText(dateLabel, {
    x: (PAGE_W - dateWidth) / 2,
    y: PAGE_H / 2 - 50,
    size: dateSize,
    font: cormorantItalic,
    color: rgb(0.75, 0.75, 0.85),
  });
}

/** Formal title page — where the book properly states what it is,
 * separate from the quiet cover mark. */
function drawTitlePage(pdfDoc, { cormorant, cormorantItalic, notoSans, count, bgImage }) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  drawNightBackground(page, bgImage);

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
  drawTitleTextWithFlFix(page, title, {
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

function drawProloguePage(pdfDoc, { cormorantItalic, kleeRegular, notoSans, bgImage }) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  drawNightBackground(page, bgImage);

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

/** A section divider between butterfly-type groups: the type's icon
 * (from the site's own butterfly artwork, see assets/butterflies/),
 * its Japanese label, and a small count. Uses the same night-background
 * + Cormorant Garamond Italic label styling as Prologue/Contents so it
 * reads as part of the same book, not an inserted afterthought. */
function drawGroupDividerPage(pdfDoc, { cormorantItalic, notoSans, bgImage, label, count, icon }) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  drawNightBackground(page, bgImage);

  if (icon) {
    const iconDrawW = 130;
    const iconDrawH = iconDrawW * (icon.height / icon.width);
    page.drawImage(icon, {
      x: (PAGE_W - iconDrawW) / 2,
      y: PAGE_H / 2 - 10,
      width: iconDrawW,
      height: iconDrawH,
    });
  }

  const labelSize = 24;
  const labelWidth = cormorantItalic.widthOfTextAtSize(label, labelSize);
  page.drawText(label, {
    x: (PAGE_W - labelWidth) / 2,
    y: PAGE_H / 2 - 60,
    size: labelSize,
    font: cormorantItalic,
    color: COVER_ACCENT,
  });

  const countLabel = `${count}通`;
  const countSize = 12;
  const countWidth = notoSans.widthOfTextAtSize(countLabel, countSize);
  page.drawText(countLabel, {
    x: (PAGE_W - countWidth) / 2,
    y: PAGE_H / 2 - 84,
    size: countSize,
    font: notoSans,
    color: rgb(0.75, 0.75, 0.85),
  });
}

// ---- Contents (TOC) row layout constants ----
// Two row kinds share one flow so pagination can treat them uniformly:
//   { kind: "header", label }               — chapter title (butterfly type)
//   { kind: "entry", globalIndex }           — one participant, indented under its chapter
const TOC_ENTRY_LINE_H = 25;
const TOC_HEADER_LINE_H = 34; // header + the gap before its first entry
const TOC_TOP_Y = PAGE_H - 130;
const TOC_BOTTOM_MARGIN = 70;
const TOC_ENTRY_INDENT = 20; // nicknames sit indented under their chapter header
const TOC_CHAPTER_FONT_SIZE = 15;

/** Flattens butterflyGroups (from groupAndSortEntries) into an ordered row
 * list: one header row per group, followed by one entry row per member,
 * in the same order the letters themselves appear. */
function buildTocRows(butterflyGroups) {
  const rows = [];
  for (const group of butterflyGroups) {
    const label = group.type ? (TOC_CHAPTER_LABELS_EN[group.type] ?? group.label) : TOC_CHAPTER_LABEL_OTHER;
    rows.push({ kind: "header", label });
    for (let j = 0; j < group.count; j++) {
      rows.push({ kind: "entry", globalIndex: group.startIndex + j });
    }
  }
  return rows;
}

/** Paginates TOC rows by actual height instead of a fixed entries-per-page
 * count, so a chapter header is never stranded alone at the bottom of a
 * page with none of its entries following (a widowed header would look
 * broken — a chapter title with nothing under it until the next page). */
function paginateTocRows(rows) {
  const usableH = TOC_TOP_Y - TOC_BOTTOM_MARGIN;
  const pages = [];
  let current = [];
  let y = usableH;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowH = row.kind === "header" ? TOC_HEADER_LINE_H : TOC_ENTRY_LINE_H;
    // Widow control: if this is a header, make sure at least one entry
    // row also fits below it on this page — otherwise start the chapter
    // on the next page instead.
    const nextRowH = row.kind === "header" && rows[i + 1] ? TOC_ENTRY_LINE_H : 0;
    if (current.length > 0 && y - rowH - nextRowH < 0) {
      pages.push(current);
      current = [];
      y = usableH;
    }
    current.push(row);
    y -= rowH;
  }
  if (current.length > 0) pages.push(current);
  return pages.length > 0 ? pages : [[]];
}

/** Renders the Contents across as many pages as needed — `pages` is the
 * array of blank TOC pages already reserved in main(), `rowPages` is the
 * matching array of row arrays from paginateTocRows. Each butterfly-type
 * group reads as its own chapter: an English title, then its members'
 * nicknames indented underneath, gojuon-ordered within the chapter (see
 * groupAndSortEntries) — mirroring the grouping the divider pages already
 * show, instead of one continuous flat numbered list. */
function renderToc(pages, rowPages, entries, outlineTargets, notoSans, cormorantItalic, emojiMap, bgImage, tocFontChain) {
  const TOC_FONT_SIZE = 13;
  const TOC_EMOJI_SIZE = 14;

  pages.forEach((page, pageNum) => {
    drawNightBackground(page, bgImage);
    const headTitle = pages.length > 1 ? `Contents ${pageNum + 1}/${pages.length}` : "Contents";
    const headSize = 22;
    page.drawText(headTitle, {
      x: CARD_MARGIN_X,
      y: PAGE_H - 90,
      size: headSize,
      font: cormorantItalic,
      color: COVER_ACCENT,
    });

    let y = TOC_TOP_Y;

    for (const row of rowPages[pageNum] ?? []) {
      if (row.kind === "header") {
        page.drawText(row.label, {
          x: CARD_MARGIN_X,
          y,
          size: TOC_CHAPTER_FONT_SIZE,
          font: cormorantItalic,
          color: COVER_ACCENT,
        });
        y -= TOC_HEADER_LINE_H;
        continue;
      }

      const i = row.globalIndex;
      const entry = entries[i];
      const nickname = entry.nickname || "（名前未設定）";
      const nameRuns = resolveMixedRuns(nickname, tocFontChain);
      const nameX = CARD_MARGIN_X + TOC_ENTRY_INDENT;
      const nameWidth = measureRunsWidth(nameRuns, TOC_FONT_SIZE, TOC_EMOJI_SIZE);
      drawMixedRuns(page, nameRuns, nameX, y, {
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
      const dotsStart = nameX + nameWidth + 8;
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
      y -= TOC_ENTRY_LINE_H;
    }
  });
}

/** Draws one participant's letter, paginating across multiple pages if the
 * message is long. Every page gets the full decorative frame so the
 * "book" feels consistent no matter where you open it. */
function drawLetterEntry(pdfDoc, entry, index, assets) {
  const {
    kleeRegular,
    kleeSemi,
    notoSans,
    cormorantItalic,
    cornerImg,
    roseImg,
    crystalImg,
    emojiMap,
    kleeFontChain,
    bgImage,
  } =
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
    const wrapped = wrapMixedText(para, kleeFontChain, bodySize, emojiSize, textWidth);
    for (const runs of wrapped) allLines.push({ runs, isBlank: false });
  }

  let lineCursor = 0;
  let pageInSeries = 0;

  while (lineCursor < allLines.length || pageInSeries === 0) {
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    drawPageFrame(page, cornerImg, roseImg, crystalImg, bgImage);

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
        const lw = measureRunsWidth(line.runs, bodySize, emojiSize);
        const x = isShort ? (PAGE_W - lw) / 2 : CARD_LEFT + 44;
        drawMixedRuns(page, line.runs, x, y, {
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
      const resolvedNameRuns = resolveMixedRuns(entry.nickname || "（名前未設定）", kleeFontChain);
      const fromSize = 11;
      const nameWidth = measureRunsWidth(resolvedNameRuns, nameSize, nameEmojiSize);
      const fromWidth = notoSans.widthOfTextAtSize(fromLabel, fromSize);
      const gap = 6;
      const totalW = fromWidth + gap + nameWidth;
      const startX = CARD_RIGHT - 44 - totalW;
      page.drawText(fromLabel, { x: startX, y: CARD_BOTTOM + 24, size: fromSize, font: notoSans, color: SENDER_LABEL });
      drawMixedRuns(page, resolvedNameRuns, startX + fromWidth + gap, CARD_BOTTOM + 22, {
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

function drawPageFrame(page, cornerImg, roseImg, crystalImg, bgImage) {
  // Night background behind everything (the site's real Moon Garden photo, not a flat fill)
  drawNightBackground(page, bgImage);

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
