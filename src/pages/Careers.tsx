import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { GradientText } from "@/components/GradientText";
import { Icons } from "@/components/Icons";
import { companyValues, benefits } from "@/data/siteData";
import { PageMeta } from "@/components/PageMeta";
import { supabase } from "@/integrations/supabase/client";

interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
}

export default function CareersPage() {
  const [activeDept, setActiveDept] = useState("All");
  const { data: careers = [], isLoading: loading, isError, refetch } = useQuery({
    queryKey: ["careers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("careers")
        .select("id, title, department, location, type")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Career[];
    },
  });

  const departments = ["All", ...Array.from(new Set(careers.map(c => c.department).filter(Boolean)))];
  const filtered = activeDept === "All" ? careers : careers.filter(c => c.department === activeDept);

  return (
    <div>
      <PageMeta title="Careers — Regent | Join Our Team" description="Join the team engineering infrastructure for the next generation of organizations." />
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[640px]"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">CAREERS</div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              Build the <GradientText shimmer>Future</GradientText>
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px]">
              Join the team engineering infrastructure for the next generation of organizations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">OUR VALUES</div>
            <h2 className="font-heading text-[clamp(24px,3vw,40px)] font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-10">
              What Drives Us
            </h2>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {companyValues.map((v, i) => (
              <RevealOnScroll key={v.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="border border-border rounded-xl p-7 bg-card hover:border-border-strong transition-colors"
                >
                  <div className="w-10 h-10 bg-accent-light rounded-[10px] flex items-center justify-center mb-5 text-primary text-lg">
                    {v.emoji}
                  </div>
                  <div className="font-heading text-base font-semibold tracking-[-0.02em] mb-2 text-text-primary">{v.title}</div>
                  <p className="text-sm text-text-secondary leading-[1.65]">{v.desc}</p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Open Positions */}
      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <RevealOnScroll>
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">OPEN POSITIONS</div>
            <h2 className="font-heading text-[clamp(24px,3vw,40px)] font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-8">
              Join the Team
            </h2>
          </RevealOnScroll>

          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}</div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-8">
                {departments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => setActiveDept(dept)}
                    className={`font-mono text-[11px] tracking-[0.06em] px-4 py-2 rounded-full border transition-all ${
                      activeDept === dept
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-text-secondary border-border hover:border-border-strong hover:text-text-primary"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((job) => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Link to="/demo">
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border rounded-xl p-6 bg-card hover:border-border-strong transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="font-heading text-[16px] font-semibold text-text-primary mb-1">{job.title}</div>
                            <div className="flex flex-wrap items-center gap-3 text-[13px] text-text-muted">
                              <span>{job.department}</span>
                              <span className="w-1 h-1 rounded-full bg-border-strong" />
                              <span>{job.location}</span>
                              <span className="w-1 h-1 rounded-full bg-border-strong" />
                              <span>{job.type}</span>
                            </div>
                          </div>
                          <div className="text-primary shrink-0">
                            <Icons.ArrowRight />
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16 text-text-muted">No open positions in this department.</div>
              )}
            </>
          )}
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Benefits */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">LIFE AT REGENT</div>
            <h2 className="font-heading text-[clamp(24px,3vw,40px)] font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-10">
              Benefits & Perks
            </h2>
          </RevealOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <RevealOnScroll key={b.title} delay={i * 0.08}>
                <div className="border border-border rounded-xl p-6 bg-card">
                  <div className="text-lg mb-3">{b.emoji}</div>
                  <div className="font-heading text-[15px] font-semibold text-text-primary mb-1.5">{b.title}</div>
                  <p className="text-[13px] text-text-secondary leading-[1.65]">{b.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll delay={0.3}>
            <div className="mt-16 text-center">
              <p className="text-text-secondary mb-6">Don't see a role that fits? We're always looking for exceptional people.</p>
              <Link
                to="/demo"
                className="font-heading text-[15px] font-medium bg-primary text-primary-foreground rounded-lg px-7 py-3.5 inline-flex items-center gap-2 hover:bg-primary/90 transition-all"
              >
                Get in Touch <Icons.ArrowRight />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
