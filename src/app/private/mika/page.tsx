import Image from "next/image";
import Link from "next/link";
import CrystalButton from "@/components/ui/CrystalButton";
import CrystalIcon from "@/components/ui/CrystalIcon";

/**
 * MIKA's dedicated landing page (2026-07-24 request) — separate from
 * /private/list (the name-list itself). This page is just a hero banner
 * (the "Butterfly Garden for MIKA" artwork) with buttons overlaid directly
 * on the image (2026-07-24 follow-up: moved from a section below the image
 * to sit on top of it, near the bottom over the garden path), linking out
 * to the existing name list and the public garden page.
 *
 * 2026-07-24 follow-up: made responsive for both phone and desktop — on
 * mobile the hero runs full-bleed near the top of the viewport; on wider
 * screens it's capped at max-w-2xl and vertically centered instead of
 * stretching edge-to-edge, with a soft shadow/rounded frame so it reads as
 * a deliberate card rather than an oversized banner.
 *
 * Below/around the hero, the page still uses the existing .bg-night-garden
 * CSS background rather than the busy night-sky photo — Niya flagged that
 * would hurt legibility if this page grows more content later.
 *
 * Book (PDF) and Voice are sent directly rather than linked from here, so
 * there's no download button for either — just navigation.
 */
export default function MikaLandingPage() {
  return (
    <main className="bg-night-garden flex min-h-screen items-center justify-center overflow-hidden p-0 sm:p-8">
      <div className="relative w-full sm:max-w-2xl sm:overflow-hidden sm:rounded-[28px] sm:shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <Image
          src="/images/decor/mika_hero.jpg"
          alt="Butterfly Garden for MIKA"
          width={1536}
          height={1024}
          priority
          sizes="(min-width: 640px) 42rem, 100vw"
          className="w-full h-auto"
        />

        <div className="absolute inset-x-0 bottom-[6%] z-10 flex flex-col items-center gap-2.5 px-6 sm:bottom-[8%] sm:gap-3">
          <Link href="/private/list" className="w-full max-w-[15rem] sm:max-w-xs">
            <CrystalButton className="w-full text-sm sm:text-base">
              <CrystalIcon size={18} className="sm:hidden" />
              <CrystalIcon size={20} className="hidden sm:block" />
              メッセージ一覧を見る
            </CrystalButton>
          </Link>
          <Link href="/garden" className="w-full max-w-[15rem] sm:max-w-xs">
            <CrystalButton variant="ghost" className="w-full text-sm sm:text-base">
              <CrystalIcon size={18} className="sm:hidden" />
              <CrystalIcon size={20} className="hidden sm:block" />
              ガーデンページへ
            </CrystalButton>
          </Link>
        </div>
      </div>
    </main>
  );
}
