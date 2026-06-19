"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";

export type ButtonVariant = "base" | "info" | "danger";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "base",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Base classes for layout and disabled state
  const baseClass = "relative flex items-center justify-center font-black tracking-tight rounded-2xl transition duration-200 outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  // Variant specific styling
  let variantClass = "";
  switch (variant) {
    case "base":
      variantClass = "bg-lime-300 text-slate-950 hover:bg-lime-400";
      break;
    case "info":
      variantClass = "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20";
      break;
    case "danger":
      variantClass = "border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200";
      break;
  }

  return (
    <motion.button
      whileTap={disabled || isLoading ? undefined : { scale: 0.96 }}
      disabled={disabled || isLoading}
      className={`${baseClass} ${variantClass} ${className}`}
      {...(props as any)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center size-full"
          >
            <div className={`size-4 animate-spin rounded-full border-2 ${
              variant === "base" ? "border-slate-950" : variant === "danger" ? "border-red-300" : "border-slate-350"
            } border-t-transparent`} />
          </motion.div>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
