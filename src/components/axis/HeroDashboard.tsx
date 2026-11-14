'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Hero scroll stage for /axis.
 *
 * - `HeroCaption` pins the headline block under the navbar and fades it back
 *   as the page scrolls.
 * - `HeroDashboard` is the real Axis dashboard. It sits above the caption in
 *   the stacking order and rises faster than the page while growing slightly,
 *   so it slides up and covers the caption.
 *
 * Neither is gated on prefers-reduced-motion: the movement is bounded to the
 * hero and is the intended look of the page.
 */
export function HeroCaption({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [80, 480], [1, 0]);
  const scale = useTransform(scrollY, [0, 480], [1, 0.95]);

  return (
    <motion.div
      className="section-container sticky top-16 z-0 pb-14 pt-28"
      style={{ opacity, scale, transformOrigin: 'top center', willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

export function HeroDashboard() {
  const { scrollY } = useScroll();
  // Rise faster than the page (extra upward travel) while easing up to full size.
  const y = useTransform(scrollY, [0, 520], [0, -90]);
  const scale = useTransform(scrollY, [0, 420], [0.94, 1]);

  return (
    <motion.div
      className="relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-8"
      style={{ y, scale, transformOrigin: 'top center', willChange: 'transform' }}
    >
      <div className="absolute inset-x-10 top-6 h-2/3 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
      <div
        className="relative overflow-hidden rounded-t-2xl border border-b-0 border-border bg-background p-2 pb-0 shadow-[0_-24px_80px_rgba(79,70,229,0.22)]"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, #000 86%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, #000 86%, transparent 100%)',
        }}
      >
        <div className="overflow-hidden rounded-t-xl border border-b-0 border-border">
          <Image
            src="/axis/axis-dashboard.webp"
            alt="The Axis dashboard: revenue, active clients, outstanding invoices, net profit, a revenue chart, recent activity and inventory status"
            width={1866}
            height={928}
            priority
            sizes="(min-width: 1400px) 1336px, 100vw"
            className="h-auto w-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
