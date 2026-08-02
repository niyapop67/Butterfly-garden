import Link from "next/link";
import CrystalButton from "@/components/ui/CrystalButton";
import CrystalIcon from "@/components/ui/CrystalIcon";
import TopPageButterflyDecor from "@/components/butterfly/TopPageButterflyDecor";
import TopPageCornerFlowers from "@/components/butterfly/TopPageCornerFlowers";

/**
 * MIKA's dedicated landing page (2026-07-24 request), rebuilt 2026-07-25
 * to match the structure of the public TOP page (src/app/page.tsx) rather
 * than a single flattened hero image: a real photo background (Moon
 * Garden crops — portrait for mobile, landscape for desktop, mirroring
 * TOP/SUBMIT's own mobile/desktop split), the same floating-butterfly and
 * corner-flower decor components, real HTML title text (not baked into an
 * image), a small header pill link (ガーデンを見る, same treatment as
 * TOP's), and one big CrystalButton CTA at the bottom (メッセージ一覧を見る,
 * playing the role TOP's 蝶を届ける button plays).
 *
 * Book (PDF) and Voice are sent directly rather than linked from here, so
 * there's no download button for either — just navigation.
 */
export default function MikaLandingPage() {
  return (
    <main className="bg-night-garden relative min-h-screen overflow-hidden px-5 pb-12 pt-6">
      <div
        aria-hidden
        className="fixed inset-0 -z-10 md:hidden"
        style={{
          backgroundImage: "url(/images/garden-bg-moon-garden.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden md:block"
        style={{
          backgroundImage: "url(/images/top-bg-moon-garden.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <TopPageCornerFlowers />
      <TopPageButterflyDecor />

      <header className="relative z-10 mb-10 flex items-center justify-end">
        <Link
          href="/garden"
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 font-body text-xs font-bold text-[#f0c869] backdrop-blur-md transition-all hover:bg-white/20"
          style={{ border: "1px solid rgba(232,193,112,0.35)" }}
        >
          ガーデンを見る <CrystalIcon size={16} />
        </Link>
      </header>

      <section className="relative z-10 mb-10 text-center">
        <div className="relative mx-auto max-w-xs pb-6 pt-4 md:max-w-md">
          <h1
            className="font-display text-5xl font-semibold italic leading-tight md:text-7xl"
            style={{ color: "#f0c869", textShadow: "0 2px 20px rgba(0,0,0,0.55), 0 1px 6px rgba(0,0,0,0.5)" }}
          >
            Butterfly Garden
          </h1>
          <p
            className="mt-1 font-display text-2xl italic md:text-4xl"
            style={{ color: "#ff9ec7", textShadow: "0 1px 14px rgba(0,0,0,0.55)" }}
          >
            for MIKA
          </p>
        </div>

        <p
          className="mx-auto mt-2 max-w-xs text-center font-display-jp text-base font-medium leading-relaxed md:max-w-md md:text-lg"
          style={{ color: "#e8e2f0", textShadow: "0 1px 10px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.5)" }}
        >
          みんなの想いが蝶になった
          <br />
          MIKAのための
          <br />
          特別なガーデンです
        </p>
      </section>

      <section className="relative z-10 mb-8 flex justify-center">
        <Link href="/private/list" className="w-full max-w-xs">
          <CrystalButton className="w-full">
            <CrystalIcon size={20} />
            メッセージ一覧を見る
          </CrystalButton>
        </Link>
      </section>
    </main>
  );
}
