"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const MENU_LINKS = [
  { href: "/", label: "トップページ" },
  { href: "/garden", label: "ガーデンを見る" },
  { href: "/submit", label: "蝶を届ける" },
];
// Deliberately no /birthday link here — see chat decision 2026-06-27 ("リンクは
// 必要？" / "なくても大丈夫"): a persistent nav entry risks tipping MIKA off
// to the surprise months early. Direct-URL access only.

/**
 * Top page's hamburger button + dropdown menu. Previously the button in
 * src/app/page.tsx had no onClick at all (pure decoration) — this replaces
 * it with the same visual but actually wired up.
 */
export default function SiteMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/50 backdrop-blur-md shadow-glass-soft"
      >
        <span className="sr-only">メニュー</span>
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden>
          {open ? (
            <path d="M1 1L19 13M19 1L1 13" stroke="#a78bdb" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <path d="M0 1H20M0 7H20M0 13H20" stroke="#a78bdb" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-[52px] z-30 w-48 overflow-hidden rounded-2xl border border-white/60 bg-white/90 backdrop-blur-md"
          style={{ boxShadow: "var(--shadow-glass-soft)" }}
        >
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 font-body text-sm"
              style={{ color: "var(--color-ink)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
