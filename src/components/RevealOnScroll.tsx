'use client';

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface RevealOnScrollProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
  parallax?: boolean;
}

export function RevealOnScroll({ children, delay = 0, className = "", direction = "up", parallax = false }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const initial = direction === "up" 
    ? { opacity: 0, y: 32, scale: 0.97 } 
    : direction === "left" 
    ? { opacity: 0, x: -32, scale: 0.97 } 
    : { opacity: 0, x: 32, scale: 0.97 };

  const animate = { opacity: 1, y: 0, x: 0, scale: 1 };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={parallax ? { y: parallaxY } : undefined}
    >
      {children}
    </motion.div>
  );
}
