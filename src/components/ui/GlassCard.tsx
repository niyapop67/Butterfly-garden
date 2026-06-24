import { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "", ...rest }: GlassCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/70 bg-white/45 backdrop-blur-xl ${className}`}
      style={{ boxShadow: "var(--shadow-glass-soft)" }}
      {...rest}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[3px] rounded-[26px] border"
        style={{ borderColor: "rgba(232,193,112,0.35)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
