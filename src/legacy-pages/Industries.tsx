"use client";

import { motion } from "framer-motion";
import { CapabilityRibbon } from "@/components/CapabilityRibbon";
import Link from "next/link";
import { Shield, Database, Zap, BrainCircuit } from "lucide-react";
import { Icons } from "@/components/Icons";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CTASection } from "@/components/CardComponents";
import { GradientText } from "@/components/GradientText";
import { industriesDetailed } from "@/data/siteData";

const mainIndustries = industriesDetailed.filter((i) => i.primary);
const otherIndustries = industriesDetailed.filter((i) => !i.primary);

const crossIndustryBenefits = [
  {
    title: "Regulatory Alignment",
    desc: "Integration architectures designed to operate within the regulatory requirements of each sector, with audit trails built in.",
    Icon: Shield,
  },
  {
    title: "Legacy Modernization",
    desc: "Decades-old systems connected to modern platforms in stages, so operations continue while the architecture changes.",
    Icon: Database,
  },
  {
    title: "Timely Data",
    desc: "Information kept current across connected systems, so time-critical decisions rest on the same facts.",
    Icon: Zap,
  },
  {
    title: "Operational Intelligence",
    desc: "Analysis embedded across system boundaries, surfacing patterns that isolated reporting cannot show.",
    Icon: BrainCircuit,
  },
];

export default function IndustriesPage() {
  return (
    <div>

      {/* Hero */}
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[720px]"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">
              INDUSTRIES
            </div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              Built for environments where{" "}
              <GradientText>failure is expensive</GradientText>
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px]">
              Systems for sectors where operational complexity is high and
              the tolerance for inconsistency is low.
            </p>
          </motion.div>

          <CapabilityRibbon items={mainIndustries.map((i) => i.name)} delay={0.3} className="mt-10" />

          {/* Jump-link navigation */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex flex-wrap gap-2"
          >
            <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-text-muted self-center mr-2">
              JUMP TO:
            </span>
            {mainIndustries.map((ind) => (
              <a
                key={ind.name}
                href={`#${ind.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="font-mono text-[11px] tracking-[0.08em] uppercase px-3 py-1.5 rounded-md border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                {ind.name}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Industry Details */}
      {mainIndustries.map((ind, idx) => {
        const IconComp = Icons[ind.icon] || Icons.Globe;
        const anchorId = ind.name.toLowerCase().replace(/\s+/g, "-");
        return (
          <div key={ind.name} id={anchorId}>
            <section
              className={`py-20 ${idx % 2 === 1 ? "bg-surface" : "bg-card"}`}
            >
              <div className="section-container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
                  <RevealOnScroll>
                    <div className="w-12 h-12 bg-accent-light rounded-[10px] flex items-center justify-center mb-6 text-primary">
                      <IconComp />
                    </div>
                    <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-4">
                      {ind.name}
                    </h2>
                    <p className="text-[17px] text-text-secondary leading-[1.7]">
                      {ind.detail}
                    </p>
                    {/* CTA removed from individual industry sections — see single CTA below */}
                  </RevealOnScroll>

                  <RevealOnScroll delay={0.2}>
                    <div className="bg-surface border border-border rounded-xl p-8">
                      <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-5">
                        TYPICAL PROBLEMS
                      </div>
                      {ind.useCases.map((uc, ucIdx) => (
                        <motion.div
                          key={uc}
                          initial={{ opacity: 0, x: 12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: ucIdx * 0.1, duration: 0.5 }}
                          className="flex items-center gap-3 py-3.5 border-b border-border last:border-b-0"
                        >
                          <div className="text-primary flex-shrink-0">
                            <Icons.ArrowRight />
                          </div>
                          <span className="text-[15px] text-text-primary">
                            {uc}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </RevealOnScroll>
                </div>
              </div>
            </section>
            {idx < mainIndustries.length - 1 && (
              <hr className="border-t border-border" />
            )}
          </div>
        );
      })}

      {/* Other sectors, quick list */}
      <section className="py-16 bg-surface border-t border-border">
        <div className="section-container">
          <RevealOnScroll>
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-6">
              ALSO ACROSS
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden">
              {otherIndustries.map((ind) => (
                <div key={ind.name} className="bg-card p-6">
                  <h3 className="font-heading text-base font-semibold tracking-[-0.02em] text-text-primary mb-2">
                    {ind.name}
                  </h3>
                  <p className="text-sm text-text-secondary leading-[1.65]">{ind.desc}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Single consolidated CTA after all industries */}
      <section className="py-16 bg-card border-t border-border">
        <div className="section-container">
          <RevealOnScroll>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-heading text-[clamp(20px,2.5vw,28px)] font-semibold tracking-[-0.03em] text-text-primary mb-2">
                  Ready to discuss your use case?
                </h3>
                <p className="text-[15px] text-text-secondary max-w-[480px] leading-[1.65]">
                  Describe the environment and the problem. The first
                  conversation is about the system, not the sales process.
                </p>
              </div>
              <Link
                href="/demo"
                className="font-heading text-[13px] font-medium bg-text-primary text-background rounded-lg px-6 py-3 inline-flex items-center gap-1.5 hover:shadow-lg hover:-translate-y-px transition-all whitespace-nowrap flex-shrink-0"
              >
                Book a Discovery Call <Icons.ArrowRight />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Cross-Industry Benefits */}
      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <RevealOnScroll>
            <div className="text-center mb-14">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">
                CROSS-INDUSTRY
              </div>
              <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] text-text-primary mb-4">
                Universal Capabilities
              </h2>
              <p className="text-[17px] text-text-secondary max-w-[560px] mx-auto leading-[1.65]">
                Capabilities that apply in every sector.
              </p>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crossIndustryBenefits.map((b, i) => (
              <RevealOnScroll key={b.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}
                  className="bg-card border border-border rounded-xl p-8 transition-colors hover:border-border-strong"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 bg-accent-light rounded-[10px] flex items-center justify-center flex-shrink-0 text-primary">
                      <b.Icon size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-semibold tracking-[-0.02em] text-text-primary mb-2">
                        {b.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-[1.65]">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial quote */}
      <section className="py-[80px]">
        <div className="section-container">
          <RevealOnScroll>
            <div className="max-w-[700px] mx-auto text-center">
              <div className="text-[40px] text-primary/20 mb-4">"</div>
              <blockquote className="text-[clamp(20px,3vw,28px)] font-heading font-medium tracking-[-0.02em] text-text-primary leading-[1.4] mb-6">
                Regent brought structure to how we approach partnerships and growth opportunities.
                Their strategic input helped us move faster with more confidence.
              </blockquote>
              <div className="font-mono text-[13px] text-text-muted">
                Managing Director, Trevix Trading LTD
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <CTASection />
    </div>
  );
}