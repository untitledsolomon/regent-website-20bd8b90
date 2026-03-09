import { motion } from "framer-motion";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  shimmer?: boolean;
}

export function GradientText({ children, className = "", shimmer = true }: GradientTextProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="bg-gradient-to-r from-primary via-accent-mid to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-shimmer">
        {children}
      </span>
      {shimmer && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-clip-text text-transparent pointer-events-none"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
        />
      )}
    </span>
  );
}
