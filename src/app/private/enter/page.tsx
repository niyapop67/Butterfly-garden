"use client";

import { useState, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import CrystalButton from "@/components/ui/CrystalButton";

/**
 * GATE 2 entry page — "MIKA Private Experience" passphrase prompt.
 * Mirrors src/app/enter/page.tsx (GATE 1) but posts to /api/private-gate
 * and is fully independent of the GATE 1 cookie. See
 * docs/spec-v2.9-diff-2026-06-26.md §2.
 *
 * No chapter-6 pages (auto-play / garden explore / name list) exist yet —
 * this page is prep so that once they're built, they can redirect here
 * the same way protected routes redirect to /enter for GATE 1.
 */
export default function PrivateEnterPage() {
  return (
    <Suspense fallback={null}>
      <PrivateEnterForm />
    </Suspense>
  );
}

function PrivateEnterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/private";

  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/private-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "合言葉が違います。");
        setIsSubmitting(false);
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-day-garden px-6">
      <GlassCard className="w-full max-w-sm p-8 text-center">
        <p className="text-2xl mb-2" aria-hidden>
          🦋
        </p>
        <h1 className="font-display-jp text-xl mb-2" style={{ color: "var(--color-ink)" }}>
          MIKAだけの特別な部屋
        </h1>
        <p className="font-body text-sm mb-6" style={{ color: "var(--color-ink-soft)" }}>
          ここから先は、合言葉を知っている人だけが
          <br />
          みんなのメッセージとボイスを見ることができます
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="合言葉"
            autoFocus
            className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-center font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-tiffany)]"
          />

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <CrystalButton type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "確認中..." : "開く"}
          </CrystalButton>
        </form>
      </GlassCard>
    </main>
  );
}
