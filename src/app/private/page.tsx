import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";

/**
 * GATE 2 landing page — default `next` destination from /private/enter
 * when no specific target was requested (e.g. someone bookmarks
 * /private/enter directly rather than arriving via a specific link).
 *
 * Menu for 6章「MIKAプライベート体験」's three modes. Only 名前一覧リスト
 * is built (see spec-v2.9-diff-2026-06-28.md §4 for why the other two are
 * left as placeholders rather than guessed at — their detailed UI lives in
 * v2.9 §6, which hasn't been shared in this chat).
 */
export default function PrivateHubPage() {
  return (
    <main className="bg-night-garden relative min-h-screen overflow-hidden px-5 pb-12 pt-6">
      <header className="relative z-10 mb-8 text-center">
        <p className="mb-2 text-2xl" aria-hidden>
          🦋
        </p>
        <h1 className="font-display-jp text-lg" style={{ color: "#fffdf8" }}>
          MIKAプライベート体験
        </h1>
        <p className="mt-2 font-body text-xs" style={{ color: "#cbb9e0" }}>
          ここからは、MIKAだけが見られる場所です。
        </p>
      </header>

      <section className="relative z-10 flex flex-col gap-4">
        <ModeCard
          href="/private/list"
          title="名前一覧リスト"
          description="参加してくれたみんなの名前とメッセージを、一覧で見る"
          enabled
        />
        <ModeCard
          href="/private/slideshow"
          title="おまかせ再生"
          description="みんなの想いを、古い順にスライドショーで自動再生する"
          enabled
        />
        <ModeCard
          href="/private/explore"
          title="ガーデン探索"
          description="ガーデンの中を歩くように、蝶をひとつずつタップして見ていく"
          enabled
        />
      </section>
    </main>
  );
}

function ModeCard({
  href,
  title,
  description,
  enabled,
}: {
  href: string;
  title: string;
  description: string;
  enabled: boolean;
}) {
  const content = (
    <GlassCard className={`px-5 py-5 ${enabled ? "" : "opacity-60"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display-jp text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
            {title}
          </p>
          <p className="mt-1 font-body text-xs leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            {description}
          </p>
        </div>
        {!enabled && (
          <span
            className="flex-shrink-0 rounded-full px-2.5 py-1 font-body text-[10px]"
            style={{ background: "rgba(255,255,255,0.5)", color: "var(--color-ink-soft)" }}
          >
            近日公開
          </span>
        )}
      </div>
    </GlassCard>
  );

  if (!enabled) {
    return <div aria-disabled>{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}
