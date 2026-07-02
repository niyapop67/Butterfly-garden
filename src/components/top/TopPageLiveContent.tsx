"use client";

import { useGardenFeed } from "@/lib/useGardenFeed";
import CentralButterflyEvolution from "@/components/top/CentralButterflyEvolution";

interface TopPageLiveContentProps {
  forcedComplete: boolean;
}

export default function TopPageLiveContent({ forcedComplete }: TopPageLiveContentProps) {
  const { entries } = useGardenFeed();
  const total = entries.length;

  return (
    <section className="relative z-10 mb-8 flex justify-center">
      <CentralButterflyEvolution totalButterflies={total} forcedComplete={forcedComplete} />
    </section>
  );
}
