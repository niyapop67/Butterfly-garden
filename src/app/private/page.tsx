import { redirect } from "next/navigation";

/**
 * GATE 2 landing route — default `next` destination from /private/enter
 * when no specific target was requested.
 *
 * 2026-07-07: the 3-mode hub menu (名前一覧リスト／おまかせ再生／
 * ガーデン探索) is removed per Niya's request — only 名前一覧リスト was
 * ever built, and the other two modes' detailed UI (v2.9 §6) was never
 * shared in this chat, so they stayed unbuilt placeholders. Rather than
 * show a menu with one real option, /private now redirects straight to
 * the name list so MIKA lands on usable content immediately. The
 * Happy Birthday / date branding that used to live in this hub's header
 * moved to the top of /private/list instead.
 */
export default function PrivateHubPage() {
  redirect("/private/list");
}
