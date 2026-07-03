import Link from "next/link";
import CrystalIcon from "@/components/ui/CrystalIcon";
import CrystalButton from "@/components/ui/CrystalButton";
import TopPageButterflyDecor from "@/components/butterfly/TopPageButterflyDecor";
import TopPageCornerFlowers from "@/components/butterfly/TopPageCornerFlowers";
import TopPageLiveContent from "@/components/top/TopPageLiveContent";

/**
 * Birthday reveal date, mirrored from src/app/birthday/page.tsx — see that
 * file's REVEAL_DATE comment. Duplicated rather than imported because that
 * file is a Client Component ("use client") and this constant needs to be
 * evaluated server-side here.
 */
const REVEAL_DATE = new Date("2026-08-23T00:00:00+09:00");

/**
 * v2.8 spec §1.11.1 — Niya-only preview mode: visiting the top page with
 * ?preview=<NIYA_PREVIEW_KEY> forces the central evolution display to 100%
 * ahead of the real date, without a separate page or any client-visible
 * secret. The comparison happens here, in a Server Component, specifically
 * so the key never reaches client JS — only the resulting boolean does.
 */
function isForcedComplete(searchParams: { [key: string]: string | string[] | undefined }): boolean {
  if (new Date() >= REVEAL_DATE) return true;

  const previewKey = process.env.NIYA_PREVIEW_KEY;
  const provided = searchParams.preview;
  if (!previewKey || !provided) return false;

  return provided === previewKey;
}

export default function TopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const forcedComplete = isForcedComplete(searchParams);

  return (
    <main className="bg-day-garden relative min-h-screen overflow-hidden px-5 pb-12 pt-6">
      {/* Static hero background (2026-07-03: replaced the time-of-day photo
          layer here — Niya provided a dedicated portrait illustration
          (public/images/top-bg.jpg, fountain pre-centered in the crop) and
          asked for a single fixed image on TOP/SUBMIT rather than the
          morning/day/golden-hour/moon-garden rotation. That rotation now
          lives on the Garden page only — see src/app/garden/page.tsx. */}
      <div aria-hidden className="bg-photo-layer" style={{ backgroundImage: "url(/images/top-bg.jpg)" }} />

      {/* Layer 2 (texture) + Layer 3 (corner flowers) + butterfly decor all sit
          above the Layer 1 gradient but behind the real content (z-10). */}
      <TopPageCornerFlowers />
      <TopPageButterflyDecor />

      <header className="relative z-10 mb-10 flex items-center justify-end">
        <Link
          href="/garden"
          className="flex items-center gap-1.5 rounded-full bg-white/30 px-4 py-2 font-body text-xs font-bold text-[#5cb8af] backdrop-blur-md transition-all hover:bg-white/40"
          style={{ border: "1px solid rgba(232,193,112,0.3)" }}
        >
          ガーデンを見る <CrystalIcon size={16} />
        </Link>
      </header>

      <section className="relative z-10 mb-10 text-center">
        <div className="relative mx-auto max-w-xs pb-6 pt-4">
          <h1
            className="font-display text-5xl italic leading-tight"
            style={{ color: "#ff6fa8", textShadow: "0 2px 16px rgba(255,255,255,0.9), 0 1px 3px rgba(255,255,255,0.9)" }}
          >
            Butterfly Garden
          </h1>
          <p className="mt-1 font-display text-2xl italic" style={{ color: "#c9709a", textShadow: "0 1px 10px rgba(255,255,255,0.85)" }}>
            for MIKA
          </p>
        </div>

        <p
          className="mx-auto mt-2 max-w-xs rounded-2xl bg-white/40 px-4 py-3 font-display-jp text-base font-medium leading-relaxed backdrop-blur-sm"
          style={{ color: "#4a4058" }}
        >
          みんなの想いが蝶になって、
          <br />
          MIKAのための特別なガーデンをつくります。
        </p>

      </section>

      <TopPageLiveContent forcedComplete={forcedComplete} />

      <section className="relative z-10 mb-8 flex justify-center">
        <Link href="/submit" className="w-full max-w-xs">
          <CrystalButton className="w-full">
            <CrystalIcon size={20} />
            蝶を届ける
          </CrystalButton>
        </Link>
      </section>

      <section className="relative z-10 mx-auto mb-4 max-w-xs">
        <div className="divider-ornament mb-3 text-xs">
          <span className="h-px flex-1 bg-current opacity-40" />
          <span>このプロジェクトについて</span>
          <span className="h-px flex-1 bg-current opacity-40" />
        </div>
        <p
          className="rounded-2xl bg-white/35 px-4 py-3 text-center font-body text-[13px] leading-relaxed backdrop-blur-sm"
          style={{ color: "#4a4058" }}
        >
          ファンの皆さんのメッセージやボイスが蝶となり、MIKAだけの特別なガーデンに集まります。誕生日当日、蝶たちはひとつになり、最高のサプライズをお届けします。
        </p>
      </section>

    </main>
  );
}
