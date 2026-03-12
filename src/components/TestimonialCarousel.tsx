import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RevealOnScroll } from "./RevealOnScroll";

const testimonials = [
  {
    quote: "Regent helped us structure our marketing and operations in a way that finally made everything scalable. The clarity alone changed how we run campaigns.",
    author: "Director",
    role: "Trevix Media",
    metric: "2x increase in campaign efficiency",
  },
  {
    quote: "Working with Regent gave our business a much stronger strategic direction. Their insight into branding and digital positioning was extremely valuable.",
    author: "Founder",
    role: "Luminary Graphics",
    metric: "40% growth in client inquiries",
  },
  {
    quote: "Regent helped us streamline internal processes and improve how we present our services online. The impact was immediate.",
    author: "Operations Manager",
    role: "Next Level Store",
    metric: "30% increase in customer engagement",
  },
  {
    quote: "Regent brought structure to how we approach partnerships and growth opportunities. Their strategic input helped us move faster with more confidence.",
    author: "Managing Director",
    role: "Trevix Trading LTD",
    metric: "Expanded into 2 new markets",
  },
  {
    quote: "The team at Regent helped us refine our digital presence and improve how we communicate our value to clients. The results were noticeable within weeks.",
    author: "Business Development Lead",
    role: "Akawang GI",
    metric: "45% increase in qualified leads",
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
