import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";
import NightSkySparkles from "@/components/birthday/NightSkySparkles";
import BirthdayGemDecor from "@/components/birthday/BirthdayGemDecor";
import GiantCrystalButterfly from "@/components/birthday/GiantCrystalButterfly";

/**
 * Revealed state of the Birthday page (spec mockup §2.4). Shown once
 * REVEAL_DATE has passed (see src/app/birthday/page.tsx).
 *
 * "みんなの声を聴く" was dropped as a separate CTA (chat decision
 * 2026-06-27): the birthday movie is a digest that already weaves in
 * everyone's messages and voices, so a standalone "listen to raw voices"
 * button would just duplicate it. Only two CTAs remain, and both are
 * MIKA-only (本人専用) — they link into GATE 2 (/private/**), not the
 * GATE-1-only public celebration above them. The page itself (this
 * component) stays GATE 1 only, so every fan can see the "Happy Birthday"
 * moment; only MIKA can actually open the movie or download.
 */
export default function BirthdayReveal() {
  return (
    <>
      <NightSkySparkles />
      <BirthdayGemDecor />

      <section className="relative z-10 mb-8 flex flex-col items-center text-center">
        <GiantCrystalButterfly />

        <h1 className="glow-text-gold mt-6 font-display text-4xl italic text-white">
          Happy Birthday
        </h1>
        <p className="mt-1 font-display text-3xl italic" style={{ color: "#ffb6d9" }}>
          MIKA
        </p>

        <p className="mx-auto mt-5 max-w-xs font-body text-xs leading-relaxed" style={{ color: "#e3d9f0" }}>
          みんなの想いが、ひとつのクリスタルになりました。
          <br />
          ここから先は、MIKAだけの特別な時間です。
        </p>
      </section>

      <section className="relative z-10 flex flex-col items-center gap-3">
        <Link href="/private/movie" className="w-full max-w-xs">
          <CrystalButton className="w-full">バースデームービーを見る</CrystalButton>
        </Link>
        <Link href="/private/download" className="w-full max-w-xs">
          <CrystalButton className="w-full" variant="ghost">
            ダウンロードする
          </CrystalButton>
        </Link>
        <p className="mt-1 font-body text-[11px]" style={{ color: "#b3a6c9" }}>
          ＊ この2つはMIKA専用の合言葉が必要です
        </p>
      </section>

      <section className="relative z-10 mt-10">
        <GlassCard className="px-5 py-5 text-center">
          <p className="font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            ファンのみんなが届けてくれた蝶たちは、これからもガーデンに咲き続けます。
          </p>
        </GlassCard>
      </section>
    </>
  );
}
