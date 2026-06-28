import Link from "next/link";
import CrystalIcon from "@/components/ui/CrystalIcon";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";
import SiteMenu from "@/components/ui/SiteMenu";
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
      {/* Layer 2 (texture) + Layer 3 (corner flowers) + butterfly decor all sit
          above the Layer 1 gradient but behind the real content (z-10). */}
      <TopPageCornerFlowers />
      <TopPageButterflyDecor />

      <header className="relative z-10 mb-10 flex items-center justify-between">
        <SiteMenu />

        <Link
          href="/garden"
          className="flex items-center gap-1.5 rounded-full bg-white/60 px-4 py-2 font-body text-xs font-bold text-[#5cb8af] shadow-glass-soft backdrop-blur-md"
        >
          ガーデンを見る <CrystalIcon size={16} />
        </Link>
      </header>

      <section className="relative z-10 mb-10 text-center">
        <div className="relative mx-auto max-w-xs pb-6 pt-4">
          <h1
            className="font-display text-5xl italic leading-tight glow-text-gold"
            style={{ color: "#5a4f6e" }}
          >
            Butterfly Garden
          </h1>
          <p className="mt-1 font-display text-2xl italic" style={{ color: "#ff6fa8" }}>
            for MIKA
          </p>
        </div>

        <p className="mx-auto mt-2 max-w-xs font-display-jp text-sm leading-relaxed text-[#6b6378]">
          みんなの想いが蝶になって、
          <br />
          MIKAのための特別なガーデンをつくります。
        </p>

        <div className="divider-ornament mt-5">
          <CrystalIcon size={14} />
        </div>
      </section>

      <TopPageLiveContent forcedComplete={forcedComplete} />

      <section className="relative z-10 mb-8 flex justify-center">
        <Link href="/submit" className="w-full max-w-xs">
          <CrystalButton className="w-full">
            <CrystalIcon size={20} />
            蝶を届ける
            <span className="block text-[11px] font-normal opacity-90">メッセージを送る</span>
          </CrystalButton>
        </Link>
      </section>

      <section className="relative z-10">
        <GlassCard className="frame-ornament px-6 py-6 text-center">
          <p className="mb-2 font-display-jp text-sm font-semibold text-[#5a4f6e]">このプロジェクトについて</p>
          <p className="font-body text-xs leading-relaxed text-[#6b6378]">
            ファンの皆さんのメッセージやボイスが蝶になり、MIKAだけの特別なガーデンに集まります。
            誕生日当日、蝶たちはひとつになり、最高のサプライズをお届けします。
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
