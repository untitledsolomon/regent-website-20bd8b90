import { motion } from "framer-motion";

const logos = [
  "Accenture", "Deloitte", "McKinsey", "Goldman Sachs", "JP Morgan",
  "Citadel", "Palantir", "Raytheon", "Lockheed Martin", "Boeing",
  "Shell", "Chevron", "Siemens", "Booz Allen", "KPMG",
];

function LogoItem({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center px-8 py-4 mx-4 border border-border rounded-lg bg-card/50 backdrop-blur-sm min-w-[160px] select-none">
      <span className="font-heading text-sm font-medium text-text-muted tracking-[-0.02em] whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export function LogoMarquee() {
  const doubled = [...logos, ...logos];
  return (
    <section className="py-16 overflow-hidden border-y border-border bg-surface/50">
      <div className="section-container mb-8">
        <p className="text-center font-mono text-[11px] tracking-[0.12em] uppercase text-text-muted">
          Trusted by leading organizations worldwide
        </p>
      </div>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <motion.div
          className="flex"
          animate={{ x: [0, -50 * logos.length] }}
          transition={{
            x: {
              duration: 40,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {doubled.map((name, i) => (
            <LogoItem key={`${name}-${i}`} name={name} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
