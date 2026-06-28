import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";
import CrystalIcon from "@/components/ui/CrystalIcon";
import { useGardenFeed } from "@/lib/useGardenFeed";

interface BirthdayCountdownProps {
  daysRemaining: number;
}

/**
 * Pre-reveal state of the Birthday page. Shown for every visit before the
 * reveal date (see REVEAL_DATE in src/app/birthday/page.tsx) so the actual
 * "Happy Birthday MIKA" surprise (BirthdayReveal.tsx) never leaks early —
 * the whole point of a birthday surprise is that it isn't visible on day
 * minus 50. Doubles as a teaser that drives traffic back to /garden and
 * /submit while people wait.
 */
export default function BirthdayCountdown({ daysRemaining }: BirthdayCountdownProps) {
  const { entries, loading } = useGardenFeed();

  return (
    <>
      <section className="relative z-10 mb-8 text-center">
        <p className="mb-3 text-3xl" aria-hidden>
          🦋
        </p>
        <h1 className="font-display-jp text-lg font-semibold" style={{ color: "var(--color-ink)" }}>
          MIKAの誕生日まで
        </h1>
        <p className="mt-3 font-display text-6xl italic" style={{ color: "#ff6fa8" }}>
          {daysRemaining}
        </p>
        <p className="font-body text-sm" style={{ color: "var(--color-ink-soft)" }}>
          日
        </p>
        <p className="mx-auto mt-4 max-w-xs font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
          8月23日、みんなの想いが結晶になって
          <br />
          特別なサプライズが届きます。
        </p>
      </section>

      <section className="relative z-10 mb-8">
        <GlassCard className="px-5 py-6 text-center">
          <p className="mb-1 font-body text-xs tracking-wider" style={{ color: "var(--color-ink-soft)" }}>
            ── 現在のガーデン ──
          </p>
          <p className="font-display-jp text-sm" style={{ color: "var(--color-ink)" }}>
            {loading ? (
              "読み込み中…"
            ) : (
              <>
                <span className="text-2xl font-semibold" style={{ color: "#ff6fa8" }}>
                  {entries.length}
                </span>
                匹の蝶が集まっています
              </>
            )}
          </p>
        </GlassCard>
      </section>

      <section className="relative z-10 flex flex-col items-center gap-3">
        <Link href="/garden" className="w-full max-w-xs">
          <CrystalButton className="w-full" variant="ghost">
            <CrystalIcon size={18} />
            ガーデンを見る
          </CrystalButton>
        </Link>
        <Link href="/submit" className="w-full max-w-xs">
          <CrystalButton className="w-full">
            <CrystalIcon size={18} />
            蝶を届ける
          </CrystalButton>
        </Link>
      </section>
    </>
  );
}
