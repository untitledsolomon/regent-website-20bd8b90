"use client";

import { motion } from "framer-motion";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { GradientText } from "@/components/GradientText";
import { Icons } from "@/components/Icons";
import { PageMeta } from "@/components/PageMeta";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const heroStats = [
  { value: "6+", label: "Systems Delivered" },
  { value: "99.99%", label: "System Uptime SLA" },
  { value: "1.4M+", label: "Daily Events Processed" },
  { value: "2+", label: "Enterprise Clients" },
];

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  industry: string;
  summary: string;
  image_url: string | null;
  metrics: { value: string; label: string }[];
}

export default function CaseStudiesPage() {
  const supabase = createClient();

  const fetchCaseStudies = async (): Promise<CaseStudy[]> => {
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(d => ({
      ...d,
      metrics: d.metrics as { value: string; label: string }[],
    }));
  };

  const { data: caseStudies = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["case_studies"],
    queryFn: fetchCaseStudies,
  });

  return (
    <div>
      <PageMeta title="Case Studies — Regent | Client Success Stories" description="See how leading organizations have transformed their infrastructure with Regent." />
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[640px] mb-12"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">CASE STUDIES</div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              Proven <GradientText shimmer>Results</GradientText>
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px]">
              See how leading organizations have transformed their infrastructure with Regent.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {heroStats.map((s, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
                <AnimatedCounter value={s.value} className="font-heading text-[28px] font-semibold tracking-[-0.04em] text-text-primary block" />
                <div className="text-[13px] text-text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-[100px]">
        <div className="section-container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-card border border-border rounded-2xl animate-pulse" />)}
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">Unable to load case studies</h2>
              <p className="text-text-secondary mb-6">Something went wrong. Please try again.</p>
              <button onClick={() => refetch()} className="font-heading text-sm font-medium bg-primary text-primary-foreground rounded-lg px-6 py-3 hover:bg-primary/90 transition-all">Retry</button>
            </div>
          ) : (
            caseStudies.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent-light flex items-center justify-center text-primary">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">No case studies published yet</h3>
                <p className="text-sm text-text-muted">Check back soon — client success stories are on the way.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caseStudies.map((cs, i) => (
                <RevealOnScroll key={cs.id} delay={i * 0.1}>
                  <Link
                    href={`/case-studies/${cs.slug}`}
                    className={`block border border-border rounded-2xl overflow-hidden bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group h-full ${i === 0 ? 'md:col-span-2' : ''}`}
                  >
                    {cs.image_url && (
                      <div className={`w-full overflow-hidden ${i === 0 ? 'h-[280px]' : 'h-[200px]'}`}>
                        <img
                          src={cs.image_url}
                          alt={cs.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex flex-col md:items-start md:justify-between gap-4 mb-4">
                        <div>
                          <span className="font-mono text-[11px] tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-accent-light text-primary border border-primary/20 inline-block mb-3">
                            {cs.industry}
                          </span>
                          <h3 className="font-heading text-[22px] md:text-[26px] font-semibold tracking-[-0.03em] leading-[1.2] text-text-primary group-hover:text-primary transition-colors">
                            {cs.title}
                          </h3>
                        </div>
                        <div className="flex gap-6 shrink-0">
                          <div className="flex flex-wrap gap-6 w-full">
                            {cs.metrics.map((m, j) => (
                              <div
                                key={j}
                                className="text-center min-w-[80px] max-w-[120px] flex-1 break-words max-h-[60px] overflow-hidden"
                              >
                                <div className="font-heading text-xl font-semibold text-primary">{m.value}</div>
                                <div className="text-[11px] text-text-muted">
                                  {m.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-[15px] text-text-secondary leading-[1.7] mb-4">{cs.summary}</p>
                      <span className="text-[13px] text-primary font-medium inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                        Read case study <Icons.ArrowRight />
                      </span>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
