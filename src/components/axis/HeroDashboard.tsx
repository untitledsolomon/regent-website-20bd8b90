'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * The /axis hero visual. The frame is a fixed, cropped window onto the real
 * Axis dashboard; as the page scrolls, the screenshot pans upward inside it so
 * the app appears to scroll for the visitor. The pan is bounded inside the
 * frame, so it runs even when the OS asks for reduced motion.
 */
export function HeroDashboard() {
  const { scrollY } = useScroll();
  // The frame shows ~64% of the image height; -36% reveals the remainder.
  const y = useTransform(scrollY, [0, 560], ['0%', '-36%']);

  return (
    <div className="relative mx-auto w-full max-w-[1400px] px-4 sm:px-8">
      <div className="absolute inset-x-10 top-6 h-2/3 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
      <div
        className="relative aspect-[1866/620] overflow-hidden rounded-t-2xl border border-b-0 border-border bg-background p-2 pb-0 shadow-[0_-10px_80px_rgba(79,70,229,0.18)]"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, #000 72%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, #000 72%, transparent 100%)',
        }}
      >
        <div className="h-full overflow-hidden rounded-t-xl border border-b-0 border-border">
          <motion.div style={{ y, willChange: 'transform' }}>
            <Image
              src="/axis/axis-dashboard.webp"
              alt="The Axis dashboard: revenue, active clients, outstanding invoices, net profit, a revenue chart, recent activity and inventory status"
              width={1866}
              height={928}
              priority
              sizes="(min-width: 1400px) 1336px, 100vw"
              className="h-auto w-full"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
