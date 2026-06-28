import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";

/**
 * Placeholder for the MIKA-only birthday movie (digest of participants'
 * messages + voices, per the 2026-06-27 chat decision). Automatically
 * protected by GATE 2 via src/middleware.ts (matches /private/** ).
 *
 * The actual video file/player doesn't exist yet — this is structural prep
 * so /birthday's "バースデームービーを見る" button has a real, working
 * destination instead of a dead link. Swap the body of this page for an
 * actual <video>/player once the digest is produced; the route, gating,
 * and link from BirthdayReveal.tsx don't need to change.
 */
export default function PrivateMoviePage() {
  return (
    <main className="bg-night-garden relative min-h-screen overflow-hidden px-5 pb-12 pt-6">
      <header className="relative z-10 mb-8 flex items-center gap-3">
        <Link
          href="/birthday"
          aria-label="誕生日ページへ戻る"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/50 backdrop-blur-md shadow-glass-soft"
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden>
            <path
              d="M9 1L1 8L9 15"
              stroke="#a78bdb"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="font-display-jp text-base" style={{ color: "#fffdf8" }}>
          バースデームービー
        </h1>
      </header>

      <section className="relative z-10 mt-10 flex justify-center">
        <GlassCard className="w-full max-w-sm px-6 py-10 text-center">
          <p className="mb-2 text-2xl" aria-hidden>
            🎬
          </p>
          <p className="font-display-jp text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
            ムービーは準備中です
          </p>
          <p className="mt-2 font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            みんなのメッセージとボイスを編集したダイジェストムービーが、ここに届きます。
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
