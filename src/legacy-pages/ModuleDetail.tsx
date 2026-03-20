import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { modules } from "@/data/siteData";
import { Icons } from "@/components/Icons";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { PageMeta } from "@/components/PageMeta";
import { CTASection } from "@/components/CardComponents";

export default function ModuleDetail() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const mod = modules.find(m => m.slug === moduleSlug);

  if (!mod) return <Navigate to="/platform" replace />;

  const moduleIndex = modules.findIndex(m => m.slug === moduleSlug);
  const prevModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
  const nextModule = moduleIndex < modules.length - 1 ? modules[moduleIndex + 1] : null;

  return (
    <div>
      <PageMeta
        title={`${mod.name} — Regent | Systems Infrastructure`}
        description={mod.desc}
      />

      {/* Hero */}
      <section className="pt-[100px] pb-20 bg-surface border-b border-border">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/platform" className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-primary transition-colors mb-8">
              <Icons.ArrowLeft /> Back to Solutions
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[13px] tracking-[0.08em] text-primary bg-accent-light border border-primary/20 rounded-full px-3 py-1">
                MODULE {mod.num}
              </span>
            </div>
            <h1 className="text-[clamp(36px,5vw,60px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              {mod.name}
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[680px]">
              {mod.longDesc}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <div className="mb-14">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">CAPABILITIES</div>
              <h2 className="font-heading text-[clamp(24px,3vw,40px)] font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary">
                Key Features
              </h2>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mod.features.map((feature, i) => (
              <RevealOnScroll key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}
                  className="bg-card border border-border rounded-xl p-7 transition-colors hover:border-border-strong h-full"
                >
                  <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center mb-4 text-primary">
                    <span className="font-mono text-[11px] font-bold">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="font-heading text-[15px] font-semibold tracking-[-0.02em] mb-2 text-text-primary">{feature.title}</div>
                  <p className="text-sm text-text-secondary leading-[1.65]">{feature.desc}</p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-[100px] bg-surface border-y border-border">
        <div className="section-container">
          <RevealOnScroll>
            <div className="mb-14">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">SPECIFICATIONS</div>
              <h2 className="font-heading text-[clamp(24px,3vw,40px)] font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary">
                Technical Specifications
              </h2>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mod.specs.map((spec, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6">
                  <div className="font-mono text-[11px] tracking-[0.06em] uppercase text-text-muted mb-2">{spec.label}</div>
                  <div className="font-heading text-lg font-semibold tracking-[-0.02em] text-text-primary">{spec.value}</div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <div className="mb-14">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">APPLICATIONS</div>
              <h2 className="font-heading text-[clamp(24px,3vw,40px)] font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary">
                Common Use Cases
              </h2>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mod.useCases.map((uc, i) => (
              <RevealOnScroll key={i} delay={i * 0.06}>
                <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-5">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-[15px] text-text-primary font-medium">{uc}</span>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Position */}
      <section className="py-[80px] bg-surface border-y border-border">
        <div className="section-container">
          <RevealOnScroll>
            <div className="max-w-[600px] mx-auto">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4 text-center">ARCHITECTURE</div>
              <h2 className="font-heading text-[clamp(20px,2.5vw,28px)] font-semibold tracking-[-0.03em] leading-[1.2] text-text-primary text-center mb-10">
                Where {mod.name} Fits in the Stack
              </h2>
              <div className="flex flex-col gap-2">
                {modules.map((m, i) => (
                  <div
                    key={m.slug}
                    className={`rounded-xl border p-4 flex items-center gap-4 transition-all ${
                      m.slug === moduleSlug
                        ? "bg-primary/5 border-primary/30 ring-2 ring-primary/10"
                        : "bg-card border-border opacity-50"
                    }`}
                  >
                    <span className="font-mono text-[11px] text-text-muted w-6">{m.num}</span>
                    <span className={`font-heading text-[14px] font-semibold ${m.slug === moduleSlug ? "text-primary" : "text-text-primary"}`}>
                      {m.name}
                    </span>
                    {m.slug === moduleSlug && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-[11px] font-mono text-primary bg-accent-light border border-primary/20 rounded-full px-2 py-0.5"
                      >
                        CURRENT
                      </motion.span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 border-b border-border">
        <div className="section-container">
          <div className="flex justify-between items-center">
            {prevModule ? (
              <Link to={`/platform/${prevModule.slug}`} className="flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary transition-colors">
                <Icons.ArrowLeft /> {prevModule.name}
              </Link>
            ) : <div />}
            {nextModule ? (
              <Link to={`/platform/${nextModule.slug}`} className="flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary transition-colors">
                {nextModule.name} <Icons.ArrowRight />
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
