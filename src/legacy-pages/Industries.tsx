"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CTASection } from "@/components/CardComponents";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { GradientText } from "@/components/GradientText";
import { industriesDetailed } from "@/data/siteData";
import { PageMeta } from "@/components/PageMeta";

const industryStats = [
  { label: "Industries Served", value: "12+" },
  { label: "Enterprise Clients", value: "400+" },
  { label: "Countries", value: "34" },
  { label: "Projects Delivered", value: "600+" },
];

const crossIndustryBenefits = [
  { title: "Regulatory Compliance", desc: "We design and implement compliance-ready integration architectures for GDPR, SOX, HIPAA, PCI-DSS, and industry-specific regulations.", icon: "Shield" as const },
  { title: "Legacy Modernization", desc: "Our engineers connect decades-old systems to modern platforms — without migration risk or operational disruption.", icon: "Database" as const },
  { title: "Real-Time Operations", desc: "We build sub-second data synchronization across all connected systems for time-critical operational decisions.", icon: "Zap" as const },
  { title: "Operational Intelligence", desc: "Our teams embed AI-powered insights that span system boundaries, revealing patterns invisible to siloed analytics.", icon: "Intelligence" as const },
];

export default function IndustriesPage() {
  return (
    <div>
      <PageMeta title="Industries — Regent | Sector-Specific Solutions" description="Regent serves industries where operational complexity demands infrastructure that works — without exception." />
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
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">INDUSTRIES</div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              Deep expertise in sectors that <GradientText>cannot afford failure</GradientText>
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px]">
              Regent delivers integration consulting and engineering for industries where operational complexity demands expertise—not just technology.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10"
          >
            {industryStats.map((stat, i) => (
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

      {/* Industry Details */}
      {industriesDetailed.map((ind, idx) => {
        const IconComp = Icons[ind.icon] || Icons.Globe;
        return (
          <div key={ind.name}>
            <section className={`py-20 ${idx % 2 === 1 ? 'bg-surface' : 'bg-card'}`}>
              <div className="section-container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
                  <RevealOnScroll>
                    <div className="w-12 h-12 bg-accent-light rounded-[10px] flex items-center justify-center mb-6 text-primary">
                      <IconComp />
                    </div>
                    <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-4">{ind.name}</h2>
                    <p className="text-[17px] text-text-secondary leading-[1.7] mb-8">{ind.detail}</p>
                    <Link
                      href="/demo"
                      className="font-heading text-[13px] font-medium bg-text-primary text-background rounded-lg px-[18px] py-[9px] inline-flex items-center gap-1.5 hover:shadow-lg hover:-translate-y-px transition-all"
                    >
                      Discuss Your Use Case <Icons.ArrowRight />
                    </Link>
                  </RevealOnScroll>
                  <RevealOnScroll delay={0.2}>
                    <div className="bg-surface border border-border rounded-xl p-8">
                      <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-5">EXAMPLE USE CASES</div>
                      {ind.useCases.map((uc, ucIdx) => (
                        <motion.div
                          key={uc}
                          initial={{ opacity: 0, x: 12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: ucIdx * 0.1, duration: 0.5 }}
                          className="flex items-center gap-3 py-3.5 border-b border-border last:border-b-0"
                        >
                          <div className="text-primary flex-shrink-0"><Icons.ArrowRight /></div>
                          <span className="text-[15px] text-text-primary">{uc}</span>
                        </motion.div>
                      ))}
                    </div>
                  </RevealOnScroll>
                </div>
              </div>
            </section>
            {idx < industriesDetailed.length - 1 && <hr className="border-t border-border" />}
          </div>
        );
      })}

      <hr className="border-t border-border" />

      {/* Cross-Industry Benefits */}
      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <RevealOnScroll>
            <div className="text-center mb-14">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">CROSS-INDUSTRY</div>
              <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] text-text-primary mb-4">
                Universal Capabilities
              </h2>
              <p className="text-[17px] text-text-secondary max-w-[560px] mx-auto leading-[1.65]">
                Core capabilities that deliver value regardless of industry vertical.
              </p>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crossIndustryBenefits.map((b, i) => {
              const BIcon = Icons[b.icon];
              return (
                <RevealOnScroll key={b.title} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}
                    className="bg-card border border-border rounded-xl p-8 transition-colors hover:border-border-strong"
                  >
                    <div className="flex items-start gap-5">
                      <div className="w-10 h-10 bg-accent-light rounded-[10px] flex items-center justify-center flex-shrink-0 text-primary">
                        <BIcon />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-semibold tracking-[-0.02em] text-text-primary mb-2">{b.title}</h3>
                        <p className="text-sm text-text-secondary leading-[1.65]">{b.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trusted by quote */}
      <section className="py-[80px]">
        <div className="section-container">
          <RevealOnScroll>
            <div className="max-w-[700px] mx-auto text-center">
              <div className="text-[40px] text-primary/20 mb-4">"</div>
              <blockquote className="text-[clamp(20px,3vw,28px)] font-heading font-medium tracking-[-0.02em] text-text-primary leading-[1.4] mb-6">
                Regent eliminated three years of integration debt in six months. Our systems now communicate as if they were designed together.
              </blockquote>
              <div className="font-mono text-[13px] text-text-muted">
                CTO, Tier-1 European Bank
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
