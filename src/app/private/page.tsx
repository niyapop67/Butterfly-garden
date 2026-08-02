import { redirect } from "next/navigation";

/**
 * GATE 2 landing route — default `next` destination from /private/enter
 * when no specific target was requested.
 *
 * 2026-07-07: the 3-mode hub menu (名前一覧リスト／おまかせ再生／
 * ガーデン探索) is removed per Niya's request — only 名前一覧リスト was
 * ever built, and the other two modes' detailed UI (v2.9 §6) was never
 * shared in this chat, so they stayed unbuilt placeholders.
 *
 * 2026-07-24: now redirects to /private/mika (hero banner + buttons to
 * the name list and the public garden page) instead of straight to
 * /private/list — that page is the intended first thing MIKA sees.
 */
export default function PrivateHubPage() {
  redirect("/private/mika");
}
