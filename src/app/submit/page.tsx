import Link from "next/link";
import SubmitFlow from "@/components/forms/SubmitFlow";
import { getTimeOfDay, TIME_CONFIGS } from "@/lib/timeOfDayConfig";
import { GARDEN_BG_IMAGES } from "@/lib/timeBackgrounds";

/**
 * ② Message submission page (spec v2.9 §2.2). Background/header follow the
 * same Day Garden treatment as the top page (src/app/page.tsx) per spec
 * §4.1 — this page reuses the bg-day-garden utility class rather than
 * inventing a new background.
 */
export default function SubmitPage() {
  const time = TIME_CONFIGS[getTimeOfDay()];

  return (
    <main className="bg-day-garden relative min-h-screen overflow-hidden px-5 pb-12 pt-6">
      <div aria-hidden className="bg-photo-layer" style={{ backgroundImage: `url(${GARDEN_BG_IMAGES[time.id]})` }} />

      <header className="relative z-10 mb-8 flex items-center gap-3">
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
          蝶を届ける <span className="font-body text-[11px] tracking-wide opacity-70">/ SEND YOUR MESSAGE</span>
        </h1>
      </header>

      <SubmitFlow />
    </main>
  );
}
