import { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "", ...rest }: GlassCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/60
        bg-white/40 backdrop-blur-xl shadow-glass-soft ${className}`}
      {...rest}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
