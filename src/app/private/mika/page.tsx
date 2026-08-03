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
 * desktop.
 *
 * 2026-08-04 follow-up: desktop now matches the Garden page's own
 * desktop background technique (see .bg-garden-page .bg-photo-layer in
 * globals.css) — the full illustration is always shown, letterboxed and
 * centered against the night background, instead of a cropped cover-fit
 * that could clip the composition. An aspect-ratio-locked wrapper sized to
 * the viewport height keeps the image's own box known exactly, so the
 * button percentages below stay accurate against the image itself rather
 * than the viewport.
 *
 * Button placement was measured against each crop's own title-text band
 * (checked the gold-pixel ratio row by row) so they sit in the open
 * pavement area below "for MIKA" with real margin, not just clearing it:
 *   - mobile:  title band ~24%-64% of image height -> buttons at top 78%
 *   - desktop: title band ~43%-64% of image height -> buttons at top 76%
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

      {/* ---- Desktop: landscape crop, shown in full like the Garden
          page's own desktop background (contain-fit, letterboxed/centered
          against the night background) rather than cropped cover-fit ---- */}
      <div className="relative hidden min-h-screen w-full items-center justify-center sm:flex">
        <div
          className="relative h-screen max-w-full"
          style={{ aspectRatio: "1536 / 1024", maxHeight: "100vh" }}
        >
          <Image
            src="/images/decor/mika_hero_desktop.jpg"
            alt="Butterfly Garden for MIKA"
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />
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
      </div>
    </main>
  );
}
