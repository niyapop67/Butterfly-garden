import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";
import CrystalIcon from "@/components/ui/CrystalIcon";

/**
 * Custom 404 — without this, Next.js falls back to its generic black-and-
 * white default page, which clashes badly with this site's pink/crystal
 * aesthetic. A mistyped or stale link should still feel like part of the
 * same gift, not a broken website.
 */
export default function NotFound() {
  return (
    <main className="bg-day-garden relative flex min-h-screen items-center justify-center px-6">
      <GlassCard className="w-full max-w-sm p-8 text-center">
        <p className="mb-2 text-2xl" aria-hidden>
          🦋
        </p>
        <h1 className="font-display-jp text-lg mb-2" style={{ color: "var(--color-ink)" }}>
          ページが見つかりませんでした
        </h1>
        <p className="mb-6 font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
          蝶がどこかへ迷い込んでしまったようです。
          <br />
          トップページから、もう一度お探しください。
        </p>
        <Link href="/">
          <CrystalButton className="w-full">
            <CrystalIcon size={18} />
            トップページへ戻る
          </CrystalButton>
        </Link>
      </GlassCard>
    </main>
  );
}
