import Link from "next/link";
import CrystalIcon from "@/components/ui/CrystalIcon";
import GardenFeed from "@/components/garden/GardenFeed";

/**
 * ③ Garden page (spec mockup §2.3 / docs/spec-v2.9-diff-2026-06-26.md §3).
 *
 * Shows live participation (butterfly count, growth milestones, type
 * breakdown) and lets visitors tap any butterfly to see its sender's
 * nickname — GATE 1 territory only. Message text and voice playback stay
 * behind GATE 2 (chapter-6 Private Experience, not yet built).
 *
 * Background: garden-bg.jpg (dedicated portrait illustration, see
 * .bg-garden-page in globals.css) rather than .bg-day-garden — the Garden
 * page gets its own fountain/colonnade artwork instead of the top/submit
 * pages' background.
 */
export default function GardenPage() {
  return (
    <main className="bg-garden-page relative min-h-screen overflow-hidden px-5 pb-12 pt-6">
      <header className="relative z-10 mb-6 flex items-center justify-between">
        <Link
          href="/"
          aria-label="トップページへ戻る"
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

        <h1 className="font-display-jp text-base" style={{ color: "var(--color-ink)" }}>
          ガーデン <span className="font-body text-[11px] tracking-wide opacity-70">/ GARDEN</span>
        </h1>

        <Link
          href="/submit"
          aria-label="蝶を届ける"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/50 backdrop-blur-md shadow-glass-soft"
        >
          <CrystalIcon size={18} />
        </Link>
      </header>

      <GardenFeed />
    </main>
  );
}
