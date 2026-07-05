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
      {/* Static background (2026-07-05): Niya provided two dedicated
          illustrations instead of reusing the Garden page's time-of-day
          rotation here — a portrait crop for mobile (fountain further down
          the path) and a separate wide landscape crop for desktop, which
          goes full-bleed edge-to-edge instead of being confined to the
          phone-frame column (see the @media block on .bg-photo-layer in
          globals.css). Applies to TOP and SUBMIT only; Garden keeps its own
          morning/day/golden-hour/moon-garden rotation. */}
      <div
        aria-hidden
        className="bg-photo-layer md:hidden"
        style={{ backgroundImage: "url(/images/topsubmit-bg-mobile.jpg)" }}
      />
      <div
        aria-hidden
        className="bg-photo-layer hidden md:block"
        style={{ backgroundImage: "url(/images/topsubmit-bg-desktop.jpg)" }}
      />

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
        <div className="relative mx-auto max-w-xs pb-6 pt-4 md:max-w-md">
          <h1
            className="font-display text-5xl italic leading-tight md:text-7xl"
            style={{ color: "#3f9c82", textShadow: "0 2px 16px rgba(255,255,255,0.9), 0 1px 3px rgba(255,255,255,0.9)" }}
          >
            Butterfly Garden
          </h1>
          <p className="mt-1 font-display text-2xl italic md:text-4xl" style={{ color: "#ff6fa8", textShadow: "0 1px 10px rgba(255,255,255,0.85)" }}>
            for MIKA
          </p>
        </div>

        <p
          className="mx-auto mt-2 max-w-xs rounded-2xl bg-white/40 px-4 py-3 text-center font-display-jp text-base font-medium leading-relaxed backdrop-blur-sm md:max-w-md md:text-lg"
          style={{ color: "#4a4058" }}
        >
          みんなの想いが蝶になって
          <br />
          MIKAのための
          <br />
          特別なガーデンをつくります
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

    </main>
  );
}
