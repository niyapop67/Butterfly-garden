"use client";

import { BUTTERFLY_TYPES, BUTTERFLY_THEMES, type ButterflyType } from "@/types/submission";

interface ButterflyTypeFilterProps {
  value: ButterflyType | "all";
  onChange: (value: ButterflyType | "all") => void;
  /** Live count per type, used as a small number badge on each chip. */
  countsByType: Record<ButterflyType, number>;
  totalCount: number;
}

/**
 * Garden page filter chips (mockup §2.3: "蝶がフィルタタブで分類表示できる
 * （すべての蝶／種類別）"). Horizontally scrollable row so all 8 chips
 * (すべて + 7 types) fit on a 390px-wide screen without wrapping.
 */
export default function ButterflyTypeFilter({
  value,
  onChange,
  countsByType,
  totalCount,
}: ButterflyTypeFilterProps) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <div className="flex w-max gap-2 pb-1">
        <FilterChip label="すべて" count={totalCount} isSelected={value === "all"} onClick={() => onChange("all")} />
        {BUTTERFLY_TYPES.map((type) => (
          <FilterChip
            key={type}
            label={BUTTERFLY_THEMES[type].labelJa}
            count={countsByType[type] ?? 0}
            isSelected={value === type}
            onClick={() => onChange(type)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  isSelected,
  onClick,
}: {
  label: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 font-body text-xs transition-colors ${
        isSelected ? "border-[var(--color-tiffany)] bg-white/80" : "border-white/50 bg-white/35"
      }`}
      style={{
        color: isSelected ? "var(--color-ink)" : "var(--color-ink-soft)",
        boxShadow: isSelected ? "var(--shadow-glow-tiffany)" : "var(--shadow-glass-soft)",
      }}
    >
      {label}
      <span
        className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
        style={{
          background: isSelected ? "var(--color-tiffany)" : "rgba(255,255,255,0.6)",
          color: isSelected ? "#fff" : "var(--color-ink-soft)",
        }}
      >
        {count}
      </span>
    </button>
  );
}
