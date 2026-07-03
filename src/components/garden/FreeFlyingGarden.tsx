"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useAnimationControls } from "framer-motion";
import Image from "next/image";
import { getButterflyAsset } from "@/lib/butterflyAssets";
import type { ButterflyType } from "@/types/submission";
import type { GardenEntry } from "@/lib/useGardenFeed";

/** A single butterfly that flies freely across the screen */
function FreeButterfly({
  type,
  seed,
  nickname,
  hasVoice,
  onTap,
  isRevealed,
}: {
  type: ButterflyType;
  seed: number;
  nickname?: string;
  hasVoice?: boolean;
  onTap?: () => void;
  isRevealed?: boolean;
}) {
  const asset = getButterflyAsset(type, "small");
  const controls = useAnimationControls();
  const mountedRef = useRef(true);

  // Derive stable random values from seed
  const r = (offset = 0) => {
    let h = (seed + offset * 7919) & 0xffffffff;
    h = ((h >> 16) ^ h) * 0x45d9f3b;
    h = ((h >> 16) ^ h) * 0x45d9f3b;
    h = (h >> 16) ^ h;
    return Math.abs(h % 1000) / 1000;
  };

  const size = 36 + r(1) * 28; // 36–64px
  const flipX = r(2) > 0.5;
  const baseDelay = r(3) * 4; // stagger launch

  // Flower stop positions (where butterfly might pause)
  const flowerSpots = useMemo(() => [
    { x: 8 + r(10) * 20, y: 30 + r(11) * 30 },
    { x: 65 + r(12) * 25, y: 20 + r(13) * 40 },
    { x: 20 + r(14) * 30, y: 60 + r(15) * 30 },
    { x: 60 + r(16) * 30, y: 55 + r(17) * 35 },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [seed]);

  useEffect(() => {
    mountedRef.current = true;

    async function fly() {
      if (!mountedRef.current) return;

      // Start from a random screen edge
      const edge = Math.floor(r(20) * 4); // 0=top, 1=right, 2=bottom, 3=left
      let startX: string, startY: string;
      if (edge === 0) { startX = `${20 + r(21) * 60}vw`; startY = "-8vh"; }
      else if (edge === 1) { startX = "108vw"; startY = `${10 + r(22) * 80}vh`; }
      else if (edge === 2) { startX = `${20 + r(23) * 60}vw`; startY = "108vh"; }
      else { startX = "-8vw"; startY = `${10 + r(24) * 80}vh`; }

      await controls.set({ x: startX, y: startY, opacity: 0 });

      // Build a path: fly in → maybe rest → fly out
      const numWaypoints = 2 + Math.floor(r(25) * 3); // 2–4 waypoints
      const shouldRest = r(26) > 0.45;
      const restSpot = flowerSpots[Math.floor(r(27) * flowerSpots.length)];
      const restDuration = 2 + r(28) * 4; // 2–6s rest
      const flightSpeed = 8 + r(29) * 10; // 8–18s to cross

      // Fade in and fly to first point
      const firstX = `${15 + r(30) * 70}vw`;
      const firstY = `${15 + r(31) * 70}vh`;

      await controls.start({
        x: firstX,
        y: firstY,
        opacity: 0.85,
        transition: { duration: flightSpeed * 0.4, ease: "easeInOut" },
      });
      if (!mountedRef.current) return;

      // Intermediate waypoints
      for (let i = 0; i < numWaypoints - 1; i++) {
        if (!mountedRef.current) return;
        await controls.start({
          x: `${10 + r(40 + i) * 80}vw`,
          y: `${10 + r(50 + i) * 80}vh`,
          transition: { duration: flightSpeed * 0.3, ease: "easeInOut" },
        });
      }

      // Maybe rest on a flower
      if (shouldRest && mountedRef.current) {
        await controls.start({
          x: `${restSpot.x}vw`,
          y: `${restSpot.y}vh`,
          transition: { duration: 2, ease: "easeOut" },
        });
        if (mountedRef.current) {
          await controls.start({
            rotate: [0, 8, 0, -8, 0],
            transition: { duration: restDuration, ease: "easeInOut" },
          });
        }
      }

      // Exit off screen
      if (!mountedRef.current) return;
      const exitEdge = Math.floor(r(60) * 4);
      let exitX: string, exitY: string;
      if (exitEdge === 0) { exitX = `${20 + r(61) * 60}vw`; exitY = "-10vh"; }
      else if (exitEdge === 1) { exitX = "110vw"; exitY = `${10 + r(62) * 80}vh`; }
      else if (exitEdge === 2) { exitX = `${20 + r(63) * 60}vw`; exitY = "110vh"; }
      else { exitX = "-10vw"; exitY = `${10 + r(64) * 80}vh`; }

      await controls.start({
        x: exitX,
        y: exitY,
        opacity: 0,
        transition: { duration: flightSpeed * 0.4, ease: "easeIn" },
      });

      // Brief pause before next circuit
      if (mountedRef.current) {
        setTimeout(fly, 1000 + r(70) * 3000);
      }
    }

    const timer = setTimeout(fly, baseDelay * 1000);
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      animate={controls}
      className="fixed z-20 cursor-pointer select-none"
      style={{ willChange: "transform" }}
      onClick={onTap}
      whileTap={{ scale: 1.2 }}
    >
      <motion.div
        animate={{ scaleY: [1, 0.85, 1], scaleX: [1, 1.08, 1] }}
        transition={{ duration: 0.6 + r(80) * 0.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transform: flipX ? "scaleX(-1)" : undefined }}
      >
        <Image
          src={asset.src}
          alt={nickname ?? "蝶"}
          width={asset.width}
          height={asset.height}
          style={{ width: size, height: "auto", filter: "drop-shadow(0 2px 6px rgba(255,158,199,0.5))" }}
          priority={false}
          unoptimized
        />
      </motion.div>

      {/* Nickname tooltip on tap */}
      {isRevealed && nickname && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.85 }}
          animate={{ opacity: 1, y: -size - 8, scale: 1 }}
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] shadow-md backdrop-blur-sm"
          style={{ color: "var(--color-ink)", bottom: "100%" }}
        >
          {nickname}
          {hasVoice && " 🎙️"}
        </motion.div>
      )}
    </motion.div>
  );
}

interface FreeFlyingGardenProps {
  entries: GardenEntry[];
  /** Max butterflies on screen at once — once real submissions pass this,
   *  only the most recent N fly (older ones still count toward the totals
   *  shown elsewhere, they just don't all render at once so the background
   *  illustration stays visible instead of getting crowded out). */
  maxOnScreen?: number;
}

export default function FreeFlyingGarden({ entries, maxOnScreen = 30 }: FreeFlyingGardenProps) {
  const [revealedId, setRevealedId] = useState<string | null>(null);

  // One butterfly per real submission, capped at maxOnScreen — no ambient
  // filler butterflies. Below the cap, the number flying always matches the
  // actual message count (2026-07-03: previously topped up to a fixed 18
  // with fake "ambient" butterflies regardless of real count, which made a
  // single submission look like ~18).
  const butterflies = useMemo(() => {
    return entries.slice(0, maxOnScreen).map((e, i) => ({
      id: e.id,
      type: e.butterflyType,
      seed: i * 1000 + e.id.charCodeAt(0) * 17,
      nickname: e.nickname,
      hasVoice: e.hasVoice,
      isReal: true,
    }));
  }, [entries, maxOnScreen]);

  return (
    <>
      {butterflies.map((b: typeof butterflies[number]) => (
        <FreeButterfly
          key={b.id}
          type={b.type as ButterflyType}
          seed={b.seed}
          nickname={b.nickname}
          hasVoice={b.hasVoice}
          onTap={b.isReal ? () => setRevealedId((rev: string | null) => rev === b.id ? null : b.id) : undefined}
          isRevealed={revealedId === b.id}
        />
      ))}
    </>
  );
}
