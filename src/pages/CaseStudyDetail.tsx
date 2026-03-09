import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageMeta } from "@/components/PageMeta";
import { GradientText } from "@/components/GradientText";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Icons } from "@/components/Icons";
import { ArrowLeft } from "lucide-react";
import { useTrackView } from "@/hooks/useContentTracking";

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  industry: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: { value: string; label: string }[];
  image_url?: string | null;
}

async function fetchRelatedStudies(slug: string) {
  const { data } = await supabase
    .from("case_studies")
    .select("slug, title, industry, summary, image_url")
    .eq("published", true)
    .neq("slug", slug)
    .limit(3);
  return data || [];
}

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const { data: cs, isLoading, error } = useQuery({
    queryKey: ["case_study", slug],
    queryFn: async (): Promise<CaseStudy | null> => {
      const { data, error } = await supabase
        .from("case_studies")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data
        ? {
            ...data,
            results: data.results as string[],
            metrics: data.metrics as { value: string; label: string }[],
            image_url: (data as any).image_url as string | null,
          }
        : null;
    },
    enabled: !!slug,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["case_study_related", slug],
    queryFn: () => fetchRelatedStudies(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    return scrollYProgress.on("change", setProgress);
  }, [scrollYProgress]);

  // Extract h2 headings from challenge + solution HTML for TOC
  const tocSections = useMemo(() => {
    if (!cs) return [];
    const sections: { id: string; text: string }[] = [
      { id: "the-challenge", text: "The Challenge" },
      { id: "the-solution", text: "The Solution" },
      { id: "key-results", text: "Key Results" },
    ];
    // Also extract any h2s from challenge/solution content
    const allContent = (cs.challenge || "") + (cs.solution || "");
    const matches = [...allContent.matchAll(/<h2>(.*?)<\/h2>/g)];
    matches.forEach((m, i) => {
      sections.splice(sections.length - 1, 0, { id: `sub-heading-${i}`, text: m[1] });
    });
    return sections;
  }, [cs]);

  // Add IDs to h2 tags in HTML content
  const processHtml = (html: string, prefix: string) => {
    let idx = 0;
    return html.replace(/<h2>/g, () => `<h2 id="${prefix}-sub-${idx++}">`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div>
        <section className="pt-[120px] pb-20 border-b border-border bg-surface">
          <div className="section-container max-w-[800px]">
            <div className="h-8 w-48 bg-card border border-border rounded animate-pulse mb-6" />
            <div className="h-12 w-full bg-card border border-border rounded animate-pulse mb-4" />
            <div className="h-6 w-3/4 bg-card border border-border rounded animate-pulse" />
          </div>
        </section>
      </div>
    );
  }

  if (error || !cs) {
    return (
      <div className="pt-[140px] pb-[100px]">
        <div className="section-container text-center">
          <h1 className="font-heading text-3xl font-semibold text-text-primary mb-4">Case study not found</h1>
          <Link to="/case-studies" className="text-primary hover:underline inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to case studies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`${cs.title} — Regent Case Study`}
        description={cs.summary}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": cs.title,
          "description": cs.summary,
          "publisher": { "@type": "Organization", "name": "Regent Systems" },
        }}
      />

      {/* Reading progress bar */}
      <motion.div
        className="fixed top-16 left-0 right-0 h-[3px] bg-primary z-[99] origin-left"
        style={{ scaleX: progress }}
      />

      {/* Hero */}
      <section className="pt-[120px] pb-20 border-b border-border bg-surface">
        <div className="section-container max-w-[800px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Breadcrumbs */}
            <div className="font-mono text-xs text-text-muted mb-6 flex items-center gap-2 flex-wrap">
              <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors">Home</Link>
              <span className="text-border-strong">→</span>
              <Link to="/case-studies" className="text-text-secondary hover:text-text-primary transition-colors">Case Studies</Link>
              <span className="text-border-strong">→</span>
              {cs.industry}
            </div>

            <span className="font-mono text-[11px] tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-accent-light text-primary border border-primary/20 inline-block mb-6">
              {cs.industry}
            </span>

            <h1 className="font-heading text-[clamp(28px,4vw,48px)] font-semibold tracking-[-0.03em] leading-[1.1] mb-6">
              {cs.title}
            </h1>

            <p className="text-lg text-text-secondary leading-[1.7] mb-8">{cs.summary}</p>

            {/* Metrics */}
            {cs.metrics.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {cs.metrics.map((m, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5 text-center">
                    <div className="font-heading text-[26px] font-semibold tracking-[-0.04em] text-primary">{m.value}</div>
                    <div className="text-[13px] text-text-muted mt-1">{m.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <button onClick={handleCopyLink} className="text-[12px] font-medium text-text-secondary border border-border rounded-lg px-3 py-1.5 hover:bg-surface hover:text-text-primary transition-all">
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(cs.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-text-secondary border border-border rounded-lg px-3 py-1.5 hover:bg-surface hover:text-text-primary transition-all">
                Twitter
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-text-secondary border border-border rounded-lg px-3 py-1.5 hover:bg-surface hover:text-text-primary transition-all">
                LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover image — full width below hero */}
      {cs.image_url && (
        <div className="border-b border-border">
          <div className="section-container max-w-[960px]">
            <div className="rounded-2xl overflow-hidden border border-border -mt-0 my-0">
              <img src={cs.image_url} alt={cs.title} className="w-full h-auto object-cover max-h-[480px]" />
            </div>
          </div>
        </div>
      )}

      {/* Content body + TOC sidebar */}
      <section className="py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-16 max-w-[960px] mx-auto">
            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-0"
            >
              {/* Challenge Section */}
              <div id="the-challenge" className="scroll-mt-24 mb-16">
                <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-primary mb-4">The Challenge</div>
                <div
                  className="prose-regent text-[17px] leading-[1.85] text-text-secondary [&_h2]:font-heading [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-text-primary [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-[1.2] [&_p]:mb-6 [&_img]:rounded-xl [&_img]:border [&_img]:border-border [&_img]:my-8 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_li]:mb-2"
                  dangerouslySetInnerHTML={{ __html: processHtml(cs.challenge, "challenge") }}
                />
              </div>

              {/* Solution Section */}
              <div id="the-solution" className="scroll-mt-24 mb-16">
                <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-primary mb-4">The Solution</div>
                <div
                  className="prose-regent text-[17px] leading-[1.85] text-text-secondary [&_h2]:font-heading [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-text-primary [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-[1.2] [&_p]:mb-6 [&_img]:rounded-xl [&_img]:border [&_img]:border-border [&_img]:my-8 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_li]:mb-2"
                  dangerouslySetInnerHTML={{ __html: processHtml(cs.solution, "solution") }}
                />
              </div>

              {/* Results Section */}
              <div id="key-results" className="scroll-mt-24 mb-16">
                <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-primary mb-4">Key Results</div>
                <ul className="space-y-4">
                  {cs.results.map((r, j) => (
                    <li key={j} className="flex items-start gap-3 text-[17px] text-text-secondary leading-[1.7]">
                      <span className="text-primary mt-1 shrink-0"><Icons.Check /></span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer nav */}
              <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link to="/case-studies" className="font-heading text-[13px] font-medium bg-transparent text-text-primary border border-border-strong rounded-lg px-[18px] py-[9px] inline-flex items-center gap-1.5 hover:bg-surface transition-all">
                  ← Back to Case Studies
                </Link>
                <Link to="/demo" className="font-heading text-[13px] font-medium bg-text-primary text-background rounded-lg px-[18px] py-[9px] inline-flex items-center gap-1.5 hover:shadow-lg hover:-translate-y-px transition-all">
                  Request a Demo <Icons.ArrowRight />
                </Link>
              </div>
            </motion.div>

            {/* TOC Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-4">ON THIS PAGE</div>
                <nav className="flex flex-col gap-2.5">
                  {tocSections.map(s => (
                    <a key={s.id} href={`#${s.id}`} className="text-[13px] text-text-secondary hover:text-primary transition-colors leading-snug">
                      {s.text}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related case studies */}
      {related.length > 0 && (
        <section className="py-[100px] bg-surface border-t border-border">
          <div className="section-container">
            <RevealOnScroll>
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">MORE CASE STUDIES</div>
              <h2 className="font-heading text-[clamp(24px,3vw,36px)] font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-10">
                Explore Similar <GradientText>Results</GradientText>
              </h2>
            </RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r: any, i: number) => (
                <RevealOnScroll key={r.slug} delay={i * 0.1}>
                  <Link to={`/case-studies/${r.slug}`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all">
                    {r.image_url && (
                      <div className="h-[180px] overflow-hidden">
                        <img src={r.image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-6">
                      <span className="font-mono text-[10px] tracking-[0.06em] px-2 py-0.5 rounded-full bg-accent-light text-primary border border-primary/20 inline-block mb-3">
                        {r.industry}
                      </span>
                      <h3 className="font-heading text-[17px] font-semibold tracking-[-0.02em] text-text-primary mb-2 group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-[14px] text-text-muted leading-[1.6] line-clamp-2">{r.summary}</p>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
