"use client";

import { motion } from "motion/react";

type MotionSectionProps = Readonly<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}>;

export function MotionSection({ children, className, delay = 0 }: MotionSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
