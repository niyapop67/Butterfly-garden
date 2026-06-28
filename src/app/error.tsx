"use client";

import { useEffect } from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";

/**
 * Route-level error boundary. Without this, an unhandled error anywhere
 * under a page (e.g. Firebase failing to initialize because an env var is
 * missing) falls through to Next.js's default error overlay — plain and
 * jarring against this site's theme, same reasoning as not-found.tsx.
 *
 * Next.js requires this file to be a Client Component.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="bg-day-garden relative flex min-h-screen items-center justify-center px-6">
      <GlassCard className="w-full max-w-sm p-8 text-center">
        <p className="mb-2 text-2xl" aria-hidden>
          🦋
        </p>
        <h1 className="font-display-jp text-lg mb-2" style={{ color: "var(--color-ink)" }}>
          少しだけ、つまずいてしまいました
        </h1>
        <p className="mb-6 font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
          時間をおいてもう一度お試しいただくか、トップページからやり直してください。
        </p>
        <div className="flex flex-col gap-3">
          <CrystalButton className="w-full" onClick={reset}>
            もう一度試す
          </CrystalButton>
          <Link href="/" className="font-body text-xs underline" style={{ color: "var(--color-ink-soft)" }}>
            トップページへ戻る
          </Link>
        </div>
      </GlassCard>
    </main>
  );
}
