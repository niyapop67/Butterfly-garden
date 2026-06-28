"use client";

import { useGardenFeed } from "@/lib/useGardenFeed";
import GlassCard from "@/components/ui/GlassCard";
import GardenStatsBar from "@/components/garden/GardenStatsBar";
import EvolutionMilestoneTracker from "@/components/garden/EvolutionMilestoneTracker";
import CentralButterflyEvolution from "@/components/top/CentralButterflyEvolution";

interface TopPageLiveContentProps {
  /** Computed server-side in src/app/page.tsx (date check + Niya preview
   * key) — see CentralButterflyEvolution for why this stays server-side. */
  forcedComplete: boolean;
}

/**
 * Live (Firestore-backed) section of the top page: the central evolving
 * crystal butterfly (§1.9–1.11), the Butterflies/Messages/Voices stat
 * cards, and the rose milestone badge row — all sharing a single
 * useGardenFeed() subscription rather than three separate listeners.
 */
export default function TopPageLiveContent({ forcedComplete }: TopPageLiveContentProps) {
  const { entries, loading } = useGardenFeed();
  const total = entries.length;
  const totalVoices = entries.filter((e) => e.hasVoice).length;

  return (
    <>
      <section className="relative z-10 mb-8 flex justify-center">
        <CentralButterflyEvolution totalButterflies={total} forcedComplete={forcedComplete} />
      </section>

      <section className="relative z-10 mb-6">
        <GlassCard className="px-5 py-6">
          <GardenStatsBar
            totalButterflies={total}
            totalMessages={total}
            totalVoices={loading ? 0 : totalVoices}
          />
        </GlassCard>
      </section>

      <section className="relative z-10 mb-8">
        <GlassCard className="px-5 py-6">
          <EvolutionMilestoneTracker totalButterflies={total} />
        </GlassCard>
      </section>
    </>
  );
}
