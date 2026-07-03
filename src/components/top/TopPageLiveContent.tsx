"use client";

import { useGardenFeed } from "@/lib/useGardenFeed";
import GardenStatsBar from "@/components/garden/GardenStatsBar";
import EvolutionMilestoneTracker from "@/components/garden/EvolutionMilestoneTracker";
import GlassCard from "@/components/ui/GlassCard";

interface TopPageLiveContentProps {
  forcedComplete: boolean;
}

export default function TopPageLiveContent({ forcedComplete }: TopPageLiveContentProps) {
  const { entries } = useGardenFeed();
  const total = entries.length;
  const totalVoices = entries.filter((e) => e.hasVoice).length;

  return (
    <section className="relative z-10 mb-8">
      <GlassCard className="px-4 py-5">
        <GardenStatsBar totalButterflies={total} totalMessages={total} totalVoices={totalVoices} />
        <div className="my-4 h-px bg-white/50" aria-hidden />
        <EvolutionMilestoneTracker totalButterflies={total} forcedComplete={forcedComplete} />
      </GlassCard>
    </section>
  );
}
