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
 * to the existing name list and the public garden page. Below the image,
 * the page still uses the existing .bg-night-garden CSS background rather
 * than stretching the busy night-sky photo further down — Niya flagged
 * that would hurt legibility if this page grows more content later.
 *
 * Book (PDF) and Voice are sent directly rather than linked from here, so
 * there's no download button for either — just navigation.
 */
export default function MikaLandingPage() {
  return (
    <main className="bg-night-garden relative min-h-screen overflow-hidden">
      <div className="relative w-full">
        <Image
          src="/images/decor/mika_hero.jpg"
          alt="Butterfly Garden for MIKA"
          width={1536}
          height={1024}
          priority
          className="w-full h-auto"
        />

        <div className="absolute inset-x-0 bottom-[6%] z-10 flex flex-col items-center gap-3 px-6 sm:bottom-[9%]">
          <Link href="/private/list" className="w-full max-w-xs">
            <CrystalButton className="w-full">
              <CrystalIcon size={20} />
              メッセージ一覧を見る
            </CrystalButton>
          </Link>
          <Link href="/garden" className="w-full max-w-xs">
            <CrystalButton variant="ghost" className="w-full">
              <CrystalIcon size={20} />
              ガーデンページへ
            </CrystalButton>
          </Link>
        </div>
      </div>
    </main>
  );
}
