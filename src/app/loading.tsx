/**
 * Route-level loading fallback, shown briefly during navigation before a
 * page's own client component mounts. Most pages already show their own
 * "読み込み中…" state once mounted (e.g. while Firestore data loads) — this
 * just covers the moment before that, so navigation never flashes a blank
 * white screen.
 */
export default function Loading() {
  return (
    <main className="bg-day-garden relative flex min-h-screen items-center justify-center">
      <div className="animate-gentle-float text-3xl" aria-hidden>
        🦋
      </div>
      <span className="sr-only">読み込み中…</span>
    </main>
  );
}
