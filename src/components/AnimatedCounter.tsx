import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string; // e.g. "400+", "99.99%", "2.4B+"
  className?: string;
}

function parseValue(val: string): { num: number; prefix: string; suffix: string; decimals: number } {
  const match = val.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
  if (!match) return { num: 0, prefix: "", suffix: val, decimals: 0 };
  const prefix = match[1];
  const numStr = match[2].replace(/,/g, "");
  const suffix = match[3];
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { num: parseFloat(numStr), prefix, suffix, decimals };
}

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState("0");
  const { num, prefix, suffix, decimals } = parseValue(value);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1800;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * num;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, num, decimals]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {prefix}{display}{suffix}
    </motion.span>
  );
}
