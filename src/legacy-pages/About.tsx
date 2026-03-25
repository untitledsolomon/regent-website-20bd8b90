'use client';

import { motion } from "framer-motion";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CTASection } from "@/components/CardComponents";
import { Icons } from "@/components/Icons";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { PageMeta } from "@/components/PageMeta";

const values = [
  {
    title: "Engineering Rigor",
    desc: "We treat integration as a discipline, not a task. Every system we build is designed for reliability at institutional scale — with failure isolation, graceful degradation, and complete audit trails.",
  },
  {
    title: "Operational Clarity",
    desc: "Organizations cannot improve what they cannot observe. We build infrastructure that gives leadership real-time visibility into how their systems and operations actually behave.",
  },
  {
    title: "Long-Term Partnership",
    desc: "We don't build and walk away. Regent operates as a long-term infrastructure partner — evolving alongside your organization as complexity grows and requirements change.",
  },
  {
    title: "Security by Design",
    desc: "Security is architectural, not cosmetic. Every system we build follows zero-trust principles, end-to-end encryption, and compliance-ready audit infrastructure.",
  },
];

const stats = [
  { n: "2026", l: "Year Founded" },
  { n: "6+", l: "Projects Delivered" },
  { n: "5+", l: "Team" },
  { n: "1", l: "Core Mission" },
];

const milestones = [
  {
    year: "Feb 2026",
    event: "Regent founded with a focus on solving the operational coherence problem in modern organizations",
  },
  {
    year: "Present",
    event: "Designing and refining core architecture for integration, intelligence, and system unification",
  },
  {
    year: "Next",
    event: "First production deployments with organizations operating at meaningful scale",
  },
];

const why_it_matters = [
  {
    icon: "Database" as const,
    stat: "Fragmented",
    desc: "Most organizations operate disconnected systems with limited visibility across operations",
  },
  {
    icon: "Workflow" as const,
    stat: "Manual",
    desc: "Critical workflows often rely on human coordination between systems instead of automation",
  },
  {
    icon: "Monitor" as const,
    stat: "Opaque",
    desc: "Leadership lacks real-time insight into how systems behave under real operational conditions",
  },
]

export default function AboutPage() {
  return (
    <div>
      <PageMeta title="About — Regent | Our Mission & Story" description="Regent was founded on the belief that organizations cannot reach their operational potential when their systems don't communicate." />
      {/* Hero */}
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="max-w-[700px]"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">ABOUT REGENT</div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              We build infrastructure for complex organizations
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[600px] mb-4">
              Regent was founded on the belief that organizations cannot reach their operational potential when their systems don't communicate. We build the connective tissue that transforms fragmented technology landscapes into unified operational platforms.
            </p>
            <p className="text-base text-text-secondary leading-[1.65] max-w-[600px]">
              We are early by design — focused on building the core infrastructure layer before scaling outward. Regent is being built to operate where complexity is highest and failure is not an option.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-0 border-b border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.l}
                className={`py-10 px-8 ${i < 3 ? "border-r border-border" : ""} ${i % 2 === 0 ? "bg-card" : "bg-surface"}`}
              >
                <AnimatedCounter
                  value={s.n}
                  className="font-heading text-[36px] font-semibold tracking-[-0.04em] text-text-primary block"
                />
                <div className="text-[13px] text-text-muted mt-1.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-[100px]">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <RevealOnScroll>
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">OUR MISSION</div>
              <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-6">The operational coherence problem</h2>
              <p className="text-base text-text-secondary leading-[1.75] mb-5">
                Every significant organization today operates dozens of distinct software systems. The problem is not the systems — it's the absence of connective infrastructure. When systems don't communicate, data becomes inconsistent, workflows fragment, and the organization loses the ability to understand itself.
              </p>
              <p className="text-base text-text-secondary leading-[1.75] mb-5">
                Regent is being built to solve this problem.. We design and deploy the integration and intelligence infrastructure that allows organizations to operate as unified systems — with real-time data flows, automated workflows, and embedded intelligence at every layer.
              </p>
              <p className="text-base text-text-secondary leading-[1.75]">
                The systems we build don't just connect data. They create the conditions for a fundamentally new kind of organizational capability: the ability to observe, analyze, and optimize operations as a single, coherent system.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.15}>
              <div className="bg-surface border border-border rounded-xl p-8">
                <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-6">WHY IT MATTERS</div>
                <div className="space-y-6">
                  {why_it_matters.map((item) => {
                    const IconComp = Icons[item.icon];
                    return (
                      <div key={item.stat} className="flex gap-4 items-start">
                        <div className="w-9 h-9 bg-accent-light rounded-lg flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                          <IconComp />
                        </div>
                        <div>
                          <div className="font-heading text-xl font-semibold text-text-primary mb-0.5">{item.stat}</div>
                          <div className="text-sm text-text-secondary leading-[1.6]">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Values */}
      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <RevealOnScroll>
            <div className="text-center mb-14">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">OUR PRINCIPLES</div>
              <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-3">What drives us</h2>
              <p className="text-lg font-light text-text-secondary leading-relaxed max-w-[520px] mx-auto">
                The principles that define how we build, deploy, and support enterprise infrastructure.
              </p>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <RevealOnScroll key={v.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}
                  className="bg-card border border-border rounded-xl p-8 transition-colors hover:border-border-strong h-full"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="font-mono text-[11px] text-primary bg-accent-light border border-primary/15 rounded-full px-2.5 py-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="font-heading text-lg font-semibold tracking-[-0.02em] text-text-primary">{v.title}</h3>
                  </div>
                  <p className="text-sm text-text-secondary leading-[1.7]">{v.desc}</p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Timeline */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <div className="text-center mb-14">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">OUR JOURNEY</div>
              <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-3">Building for the long term</h2>
              <p className="text-lg font-light text-text-secondary leading-relaxed max-w-[520px] mx-auto">
                Early stages of a long-term build — focused on architecture, not speed.
              </p>
            </div>
          </RevealOnScroll>
          <div className="max-w-[640px] mx-auto">
            {milestones.map((m, i) => (
              <RevealOnScroll key={m.year} delay={i * 0.05}>
                <div className="flex gap-6 relative">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary border-2 border-accent-light flex-shrink-0 mt-1.5" />
                    {i < milestones.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-8">
                    <div className="font-mono text-[12px] font-medium text-primary mb-1">{m.year}</div>
                    <p className="text-sm text-text-secondary leading-[1.65]">{m.event}</p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Approach */}
      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
            <RevealOnScroll>
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">OUR APPROACH</div>
              <h2 className="text-[clamp(28px,4vw,44px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-6">
                Systems architecture, not point solutions
              </h2>
              <p className="text-base text-text-secondary leading-[1.75] mb-5">
                The traditional approach to enterprise integration — building direct connections between individual systems — fails predictably at scale. In a network of N systems, point-to-point architecture requires O(N²) connections, each with its own failure mode and maintenance burden.
              </p>
              <p className="text-base text-text-secondary leading-[1.75]">
                We take a fundamentally different approach. Every system we build includes a mediation layer through which all system communication flows. Instead of N² connections, you build N connections to the layer. It handles translation, transformation, routing, and reliability — while creating the conditions for organization-wide intelligence.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.15}>
              <div className="space-y-4">
                {[
                  { title: "Assess", desc: "We map your existing system landscape, data flows, and operational pain points to build a complete integration blueprint." },
                  { title: "Architect", desc: "We design a platform architecture tailored to your specific systems, compliance requirements, and operational objectives." },
                  { title: "Deploy", desc: "We implement in phases — delivering value at each stage while building toward complete operational coherence." },
                  { title: "Evolve", desc: "We operate as an ongoing partner — monitoring, optimizing, and extending your platform as your organization grows." },
                ].map((step, i) => (
                  <motion.div
                    key={step.title}
                    whileHover={{ x: 4 }}
                    className="bg-card border border-border rounded-xl p-6 transition-colors hover:border-border-strong"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-mono text-[11px] text-primary bg-accent-light border border-primary/15 rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </div>
                      <h3 className="font-heading text-[15px] font-semibold text-text-primary">{step.title}</h3>
                    </div>
                    <p className="text-sm text-text-secondary leading-[1.65] ml-10">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
