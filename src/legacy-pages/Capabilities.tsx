"use client";

import { modules } from "@/data/siteData";
import { motion } from "framer-motion";
import { CapabilityRibbon } from "@/components/CapabilityRibbon";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CTASection } from "@/components/CardComponents";
import { GradientText } from "@/components/GradientText";
import { InteractiveDemo, type DemoStep } from "@/components/InteractiveDemo";
import { detailedCapabilities } from "@/data/siteData";
import { ChartArea, Cog, Puzzle, Ruler, Search } from "lucide-react";

const workflowSteps: DemoStep[] = [
  {
    id: "discover",
    title: "Discover",
    icon: <Search size={18} strokeWidth={1.5} />,
    content: (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="font-mono text-[40px] font-semibold text-primary/10">01</div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-text-primary">Discovery & Assessment</h3>
            <p className="text-[13px] text-text-muted">Map your system landscape and identify integration gaps</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 text-sm leading-7 text-text-secondary">
          <p className="mb-2">Our engineers conduct a comprehensive audit of your existing systems, data flows, and operational bottlenecks.</p>
          <div className="text-primary mt-3 font-medium text-xs">Deliverables:</div>
          <div className="pl-4 text-text-muted text-xs mt-1">• System landscape map & dependency analysis</div>
          <div className="pl-4 text-text-muted text-xs">• Integration gap assessment</div>
          <div className="pl-4 text-text-muted text-xs">• Prioritized roadmap with estimated ROI</div>
        </div>
      </div>
    ),
  },
  {
    id: "architect",
    title: "Architect",
    icon: <Ruler size={18} strokeWidth={1.5} />,
    content: (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="font-mono text-[40px] font-semibold text-primary/10">02</div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-text-primary">Architecture & Design</h3>
            <p className="text-[13px] text-text-muted">Design a resilient integration architecture tailored to your organization</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 text-sm leading-7 text-text-secondary">
          <p className="mb-2">We design integration architectures built for institutional reliability—handling protocol translation, data governance, and failure recovery from day one.</p>
          <div className="text-primary mt-3 font-medium text-xs">Deliverables:</div>
          <div className="pl-4 text-text-muted text-xs mt-1">• Technical architecture document</div>
          <div className="pl-4 text-text-muted text-xs">• Data flow & transformation specifications</div>
          <div className="pl-4 text-text-muted text-xs">• Security & compliance framework</div>
        </div>
      </div>
    ),
  },
  {
    id: "implement",
    title: "Implement",
    icon: <Cog size={18} strokeWidth={1.5} />,
    content: (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="font-mono text-[40px] font-semibold text-primary/10">03</div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-text-primary">Build & Deploy</h3>
            <p className="text-[13px] text-text-muted">Engineer, test, and deploy integration infrastructure</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 text-sm leading-7 text-text-secondary">
          <p className="mb-2">Our engineering teams build and deploy your integration infrastructure in iterative sprints—with continuous testing, monitoring, and stakeholder reviews at every stage.</p>
          <div className="text-primary mt-3 font-medium text-xs">Deliverables:</div>
          <div className="pl-4 text-text-muted text-xs mt-1">• Production-ready integration infrastructure</div>
          <div className="pl-4 text-text-muted text-xs">• Automated test suites & monitoring</div>
          <div className="pl-4 text-text-muted text-xs">• Runbooks & operational documentation</div>
        </div>
      </div>
    ),
  },
  {
    id: "optimize",
    title: "Optimize",
    icon: <ChartArea size={18} strokeWidth={1.5} />,
    content: (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="font-mono text-[40px] font-semibold text-primary/10">04</div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-text-primary">Ongoing Optimization</h3>
            <p className="text-[13px] text-text-muted">Continuously monitor, refine, and evolve your systems</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 text-sm leading-7 text-text-secondary">
          <p className="mb-2">Integration is not a one-time project. We provide ongoing optimization, performance tuning, and proactive issue resolution to ensure your systems evolve with your business.</p>
          <div className="text-primary mt-3 font-medium text-xs">Deliverables:</div>
          <div className="pl-4 text-text-muted text-xs mt-1">• Monthly performance & health reports</div>
          <div className="pl-4 text-text-muted text-xs">• Proactive capacity planning</div>
          <div className="pl-4 text-text-muted text-xs">• Architecture evolution recommendations</div>
        </div>
      </div>
    ),
  },
];

export default function CapabilitiesPage() {
  return (
    <div>
      

      {/* Hero */}
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="section-container relative z-10">
          <div className="font-mono text-xs text-text-muted mb-6 flex items-center gap-2">
            <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">
              Home
            </Link>
            <span className="text-border-strong">→</span>
            Solutions & Capabilities
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[720px]"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">
              SOLUTIONS & CAPABILITIES
            </div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              Operational Systems <GradientText>Engineering</GradientText>
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px]">
              Six core capabilities spanning the full operational systems stack — from data infrastructure and integration to applications, intelligence, and risk monitoring.
            </p>
          </motion.div>

          <CapabilityRibbon items={modules.map((m) => m.name)} delay={0.3} className="mt-10" />
        </div>
      </section>

      {/* Detailed Capabilities */}
      {detailedCapabilities.map((cap, idx) => {
        // Safe icon lookup — falls back to lucide Puzzle instead of Icons.Integration
        const IconComp = Icons[cap.icon];
        return (
          <div key={cap.title}>
            <section className={`py-20 ${idx % 2 === 1 ? "bg-surface" : "bg-card"}`}>
              <div className="section-container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                  {/* Text column */}
                  <RevealOnScroll className={idx % 2 === 1 ? "md:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="font-mono text-[11px] tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-surface text-text-secondary border border-border">
                        {cap.tag}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary">
                        CAPABILITY
                      </span>
                    </div>
                    <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-4">
                      {cap.title}
                    </h2>
                    <p className="text-[17px] text-text-secondary leading-[1.7] mb-8">
                      {cap.desc}
                    </p>
                    {/* Guard: only render points list if non-empty */}
                    {cap.points?.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {cap.points.map((p) => (
                          <div key={p} className="flex items-center gap-2.5">
                            <div className="text-primary flex-shrink-0">
                              <Icons.Check />
                            </div>
                            <span className="text-[15px] text-text-primary">{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </RevealOnScroll>

                  {/* Icon panel — min-h guards against collapse when points list is empty */}
                  <RevealOnScroll
                    delay={0.2}
                    className={idx % 2 === 1 ? "md:order-1" : ""}
                  >
                    <div className="bg-accent-light border border-primary/15 rounded-2xl p-16 flex items-center justify-center min-h-[280px] relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.06)_0%,transparent_70%)]" />
                      <motion.div
                        animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="text-primary opacity-40"
                      >
                        {/*
                          Render at native large size via size prop instead of
                          CSS scale-[4] which blurs rasterised SVGs.
                          Lucide Puzzle is the fallback for unrecognised icon names.
                        */}
                        {IconComp ? (
                          <IconComp/>
                        ) : (
                          <Puzzle size={96} strokeWidth={1} />
                        )}
                      </motion.div>
                    </div>
                  </RevealOnScroll>
                </div>
              </div>
            </section>
            {idx < detailedCapabilities.length - 1 && (
              <hr className="border-t border-border" />
            )}
          </div>
        );
      })}

      {/* Interactive Workflow Demo */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <InteractiveDemo
              label="OUR PROCESS"
              heading="How We Deliver"
              subtitle="Walk through our four-phase engagement model — from initial discovery to ongoing optimization."
              steps={workflowSteps}
            />
          </RevealOnScroll>
        </div>
      </section>

      <hr className="border-t border-border" />

      <CTASection />
    </div>
  );
}