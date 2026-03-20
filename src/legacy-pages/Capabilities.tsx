"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CTASection } from "@/components/CardComponents";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { GradientText } from "@/components/GradientText";
import { InteractiveDemo, type DemoStep } from "@/components/InteractiveDemo";
import { detailedCapabilities } from "@/data/siteData";
import { PageMeta } from "@/components/PageMeta";
import { ChartArea, Cog, Ruler, Search } from "lucide-react";

const capabilityStats = [
  { label: "Protocols Supported", value: "10+" },
  { label: "Integration Patterns", value: "25+" },
  { label: "System Uptime SLA", value: "99.99%" },
  { label: "Deployment Time", value: "8–16 Weeks" },
];

const approachComparison = [
  { approach: "In-House Teams", timeline: "12–18 months", risk: "High", scalability: "Limited", expertise: "Single domain" },
  { approach: "Traditional Consultancies", timeline: "6–12 months", risk: "Medium", scalability: "Project-bound", expertise: "General" },
  { approach: "Regent Systems", timeline: "8–16 weeks", risk: "Low", scalability: "Ongoing partnership", expertise: "Deep integration", highlighted: true },
];

const workflowSteps: DemoStep[] = [
  {
    id: "discover",
    title: "Discover",
    icon: <span><Search/></span>,
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
    icon: <span><Ruler/></span>,
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
    icon: <span><Cog/></span>,
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
    icon: <span><ChartArea/></span>,
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
      <PageMeta title="Solutions & Capabilities — Regent | Integration Consulting" description="Five core capabilities that address every layer of enterprise integration and intelligence challenges." />
      {/* Hero */}
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="section-container relative z-10">
          <div className="font-mono text-xs text-text-muted mb-6 flex items-center gap-2">
            <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">Home</Link>
            <span className="text-border-strong">→</span>
            Solutions & Capabilities
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[720px]"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">SOLUTIONS & CAPABILITIES</div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              Operational Systems <GradientText>Engineering</GradientText>
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px]">
              Six core capabilities spanning the full operational systems stack — from data infrastructure and integration to applications, intelligence, and risk monitoring.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10"
          >
            {capabilityStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="font-heading text-[clamp(28px,3vw,36px)] font-semibold tracking-[-0.03em] text-text-primary">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="font-mono text-[11px] tracking-[0.06em] uppercase text-text-muted mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">COMPARISON</div>
              <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] text-text-primary mb-4">
                Why Regent Is Different
              </h2>
              <p className="text-[17px] text-text-secondary max-w-[560px] mx-auto leading-[1.65]">
                Not all approaches to systems integration are equal. See how Regent's consulting model compares.
              </p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Approach", "Timeline", "Risk", "Scalability", "Expertise"].map(h => (
                      <th key={h} className="font-mono text-[11px] tracking-[0.1em] uppercase text-text-muted text-left p-4 border-b border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approachComparison.map((row) => (
                    <tr key={row.approach} className={row.highlighted ? "bg-accent-light" : ""}>
                      <td className={`p-4 border-b border-border font-heading text-[15px] font-semibold ${row.highlighted ? "text-primary" : "text-text-primary"}`}>
                        {row.approach}
                      </td>
                      <td className={`p-4 border-b border-border text-sm font-medium ${row.highlighted ? "text-primary" : "text-text-secondary"}`}>{row.timeline}</td>
                      <td className="p-4 border-b border-border text-sm text-text-secondary">{row.risk}</td>
                      <td className="p-4 border-b border-border text-sm text-text-secondary">{row.scalability}</td>
                      <td className="p-4 border-b border-border text-sm text-text-secondary">{row.expertise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Detailed Capabilities */}
      {detailedCapabilities.map((cap, idx) => {
        const IconComp = Icons[cap.icon] || Icons.Integration;
        return (
          <div key={cap.title}>
            <section className={`py-20 ${idx % 2 === 1 ? 'bg-surface' : 'bg-card'}`}>
              <div className="section-container">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-20 items-center`}>
                  <RevealOnScroll className={idx % 2 === 1 ? 'md:order-2' : ''}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="font-mono text-[11px] tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-surface text-text-secondary border border-border">{cap.tag}</span>
                      <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary">CAPABILITY</span>
                    </div>
                    <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-4">{cap.title}</h2>
                    <p className="text-[17px] text-text-secondary leading-[1.7] mb-8">{cap.desc}</p>
                    <div className="flex flex-col gap-3">
                      {cap.points.map(p => (
                        <div key={p} className="flex items-center gap-2.5">
                          <div className="text-primary flex-shrink-0"><Icons.Check /></div>
                          <span className="text-[15px] text-text-primary">{p}</span>
                        </div>
                      ))}
                    </div>
                  </RevealOnScroll>
                  <RevealOnScroll delay={0.2} className={idx % 2 === 1 ? 'md:order-1' : ''}>
                    <div className="bg-accent-light border border-primary/15 rounded-2xl p-16 flex items-center justify-center min-h-[280px] relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.06)_0%,transparent_70%)]" />
                      <motion.div
                        animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="text-primary opacity-40 scale-[4]"
                      >
                        <IconComp />
                      </motion.div>
                    </div>
                  </RevealOnScroll>
                </div>
              </div>
            </section>
            {idx < detailedCapabilities.length - 1 && <hr className="border-t border-border" />}
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
