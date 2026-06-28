import { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  /** Subtle damask pattern texture behind the glass sheen (asset drop
   * 2026-06-28, spec's "⑫バックグラウンドパターン"). On by default since
   * it's very low-opacity and matches the spec's "10〜15%" guidance — pass
   * texture={false} for any card where it should be perfectly flat. */
  texture?: boolean;
}

export default function GlassCard({ children, className = "", texture = true, ...rest }: GlassCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/60 bg-white/25 backdrop-blur-md ${className}`}
      style={{ boxShadow: "var(--shadow-glass-soft)" }}
      {...rest}
    >
      {texture && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "url(/images/decor/damask_pattern_pink.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12,
            mixBlendMode: "multiply",
          }}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 35%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,158,199,0.25), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[3px] rounded-[26px] border"
        style={{ borderColor: "rgba(232,193,112,0.4)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
