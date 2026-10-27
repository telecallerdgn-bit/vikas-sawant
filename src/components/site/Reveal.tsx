"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type Variant = "up" | "down" | "left" | "right" | "zoom" | "fade";

const FROM: Record<Variant, Record<string, number>> = {
  up: { y: 32 },
  down: { y: -32 },
  left: { x: -48 },
  right: { x: 48 },
  zoom: { scale: 0.92 },
  fade: {},
};

/**
 * Scroll par element smoothly aata hai (ek hi baar).
 * <Reveal>...</Reveal>
 * <Reveal variant="left" delay={120}>...</Reveal>
 */
export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  /** milliseconds; grid cards ke liye index * 100 use karo */
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...FROM[variant] }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}