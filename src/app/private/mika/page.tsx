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
 * 2026-08-04 follow-up (real root cause of "PC doesn't fill the screen"):
 * every page on this site renders inside .mobile-frame (see
 * globals.css/layout.tsx), a centered column capped at
 * var(--frame-width) — 430px, or 640px above the site's 768px desktop
 * breakpoint. No amount of width/min-h-screen CSS on a normal element
 * escapes that; it just fills the (still-narrow) frame. The desktop hero
 * below instead uses `position: fixed; inset: 0` at the site's own
 * md:(768px) breakpoint — the exact technique .bg-photo-layer already uses
 * elsewhere (see the 2026-07-05 note above .bg-photo-layer's fixed-position
 * desktop rule in globals.css) to escape .mobile-frame and size against the
 * real browser viewport, with the buttons layered on top inside a
 * normal-flow, frame-width-capped container so they still line up with the
 * rest of the site's centered column.
 *
 * Button placement was measured against each crop's own title-text band
 * (checked the gold-pixel ratio row by row) so they sit in the open
 * pavement area below "for MIKA" with real margin, not just clearing it:
 *   - mobile:  title band ~24%-64% of image height -> buttons at top 78%
 *   - desktop: title band ~43%-64% of image height -> buttons at top 76%
 *   (desktop % is relative to the viewport, since the fixed background is
 *   cover-fit against it — accurate for typical wide/short windows.)
 *
 * Book (PDF) and Voice are sent directly rather than linked from here, so
 * there's no download button for either — just navigation.
 */
export default function MikaLandingPage() {
  return (
    <main className="bg-night-garden relative min-h-screen overflow-hidden">
      {/* ---- Mobile: portrait crop, natural aspect ratio, no cropping ---- */}
      <div className="relative md:hidden">
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

      {/* ---- Desktop: landscape crop, escapes .mobile-frame via
          position: fixed so it truly fills the browser viewport ---- */}
      <div
        aria-hidden
        className="fixed inset-0 hidden md:block"
        style={{
          zIndex: -1,
          backgroundImage: "url(/images/decor/mika_hero_desktop.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative hidden min-h-screen w-full md:block">
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
