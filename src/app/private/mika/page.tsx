import Image from "next/image";
import Link from "next/link";
import CrystalButton from "@/components/ui/CrystalButton";
import CrystalIcon from "@/components/ui/CrystalIcon";

/**
 * MIKA's dedicated landing page (2026-07-24 request) — separate from
 * /private/list (the name-list itself). This page is just a hero banner
 * (the "Butterfly Garden for MIKA" artwork) with a couple of buttons
 * underneath, linking out to the existing name list and the public garden
 * page. It deliberately does NOT use the hero photo as a background behind
 * the buttons/content below it — Niya flagged that a busy night-sky photo
 * behind scrolling content (the list in particular) would hurt legibility,
 * so the photo stays a top banner and everything below it sits on the
 * existing .bg-night-garden CSS background instead.
 *
 * Book (PDF) and Voice are sent directly rather than linked from here, so
 * there's no download button for either — just navigation.
 */
export default function MikaLandingPage() {
  return (
    <main className="bg-night-garden relative min-h-screen overflow-hidden pb-16">
      <div className="relative w-full">
        <Image
          src="/images/decor/mika_hero.jpg"
          alt="Butterfly Garden for MIKA"
          width={1536}
          height={1024}
          priority
          className="w-full h-auto"
        />
      </div>

      <section className="relative z-10 mt-8 flex flex-col items-center gap-4 px-6">
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
      </section>
    </main>
  );
}
