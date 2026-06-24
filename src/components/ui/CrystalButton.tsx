"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface CrystalButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
}

export default function CrystalButton({ children, className = "", ...props }: CrystalButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative px-6 py-3 rounded-2xl font-medium transition-shadow ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
