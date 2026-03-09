import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RevealOnScroll } from "./RevealOnScroll";

const testimonials = [
  {
    quote: "Regent reduced our integration timeline from 18 months to 6 weeks. The platform's architecture is genuinely enterprise-grade.",
    author: "CTO",
    role: "Global Financial Exchange",
    metric: "94% reduction in data latency",
  },
  {
    quote: "We connected 23 legacy systems without a single production incident. That kind of reliability at our scale is exceptional.",
    author: "VP Engineering",
    role: "Tier-1 Investment Bank",
    metric: "23 systems unified",
  },
  {
    quote: "The intelligence layer transformed how we monitor operations. We went from reactive to predictive in under a quarter.",
    author: "Director of Infrastructure",
    role: "Major Energy Company",
    metric: "3x faster incident response",
  },
];

export function TestimonialCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-[100px] bg-surface">
      <div className="section-container">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">
              CLIENT OUTCOMES
            </div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary">
              Results That Speak
            </h2>
          </div>
        </RevealOnScroll>

        <div className="max-w-[720px] mx-auto relative min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="inline-block bg-primary/10 text-primary font-mono text-[12px] tracking-[0.04em] px-4 py-1.5 rounded-full mb-8 border border-primary/15">
                {testimonials[active].metric}
              </div>
              <blockquote className="text-[clamp(18px,2.5vw,24px)] font-light text-text-primary leading-[1.6] mb-8">
                "{testimonials[active].quote}"
              </blockquote>
              <div>
                <div className="font-heading text-[15px] font-semibold text-text-primary">
                  {testimonials[active].author}
                </div>
                <div className="text-[13px] text-text-muted mt-1">
                  {testimonials[active].role}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-10">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="relative w-8 h-1.5 rounded-full overflow-hidden bg-border transition-colors"
            >
              {i === active && (
                <motion.div
                  className="absolute inset-0 bg-primary rounded-full"
                  layoutId="testimonial-dot"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
