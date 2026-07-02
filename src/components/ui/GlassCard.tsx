import { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  texture?: boolean;
}

export default function GlassCard({ children, className = "", texture = true, ...rest }: GlassCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border bg-white/10 backdrop-blur-md ${className}`}
      style={{
        borderColor: "rgba(232,193,112,0.4)",
        boxShadow: "0 4px 24px rgba(232,193,112,0.12), 0 1px 8px rgba(0,0,0,0.08)",
        ...rest.style,
      }}
      {...rest}
    >
      {/* Champagne gold inner rim */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] rounded-[21px]"
        style={{ border: "1px solid rgba(232,193,112,0.2)" }}
      />
      {/* Glass sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 40%, transparent 60%)",
        }}
      />
      {texture && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "url(/images/decor/damask_pattern_pink.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.06,
            mixBlendMode: "multiply",
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
