"use client";

import { useEffect, useRef } from "react";

/**
 * 2026-07-06: TOP page mobile background, same fix as the Garden page got
 * earlier — instead of the portrait mobile crop (topsubmit-bg-mobile.jpg)
 * shown via cover (which crops most of the illustration off), reuse the
 * full landscape desktop image at natural aspect ratio inside a
 * horizontally scrollable container, so nothing is cropped; swipe left/
 * right to see the rest. Starts centered on mount. Desktop (768px+) is
 * unaffected — see the sibling `hidden md:block` bg-photo-layer div in
 * page.tsx, unchanged.
 */
export default function TopPageMobileScrollBackground() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  return (
    <div
      aria-hidden
      ref={scrollRef}
      className="md:hidden fixed inset-0 overflow-x-auto overflow-y-hidden"
      style={{ zIndex: -1, WebkitOverflowScrolling: "touch" }}
    >
      <img
        src="/images/topsubmit-bg-desktop.jpg"
        alt=""
        draggable={false}
        className="h-full w-auto max-w-none select-none"
      />
    </div>
  );
}
