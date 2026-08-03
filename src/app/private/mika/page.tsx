import Image from "next/image";
import Link from "next/link";
import CrystalButton from "@/components/ui/CrystalButton";
import CrystalIcon from "@/components/ui/CrystalIcon";

/**
 * MIKA's dedicated landing page.
 *
 * 2026-08-04: split into two dedicated hero crops instead of one shared
 * image — mika_hero_mobile.jpg (portrait, 864x1821) for phones,
 * mika_hero_desktop.jpg (landscape, 1536x1024, ex mika_hero.jpg) for
 * desktop, filling the full viewport there rather than sitting in a
 * capped/centered card like before.
 *
 * Button placement was measured against each crop's own title-text band
 * (checked the gold-pixel ratio row by row) so they sit in the open
 * pavement area below "for MIKA" with real margin, not just clearing it:
 *   - mobile:  title band ~24%-64% of image height -> buttons at top 78%
 *   - desktop: title band ~43%-64% of image height -> buttons at top 76%
 * On desktop the hero is a fixed cover background rather than a
 * fixed-aspect <img>, so "76%" is relative to the viewport, not the image —
 * accurate for typical wide/short browser windows, less so for unusually
 * tall narrow ones, which is the standard tradeoff for a full-bleed cover
 * hero.
 *
 * Book (PDF) and Voice are sent directly rather than linked from here, so
 * there's no download button for either — just navigation.
 */
export default function MikaLandingPage() {
  return (
    <main className="bg-night-garden relative min-h-screen overflow-hidden">
      {/* ---- Mobile: portrait crop, natural aspect ratio, no cropping ---- */}
      <div className="relative sm:hidden">
        <Image
          src="/images/decor/mika_hero_mobile.jpg"
          alt="Butterfly Garden for MIKA"
          width={864}
          height={1821}
          priority
          sizes="100vw"
          className="w-full h-auto"
        />
        <div className="absolute inset-x-0 top-[78%] z-10 flex flex-col items-center gap-3 px-6">
          <Link href="/private/list" className="w-full max-w-[15rem]">
            <CrystalButton className="w-full text-sm">
              <CrystalIcon size={18} />
              メッセージ一覧を見る
            </CrystalButton>
          </Link>
          <Link href="/garden" className="w-full max-w-[15rem]">
            <CrystalButton variant="ghost" className="w-full text-sm">
              <CrystalIcon size={18} />
              ガーデンページへ
            </CrystalButton>
          </Link>
        </div>
      </div>

      {/* ---- Desktop: landscape crop, fills the viewport ---- */}
      <div
        className="relative hidden min-h-screen w-full sm:block"
        style={{
          backgroundImage: "url(/images/decor/mika_hero_desktop.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-x-0 top-[76%] z-10 flex flex-col items-center gap-4">
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
