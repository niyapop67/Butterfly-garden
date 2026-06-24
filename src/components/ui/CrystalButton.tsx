"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface CrystalButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: "primary" | "ghost";
}

export default function CrystalButton({
  children,
  className = "",
  variant = "primary",
  ...props
}: CrystalButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`relative px-8 py-4 rounded-full font-medium transition-shadow overflow-hidden ${className}`}
      style={
        isPrimary
          ? {
              background: "linear-gradient(135deg, #ff9ec7 0%, #ff6fa8 55%, #f0c869 100%)",
              color: "#fff",
              boxShadow: "var(--shadow-glow-pink)",
              border: "1px solid rgba(255,255,255,0.6)",
            }
          : {
              background: "rgba(255,255,255,0.55)",
              color: "var(--color-ink)",
              boxShadow: "var(--shadow-glass-soft)",
              border: "1px solid rgba(232,193,112,0.4)",
            }
      }
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/35 to-transparent"
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}
