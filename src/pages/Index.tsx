import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Icons } from "@/components/Icons";
import { SectionHeader } from "@/components/SectionHeader";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CapabilityCard, ArchitectureLayer, ModuleCard, IndustryCard, BlogCard, CTASection } from "@/components/CardComponents";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { GradientText } from "@/components/GradientText";
import { LogoMarquee } from "@/components/LogoMarquee";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { capabilities, archLayers, modules, industries } from "@/data/siteData";
import { PageMeta } from "@/components/PageMeta";
import { supabase } from "@/integrations/supabase/client";

const metrics = [
  { n: "400+", l: "Systems Delivered" },
  { n: "99.99%", l: "System Uptime SLA" },
  { n: "2.4B+", l: "Daily Events Processed" },
  { n: "50+", l: "Enterprise Clients" },
];

// Staggered word reveal for the headline
function StaggeredHeadline() {
  const line1 = ["Infrastructure", "for", "the"];
  const line2 = ["Next", "Generation"];
  const line3 = ["of", "Systems"];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const word = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      className="text-[clamp(40px,6vw,76px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6"
    >
      {line1.map((w, i) => (
        <motion.span key={i} variants={word} className="inline-block mr-[0.3em]">
          {w}
        </motion.span>
      ))}
      <br className="hidden md:block" />
      {line2.map((w, i) => (
        <motion.span key={`l2-${i}`} variants={word} className="inline-block mr-[0.3em]">
          <GradientText shimmer>{w}</GradientText>
        </motion.span>
      ))}
      <br className="hidden md:block" />
      {line3.map((w, i) => (
        <motion.span key={`l3-${i}`} variants={word} className="inline-block mr-[0.3em]">
          {w}
        </motion.span>
      ))}
    </motion.h1>
  );
}

export default function HomePage() {
  const [blogPosts, setBlogPosts] = useState<Array<{ slug: string; title: string; excerpt: string; category: string; readTime: string; date: string; author: string; content: string; image_url?: string | null }>>([]);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("slug, title, excerpt, category, read_time, date, author, image_url")
      .eq("published", true)
      .order("date", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setBlogPosts(data.map(p => ({ ...p, readTime: p.read_time, content: "" })));
      });
  }, []);

  return (
    <div>
      <PageMeta
        title="Regent — Enterprise Systems Builder"
        description="Regent architects and builds enterprise systems that connect data, workflows, and intelligence across organizations."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Regent Systems",
          "url": "https://regent.systems",
          "description": "Regent architects and builds enterprise systems that connect data, workflows, and intelligence across organizations.",
          "foundingDate": "2018",
          "sameAs": [],
        }}
      />
      {/* Hero */}
      <section className="pt-[140px] pb-[100px] relative overflow-hidden bg-card">
        <AnimatedBackground />
        <div className="section-container relative z-10">
          <div className="max-w-[800px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 bg-accent-light border border-primary/20 rounded-full px-3.5 py-1.5 mb-8"
            >
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-dot" />
              <span className="font-mono text-[11px] tracking-[0.08em] text-primary">
                ENTERPRISE SYSTEMS BUILDER
              </span>
            </motion.div>

            <StaggeredHeadline />

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px] mb-10"
            >
              Regent architects and builds enterprise systems that connect data, workflows, and intelligence across organizations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                to="/demo"
                className="font-heading text-[15px] font-medium bg-primary text-primary-foreground rounded-lg px-7 py-3.5 inline-flex items-center justify-center gap-2 hover:shadow-[0_8px_24px_rgba(79,70,229,0.25)] hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                Start a Project <Icons.ArrowRight />
              </Link>
              <Link
                to="/platform"
                className="font-heading text-[15px] font-medium bg-transparent text-text-primary border border-border-strong rounded-lg px-7 py-3.5 inline-flex items-center justify-center gap-2 hover:bg-surface hover:border-text-muted hover:-translate-y-px transition-all w-full sm:w-auto"
              >
                Explore Our Capabilities
              </Link>
            </motion.div>
          </div>

          {/* Metrics with animated counters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 border border-border rounded-xl overflow-hidden"
          >
            {metrics.map((s, i) => (
              <div
                key={i}
                className={`px-6 md:px-8 py-5 md:py-7 ${i % 2 === 0 ? "bg-card" : "bg-surface"} ${i < 2 ? "border-b md:border-b-0 border-border" : ""} ${i % 2 !== 0 && i < 3 ? "border-l border-border" : ""} ${i % 2 === 0 && i > 0 ? "max-md:border-l-0" : ""} ${i < 3 ? "md:border-r md:border-r-border" : ""}`}
              >
                <AnimatedCounter
                  value={s.n}
                  className="font-heading text-[32px] font-semibold tracking-[-0.04em] text-text-primary block"
                />
                <div className="text-[13px] text-text-muted mt-1">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Logo Marquee */}
      <LogoMarquee />

      {/* Capabilities */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <SectionHeader
              label="CAPABILITIES"
              title="Everything your organization needs"
              subtitle="Complete capabilities in systems integration, data infrastructure, automation, and intelligence — deployed at enterprise scale."
            />
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {capabilities.slice(0, 3).map((c, i) => (
              <CapabilityCard key={c.title} {...c} delay={i + 1} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {capabilities.slice(3).map((c, i) => (
              <CapabilityCard key={c.title} {...c} delay={i + 1} />
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Architecture */}
      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
            <RevealOnScroll>
              <SectionHeader
                label="SYSTEM ARCHITECTURE"
                title="Regent System Architecture"
                subtitle="A unified infrastructure connecting data, workflows, and intelligence across organizations."
              />
              <div className="mt-8">
                <Link
                  to="/platform"
                  className="font-heading text-[13px] font-medium bg-text-primary text-background rounded-lg px-[18px] py-[9px] inline-flex items-center gap-1.5 hover:shadow-lg hover:-translate-y-px transition-all"
                >
                  View How We Build <Icons.ArrowRight />
                </Link>
              </div>
            </RevealOnScroll>
            <div className="flex flex-col">
              {archLayers.map((layer, i) => (
                <ArchitectureLayer key={layer.name} layer={layer} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Modules */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <SectionHeader
              label="SOLUTION MODULES"
              title="How We Build"
              subtitle="Five integrated modules we deploy as a complete system or independently — tailored to each client."
            />
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {modules.slice(0, 3).map((m, i) => (
              <ModuleCard key={m.name} mod={m} delay={i + 1} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {modules.slice(3).map((m, i) => (
              <ModuleCard key={m.name} mod={m} delay={i + 1} />
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Testimonials */}
      <TestimonialCarousel />

      <hr className="border-t border-border" />

      {/* Industries */}
      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <RevealOnScroll>
            <SectionHeader
              label="INDUSTRIES"
              title="Built for Complex Organizations"
              subtitle="Regent serves organizations where operational complexity demands institutional-grade infrastructure."
            />
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {industries.slice(0, 3).map((ind, i) => (
              <IndustryCard key={ind.name} {...ind} delay={i + 1} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {industries.slice(3).map((ind, i) => (
              <IndustryCard key={ind.name} {...ind} delay={i + 1} />
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Insights */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">INSIGHTS</div>
                <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-2">Insights</h2>
                <p className="text-lg font-light text-text-secondary leading-relaxed max-w-[480px]">
                  Research and perspectives on systems infrastructure and enterprise technology.
                </p>
              </div>
              <Link
                to="/blog"
                className="font-heading text-[13px] font-medium bg-transparent text-text-primary border border-border-strong rounded-lg px-[18px] py-[9px] inline-flex items-center gap-1.5 hover:bg-surface hover:-translate-y-px transition-all shrink-0"
              >
                View All Articles <Icons.ArrowRight />
              </Link>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
              <BlogCard key={post.slug} post={post} delay={i + 1} />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
