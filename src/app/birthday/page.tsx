"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BirthdayCountdown from "@/components/birthday/BirthdayCountdown";
import BirthdayReveal from "@/components/birthday/BirthdayReveal";

/**
 * MIKA's birthday — the whole point of this project. Hardcoded JST date;
 * update here if the target date ever changes. Using a fixed ISO string
 * with an explicit +09:00 offset rather than relying on the visitor's
 * local timezone, so the reveal flips at the same real-world moment for
 * everyone regardless of where they're browsing from.
 */
const REVEAL_DATE = new Date("2026-08-23T00:00:00+09:00");

/**
 * ④ Birthday page (spec mockup §2.4).
 *
 * Deliberately gated by date, not just by GATE 1/GATE 2: this is the
 * surprise reveal moment, so the page shows a countdown teaser for every
 * visit before REVEAL_DATE and only swaps to the full "Happy Birthday"
 * treatment once that date has passed — otherwise anyone with the GATE 1
 * passphrase could see the surprise months early. The date check runs
 * client-side (Date.now() at render time) rather than at build time, since
 * this route is otherwise statically generated.
 */
export default function BirthdayPage() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const isRevealed = now !== null && now.getTime() >= REVEAL_DATE.getTime();
  const daysRemaining =
    now !== null
      ? Math.max(0, Math.ceil((REVEAL_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

  return (
    <main
      className={`relative min-h-screen overflow-hidden px-5 pb-12 pt-6 ${
        isRevealed ? "bg-night-garden" : "bg-day-garden"
      }`}
    >
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
        <h1
          className="font-display-jp text-base"
          style={{ color: isRevealed ? "#fffdf8" : "var(--color-ink)" }}
        >
          誕生日当日 <span className="font-body text-[11px] tracking-wide opacity-70">/ BIRTHDAY</span>
        </h1>
      </header>

      {/* now === null on the very first client render, before useEffect runs
          (and during the brief static-shell paint) — render nothing in that
          split second rather than flashing the countdown then immediately
          swapping, on the off chance someone opens this exactly at the
          reveal moment. */}
      {now !== null && (isRevealed ? <BirthdayReveal /> : <BirthdayCountdown daysRemaining={daysRemaining ?? 0} />)}
    </main>
  );
}
