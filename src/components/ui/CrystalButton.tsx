"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

interface CrystalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export default function CrystalButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: CrystalButtonProps) {
  const base =
    "rounded-crystal px-8 py-4 font-body font-bold text-base tracking-wide transition-shadow duration-300";

  const variants = {
    primary:
      "bg-gradient-to-r from-baby-pink to-[#f6a8c4] text-white shadow-glow-pink hover:shadow-[0_0_36px_rgba(248,200,220,0.85)]",
    secondary:
      "bg-white/60 border border-tiffany/50 text-[#4a4458] backdrop-blur-md hover:shadow-glow-tiffany",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
