import Image from "next/image";
import Link from "next/link";
import CrystalButton from "@/components/ui/CrystalButton";
import CrystalIcon from "@/components/ui/CrystalIcon";

/**
 * MIKA's dedicated landing page. 2026-07-25: back to the single flattened
 * hero image (public/images/decor/mika_hero.jpg — "Butterfly Garden for
 * MIKA" artwork with the title baked in) after the TOP-page-style rebuild
 * (live background + real HTML title) didn't land well. Buttons are
 * overlaid on the image again, but deliberately placed in the open stone
 * pavement area (measured: the gold "Butterfly Garden" / "for MIKA" title
 * block only occupies roughly the 43%-64% band of the image height, so
 * anything below ~72% is guaranteed clear of the text — buttons sit at
 * roughly 78%/90% from the top, well clear of both the title and the
 * fountain graphic above it).
 *
 * The image keeps its natural aspect ratio at every width (no cropping),
 * so those percentages stay accurate on any screen — full-bleed on
 * mobile, capped/centered as a card on wider screens so it doesn't stretch
 * edge-to-edge.
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

        <div className="absolute inset-x-0 top-[76%] z-10 flex flex-col items-center gap-3 px-6 sm:gap-4">
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
