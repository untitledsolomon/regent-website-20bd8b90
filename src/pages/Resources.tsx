import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ResourceCard, CTASection } from "@/components/CardComponents";
import { GradientText } from "@/components/GradientText";
import { Icons } from "@/components/Icons";
import { PageMeta } from "@/components/PageMeta";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { trackDownload } from "@/hooks/useContentTracking";

const types = ["All", "Whitepaper", "Research", "Documentation", "Case Study"];

interface DbResource {
  id: string;
  slug: string;
  title: string;
  type: string;
  description: string;
  file_url: string | null;
  featured: boolean;
}

async function fetchResources(): Promise<DbResource[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export default function ResourcesPage() {
  const [filter, setFilter] = useState("All");
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const { data: resources = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["resources"],
    queryFn: fetchResources,
  });

  const handleSubscribe = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setSubscribing(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: trimmed, source: "resources" });
      if (error && error.code !== "23505") throw error;
      setEmail("");
      supabase.functions.invoke("newsletter-welcome", { body: { email: trimmed } }).catch(() => {});
    } catch {
      // silent
    } finally {
      setSubscribing(false);
    }
  };

  const filtered = filter === "All" ? resources : resources.filter(r => r.type === filter);
  const featuredResource = resources.find(r => r.featured) || resources[0];

  if (isLoading) {
    return (
      <div>
        <PageMeta title="Resources — Regent | Guides, Whitepapers & Reports" description="Technical whitepapers, research, documentation, and case studies for enterprise architects and technology leaders." />
        <section className="pt-[140px] pb-[100px] bg-surface border-b border-border">
          <div className="section-container">
            <div className="h-12 w-64 bg-card border border-border rounded-lg animate-pulse mb-4" />
            <div className="h-6 w-96 bg-card border border-border rounded-lg animate-pulse" />
          </div>
        </section>
        <section className="py-20">
          <div className="section-container grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-[240px] bg-card border border-border rounded-xl animate-pulse" />)}
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <PageMeta title="Resources — Regent" description="Technical resources for enterprise architects." />
        <section className="pt-[140px] pb-[100px]">
          <div className="section-container text-center">
            <h1 className="font-heading text-2xl font-semibold text-text-primary mb-4">Unable to load resources</h1>
            <p className="text-text-secondary mb-6">Something went wrong. Please try again.</p>
            <button onClick={() => refetch()} className="font-heading text-sm font-medium bg-primary text-primary-foreground rounded-lg px-6 py-3 hover:bg-primary/90 transition-all">
              Retry
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="Resources — Regent | Guides, Whitepapers & Reports" description="Technical whitepapers, research, documentation, and case studies for enterprise architects and technology leaders." />
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[720px]"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">RESOURCES</div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              Technical content for <GradientText>practitioners</GradientText>
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px]">
              Whitepapers, research, documentation, and case studies for enterprise architects and technology leaders.
            </p>
          </motion.div>
        </div>
      </section>

      {featuredResource && (
        <section className="py-16">
          <div className="section-container">
            <RevealOnScroll>
              <motion.div
                whileHover={{ boxShadow: "0 12px 40px rgba(79,70,229,0.1)" }}
                className="bg-accent-light border border-primary/15 rounded-2xl p-10 md:p-14 relative overflow-hidden transition-all"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.08)_0%,transparent_60%)]" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
                  <div>
                    <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-primary mb-3 inline-block">FEATURED RESOURCE</span>
                    <h2 className="font-heading text-[clamp(24px,3vw,36px)] font-semibold tracking-[-0.03em] text-text-primary mb-4 leading-[1.2]">
                      {featuredResource.title}
                    </h2>
                    <p className="text-[15px] text-text-secondary leading-[1.7] max-w-[520px]">{featuredResource.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {featuredResource.file_url ? (
                      <button
                        onClick={async () => {
                          trackDownload(featuredResource.id);
                          const fileUrl = featuredResource.file_url!;
                          try {
                            const response = await fetch(fileUrl);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = fileUrl.split("/").pop() || "download";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          } catch {
                            window.open(fileUrl, "_blank", "noopener");
                          }
                        }}
                        className="font-heading text-[15px] font-medium bg-primary text-primary-foreground rounded-lg px-7 py-3.5 inline-flex items-center gap-2 hover:shadow-[0_8px_24px_rgba(79,70,229,0.25)] transition-all"
                      >
                        Download PDF <Icons.ArrowRight />
                      </button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="font-heading text-[15px] font-medium bg-primary text-primary-foreground rounded-lg px-7 py-3.5 inline-flex items-center gap-2 hover:shadow-[0_8px_24px_rgba(79,70,229,0.25)] transition-all"
                      >
                        Download PDF <Icons.ArrowRight />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      <section className="py-20">
        <div className="section-container">
          <RevealOnScroll>
            <div className="flex gap-2 mb-12 flex-wrap">
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`font-mono text-xs tracking-[0.06em] uppercase px-4 py-[7px] rounded-full border transition-all cursor-pointer ${
                    filter === t
                      ? "border-primary bg-accent-light text-primary"
                      : "border-border bg-card text-text-secondary hover:border-border-strong"
                  }`}
                >
                  {t}
                </button>
              ))}
              <span className="font-mono text-xs text-text-muted self-center ml-2">
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </span>
            </div>
          </RevealOnScroll>
          {resources.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent-light flex items-center justify-center text-primary">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">No resources published yet</h3>
              <p className="text-sm text-text-muted">Check back soon — whitepapers and guides are on the way.</p>
            </div>
          ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {filtered.map((res, i) => (
                <ResourceCard
                  key={res.id}
                  res={{ type: res.type, title: res.title, desc: res.description }}
                  fileUrl={res.file_url}
                  resourceId={res.id}
                  delay={Math.min(i + 1, 5)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
          )}
        </div>
      </section>

      <section className="py-[80px] bg-surface border-t border-border">
        <div className="section-container">
          <RevealOnScroll>
            <div className="max-w-[560px] mx-auto text-center">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">STAY UPDATED</div>
              <h2 className="font-heading text-[clamp(24px,3vw,36px)] font-semibold tracking-[-0.03em] text-text-primary mb-4">
                Get new resources delivered
              </h2>
              <p className="text-[15px] text-text-secondary leading-[1.65] mb-8">
                Join 2,400+ enterprise architects and technology leaders who receive our latest whitepapers, research, and case studies.
              </p>
              <div className="flex gap-3 max-w-[420px] mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 font-mono text-sm px-4 py-3 rounded-lg border border-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="font-heading text-[13px] font-medium bg-text-primary text-background rounded-lg px-5 py-3 hover:shadow-lg transition-all flex-shrink-0 disabled:opacity-50"
                >
                  {subscribing ? "..." : "Subscribe"}
                </motion.button>
              </div>
              <p className="text-xs text-text-muted mt-3">No spam. Unsubscribe anytime.</p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
