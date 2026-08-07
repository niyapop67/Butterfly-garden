"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import GlassCard from "@/components/ui/GlassCard";
import LetterModal from "@/components/private/LetterModal";
import { usePrivateFeed, type PrivateEntry } from "@/lib/usePrivateFeed";

/**
 * 6章 "MIKAプライベート体験" — 名前一覧リストモード.
 *
 * Of the three modes named in docs/spec-v2.9-diff-2026-06-26.md §2
 * (おまかせ再生／ガーデン探索／名前一覧リスト), this is the one with the
 * least UI ambiguity: a plain, scannable, alphabetically-sorted list —
 * the point of a "name list" is quick lookup, unlike the other two modes
 * which are meant to be more experiential (slideshow / spatial browsing).
 * v2.9 §6 itself wasn't available in this chat when this was built (see
 * spec-v2.9-diff-2026-06-28.md §4), so おまかせ再生 and ガーデン探索 are
 * left as "near future" placeholders on /private rather than guessed at.
 *
 * 2026-07-06: changed from showing every message/voice inline (a long,
 * heavy scroll) to a compact name-only list — tapping a row opens the full
 * message + voice in LetterModal instead. The "オフライン閲覧用にダウン
 * ロード" ZIP export (downloadOfflineArchive.ts) is removed as part of
 * this change: its exported page reproduced the old inline-everything
 * layout, which no longer matches this page's design, and Niya asked for
 * it gone rather than kept in sync. Full message text + voice URLs are
 * still fine to read here — this page is already behind GATE 2
 * (src/middleware.ts), same as before.
 *
 * 2026-08-06: replaced the flat .bg-night-garden fill with a dedicated
 * "crystal palace fountain garden" illustration (private_list_bg.jpg).
 * Reuses .bg-photo-layer (globals.css) rather than inventing new CSS: that
 * class already handles the two things this needed — capped to one
 * viewport (100dvh) on mobile so background-size:cover doesn't blow the
 * image up against this page's full scrollable height (see that class's
 * own comment for why), and position:fixed at the site's md:(768px)
 * breakpoint to escape .mobile-frame so it fills the real desktop
 * viewport instead of just the (still-narrow, max 640px) column — same
 * technique /private/mika's desktop hero uses. Passing backgroundImage
 * directly via inline style overrides the class's var(--bg-photo-mobile)
 * hook (inline style wins over the class rule for that one property), so
 * no CSS var wiring is needed for this single static image.
 * Grid also widens on desktop (4 → 6 cols) with larger name text, since
 * the crystal-card tiles read as cramped once the frame grows past phone
 * width.
 *
 * 2026-08-06 follow-up: dropped the readability-wash overlay and the
 * lg:8-col step per feedback from the deployed screenshot — the
 * illustration read better unfiltered, and 8 columns made name tiles too
 * narrow; settled on a flat 6-col cap from md up.
 *
 * 2026-08-07 follow-up: three more fixes from a second screenshot —
 * (1) grid still read as "narrow" on desktop because it inherited the
 * search box's implicit ~640px cap via the site's global .mobile-frame
 * column; broken out with the standard full-bleed trick (100vw width,
 * negative side margins) so it's no longer tied to that column at all —
 * see the wrapping <div> around the grid <section> below,
 * (2) 7-character names were clipping instead of scrolling because the
 * marquee only kicked in above 7 chars, not at exactly 7 — changed to
 * `>= 7`, (3) sort order wasn't actually gojuon-correct — see kanaSortKey
 * below.
 */

/** Greedy romaji→hiragana table + kanaSortKey, ported as-is from
 * scripts/butterfly-book/generate-book.mjs (same reasoning/limitations
 * documented there) so the site list and the PDF book order names the
 * same way. */
const ROMAJI_TABLE = (() => {
  const rows: Record<string, string> = {
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
  return Object.entries(rows).sort((a, b) => b[0].length - a[0].length);
})();

function romajiWordToHiragana(word: string) {
  const lower = word.toLowerCase();
  let out = "";
  let i = 0;
  while (i < lower.length) {
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
      out += lower[i];
      i += 1;
    }
  }
  return out;
}

/** Manual reading overrides for kanji this app has no dictionary for.
 * "maeda" / "まえだ" / "前田" are all the same reading — the romaji and
 * katakana/hiragana forms already convert correctly on their own, but a
 * bare kanji spelling has no automatic reading, so it's listed here
 * explicitly. Add more entries as new kanji names show up in the list.
 * Applied as a substring replace (longest key first) before the main
 * per-character loop in kanaSortKey. */
const KANJI_READING_OVERRIDES: [string, string][] = [["前田", "まえだ"]].sort(
  (a, b) => b[0].length - a[0].length
);

function kanaSortKey(nickname: string) {
  const noEmoji = nickname.replace(/\p{Extended_Pictographic}/gu, "").replace(/[\uFE0F\u200D]/g, "");
  let normalized = noEmoji.normalize("NFKC");
  for (const [kanji, reading] of KANJI_READING_OVERRIDES) {
    normalized = normalized.split(kanji).join(reading);
  }
  let out = "";
  let i = 0;
  while (i < normalized.length) {
    const ch = normalized[i];
    const cp = ch.codePointAt(0) ?? 0;
    if (cp >= 0x30a1 && cp <= 0x30f6) {
      out += String.fromCodePoint(cp - 0x60);
      i += 1;
    } else if (/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < normalized.length && /[a-zA-Z]/.test(normalized[j])) j += 1;
      out += romajiWordToHiragana(normalized.slice(i, j));
      i = j;
    } else {
      out += ch;
      i += 1;
    }
  }
  return out.trim();
}

export default function PrivateListPage() {
  const { entries, loading, error } = usePrivateFeed();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PrivateEntry | null>(null);

  // Desktop grid breakout: previously used the classic CSS-only
  // "100vw + margin-left: calc(50% - 50vw)" full-bleed trick, but that
  // depends on getting calc() whitespace exactly right (already bit us
  // once — calc(50%-50vw) is invalid and gets silently dropped) and is
  // still sensitive to vw-vs-scrollbar-width mismatches even when the
  // syntax is correct (second screenshot still showed edge columns
  // clipped). Measuring the real viewport width in JS and applying it as
  // a plain pixel width + translateX sidesteps both problems entirely —
  // no calc(), no vw unit, just numbers. document.documentElement.
  // clientWidth (not window.innerWidth) is used because it excludes the
  // vertical scrollbar, which is the actual visible content width.
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setViewportWidth(document.documentElement.clientWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const isDesktop = (viewportWidth ?? 0) >= 768;
  const breakoutStyle: CSSProperties | undefined =
    isDesktop && viewportWidth
      ? {
          position: "relative",
          left: "50%",
          width: viewportWidth,
          transform: `translateX(-${viewportWidth / 2}px)`,
        }
      : undefined;

  // 五十音順ソート: scripts/butterfly-book/generate-book.mjs の
  // kanaSortKey をそのまま移植（絵文字除去 → NFKC で半角カナを全角化 →
  // 全角カタカナをひらがな化 → アルファベット連続はローマ字テーブルで
  // ひらがな化）。前回試した Intl.Collator("ja") 単体は、この環境の
  // ICU実装がかな順を正しくタイブレークしないことが実機スクショで
  // わかったので不採用。ひらがな化した文字列同士を localeCompare(ja) で
  // 比較することで、濁音・半濁音・拗音の並びも安定する。漢字だけの名前は
  // 読みデータがないのでUnicode順にフォールバック（Bookと同じ既知の制約）。
  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) =>
        kanaSortKey(a.nickname || "").localeCompare(kanaSortKey(b.nickname || ""), "ja")
      ),
    [entries]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted;
    const q = query.trim().toLowerCase();
    return sorted.filter((e) => e.nickname.toLowerCase().includes(q));
  }, [sorted, query]);

  return (
    <main
      className="relative z-0 min-h-screen overflow-hidden px-5 pb-12 pt-6 md:overflow-x-visible md:px-6"
      style={{ backgroundColor: "#08060f" }}
    >
      <div
        aria-hidden
        className="bg-photo-layer"
        style={{ backgroundImage: "url(/images/decor/private_list_bg.jpg)" }}
      />

      <header className="relative z-10 mb-6 text-center">
        <img
          src="/images/decor/birthday_banner_v2.png"
          alt="Happy Birthday 2026.8.23"
          className="mx-auto w-full max-w-xl"
        />
      </header>

      <section className="relative z-10 mb-5 md:mx-auto md:max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ニックネームで検索"
          className="w-full rounded-full border border-white/40 bg-white/85 px-4 py-2.5 font-body text-sm outline-none placeholder:text-[#b3a6c9] md:text-base"
          style={{ color: "var(--color-ink)" }}
        />
      </section>

      {error && (
        <section className="relative z-10 mb-5 md:mx-auto md:max-w-2xl">
          <GlassCard className="px-5 py-4 text-center">
            <p className="font-body text-xs md:text-sm" style={{ color: "var(--color-ink-soft)" }}>
              {error}
            </p>
          </GlassCard>
        </section>
      )}

      <section className="relative z-10 mb-4 md:mx-auto md:max-w-2xl">
        <p className="font-body text-xs md:text-sm" style={{ color: "#cbb9e0" }}>
          {loading ? "読み込み中…" : `${filtered.length}件`}
        </p>
      </section>

      <div className="relative z-10" style={breakoutStyle}>
        <section className="grid grid-cols-4 gap-2.5 md:mx-auto md:max-w-[920px] md:grid-cols-6 md:gap-4 md:px-8">
          {!loading && filtered.length === 0 && (
            <div className="col-span-4 md:col-span-6">
              <GlassCard className="px-5 py-6 text-center">
                <p className="font-body text-xs md:text-sm" style={{ color: "var(--color-ink-soft)" }}>
                  該当する蝶が見つかりませんでした。
                </p>
              </GlassCard>
            </div>
          )}
          {filtered.map((entry) => (
            <PrivateListItem key={entry.id} entry={entry} onOpen={() => setSelected(entry)} />
          ))}
        </section>
      </div>

      <LetterModal entry={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

function PrivateListItem({ entry, onOpen }: { entry: PrivateEntry; onOpen: () => void }) {
  const name = entry.nickname || "（名前未設定）";
  const needsScroll = name.length >= 7;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex aspect-[8/5] flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-center transition-transform active:scale-[0.94]"
      style={{
        background: "linear-gradient(180deg, #fdf8ef 0%, #faf1e2 100%)",
        border: "2px solid #9c7238",
        boxShadow: "0 3px 8px rgba(60,30,50,0.16), inset 0 0 0 1px rgba(255,255,255,0.6)",
      }}
    >
      <span style={{ color: "#e0a0c0", fontSize: 9 }} aria-hidden>
        ◆
      </span>
      <div className="w-full overflow-hidden">
        {needsScroll ? (
          <div className="flex w-max animate-marquee">
            <p
              className="whitespace-nowrap px-1 font-display-jp text-sm font-bold leading-tight md:text-base"
              style={{ color: "#8a6d3f" }}
            >
              {name}
            </p>
            <p
              className="whitespace-nowrap px-1 font-display-jp text-sm font-bold leading-tight md:text-base"
              style={{ color: "#8a6d3f" }}
              aria-hidden
            >
              {name}
            </p>
          </div>
        ) : (
          <p
            className="whitespace-nowrap text-center font-display-jp text-sm font-bold leading-tight md:text-base"
            style={{ color: "#8a6d3f" }}
          >
            {name}
          </p>
        )}
      </div>
    </button>
  );
}
