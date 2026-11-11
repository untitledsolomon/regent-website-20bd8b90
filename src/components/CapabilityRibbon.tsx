'use client';

import { motion } from "framer-motion";

interface CapabilityRibbonProps {
  items: string[];
  className?: string;
  delay?: number;
}

/** A quiet, numbered row of names. Replaces the old statistics strips. */
export function CapabilityRibbon({ items, className = "", delay = 0.3 }: CapabilityRibbonProps) {
  return (
    <motion.ul
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`grid grid-cols-2 border-y border-border md:grid-flow-col md:auto-cols-fr ${className}`}
    >
      {items.map((label, i) => (
        <li
          key={label}
          className={`border-border px-5 py-5 ${i % 2 === 1 ? "border-l" : ""} md:border-l ${i === 0 ? "md:border-l-0" : ""}`}
        >
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="font-heading text-[14px] font-medium tracking-[-0.01em] text-text-primary">{label}</div>
        </li>
      ))}
    </motion.ul>
  );
}
