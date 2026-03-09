import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface DemoStep {
  id: string;
  title: string;
  icon: ReactNode;
  content: ReactNode;
}

interface InteractiveDemoProps {
  steps: DemoStep[];
  label?: string;
  heading?: string;
  subtitle?: string;
}

export function InteractiveDemo({ steps, label, heading, subtitle }: InteractiveDemoProps) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {(label || heading) && (
        <div className="text-center mb-12">
          {label && (
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">{label}</div>
          )}
          {heading && (
            <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] text-text-primary mb-4">
              {heading}
            </h2>
          )}
          {subtitle && (
            <p className="text-[17px] text-text-secondary max-w-[560px] mx-auto leading-[1.65]">{subtitle}</p>
          )}
        </div>
      )}

      {/* Step navigator */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {steps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => setActive(i)}
            className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl border text-left transition-all ${
              active === i
                ? "bg-accent-light border-primary/30 text-primary shadow-sm"
                : "bg-card border-border text-text-secondary hover:border-border-strong hover:text-text-primary"
            }`}
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-sm">
              {step.icon}
            </span>
            <span className="font-heading text-[14px] font-medium">{step.title}</span>
            {active === i && (
              <motion.div
                layoutId="demo-active-indicator"
                className="absolute inset-0 rounded-xl border-2 border-primary/40 pointer-events-none"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className="relative min-h-[320px] border border-border rounded-2xl bg-card overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={steps[active].id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 md:p-10"
          >
            {steps[active].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 mt-5">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              active === i ? "bg-primary w-6" : "bg-border hover:bg-border-strong"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
