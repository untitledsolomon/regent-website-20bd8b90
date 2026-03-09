import { motion } from "framer-motion";

const blobs = [
  { cx: "20%", cy: "30%", r: 300, color: "hsl(var(--primary) / 0.07)", duration: 18, dx: 40, dy: 30 },
  { cx: "70%", cy: "60%", r: 250, color: "hsl(var(--accent-mid) / 0.06)", duration: 22, dx: -35, dy: 45 },
  { cx: "50%", cy: "20%", r: 200, color: "hsl(var(--primary) / 0.04)", duration: 25, dx: 50, dy: -25 },
  { cx: "80%", cy: "40%", r: 180, color: "hsl(var(--accent-mid) / 0.05)", duration: 20, dx: -45, dy: -35 },
];

const dots = Array.from({ length: 24 }, (_, i) => ({
  x: `${5 + Math.random() * 90}%`,
  y: `${5 + Math.random() * 90}%`,
  size: 2 + Math.random() * 2,
  duration: 4 + Math.random() * 6,
  delay: Math.random() * 4,
  dy: 12 + Math.random() * 20,
}));

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Morphing gradient blobs */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <filter id="blob-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
          </filter>
        </defs>
        {blobs.map((blob, i) => (
          <motion.circle
            key={i}
            cx={blob.cx}
            cy={blob.cy}
            r={blob.r}
            fill={blob.color}
            filter="url(#blob-blur)"
            animate={{
              cx: [`${parseFloat(blob.cx)}%`, `${parseFloat(blob.cx) + blob.dx / 5}%`, `${parseFloat(blob.cx)}%`],
              cy: [`${parseFloat(blob.cy)}%`, `${parseFloat(blob.cy) + blob.dy / 5}%`, `${parseFloat(blob.cy)}%`],
              r: [blob.r, blob.r * 1.15, blob.r],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* Floating particles */}
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
          }}
          animate={{
            y: [0, -dot.dy, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
