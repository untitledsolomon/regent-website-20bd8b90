import { Icons, type IconName } from "./Icons";
import { RevealOnScroll } from "./RevealOnScroll";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { BlogPost, Resource, ArchLayer } from "@/data/siteData";
import { archLayers } from "@/data/siteData";
import { trackDownload } from "@/hooks/useContentTracking";
import { toast } from "@/hooks/use-toast";

/* CapabilityCard */
export function CapabilityCard({ icon, title, desc, delay = 0 }: { icon: IconName; title: string; desc: string; delay?: number }) {
  const IconComp = Icons[icon] || Icons.Integration;
  return (
    <RevealOnScroll delay={delay * 0.1}>
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}
        className="bg-card border border-border rounded-xl p-7 transition-colors hover:border-border-strong"
      >
        <div className="w-10 h-10 bg-accent-light rounded-[10px] flex items-center justify-center mb-5 text-primary">
          <IconComp />
        </div>
        <div className="font-heading text-base font-semibold tracking-[-0.02em] mb-2 text-text-primary">{title}</div>
        <p className="text-sm text-text-secondary leading-[1.65]">{desc}</p>
      </motion.div>
    </RevealOnScroll>
  );
}

/* ArchitectureLayer */
export function ArchitectureLayer({ layer, index }: { layer: ArchLayer; index: number }) {
  return (
    <RevealOnScroll delay={index * 0.1}>
      <motion.div
        whileHover={{ borderColor: "hsl(232 85% 74%)", boxShadow: "0 0 0 3px hsl(226 100% 97%)" }}
        className="border border-border rounded-[10px] p-5 flex items-center gap-5 bg-card transition-all cursor-default"
      >
        <div
          className="w-2 h-2 rounded-full bg-primary flex-shrink-0 animate-pulse-dot"
          style={{ animationDelay: `${index * 0.3}s` }}
        />
        <div className="flex-1">
          <div className="font-heading text-[15px] font-semibold mb-0.5">{layer.name}</div>
          <div className="text-[13px] text-text-secondary">{layer.desc}</div>
        </div>
        <div className="font-mono text-[11px] bg-accent-light text-primary border border-primary/15 rounded-full px-2.5 py-0.5">
          Layer {String(archLayers.length - index).padStart(2, "0")}
        </div>
      </motion.div>
      {index < archLayers.length - 1 && <div className="w-px h-4 bg-border mx-auto" />}
    </RevealOnScroll>
  );
}

/* ModuleCard */
export function ModuleCard({ mod, delay = 0 }: { mod: { name: string; num: string; slug?: string; desc: string }; delay?: number }) {
  const content = (
    <motion.div
      whileHover={{ y: -4, backgroundColor: "hsl(0 0% 100%)", borderColor: "hsl(var(--accent))", boxShadow: "0 8px 32px rgba(79,70,229,0.1)" }}
      className="bg-surface border border-border rounded-xl p-7 transition-all"
    >
      <div className="font-mono text-[11px] text-text-muted mb-3">{mod.num}</div>
      <div className="font-heading text-base font-semibold tracking-[-0.02em] mb-2.5 text-text-primary">{mod.name}</div>
      <p className="text-sm text-text-secondary leading-[1.65]">{mod.desc}</p>
      <div className="mt-5">
        <span className="text-[13px] text-primary font-medium cursor-pointer flex items-center gap-1.5 hover:gap-2.5 transition-all">
          Learn more <Icons.ArrowRight />
        </span>
      </div>
    </motion.div>
  );

  return (
    <RevealOnScroll delay={delay * 0.1}>
      {mod.slug ? <Link to={`/platform/${mod.slug}`}>{content}</Link> : content}
    </RevealOnScroll>
  );
}

/* IndustryCard */
export function IndustryCard({ icon, name, desc, delay = 0 }: { icon: IconName; name: string; desc: string; delay?: number }) {
  const IconComp = Icons[icon] || Icons.Globe;
  return (
    <RevealOnScroll delay={delay * 0.1}>
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}
        className="group border border-border rounded-xl p-8 relative overflow-hidden transition-colors hover:border-border-strong"
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-accent-mid origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        <div className="w-10 h-10 bg-accent-light rounded-[10px] flex items-center justify-center mb-5 text-primary">
          <IconComp />
        </div>
        <div className="font-heading text-lg font-semibold tracking-[-0.02em] mb-2.5 text-text-primary">{name}</div>
        <p className="text-sm text-text-secondary leading-[1.65]">{desc}</p>
      </motion.div>
    </RevealOnScroll>
  );
}

/* BlogCard */
const categoryColors: Record<string, string> = { Architecture: '#4f46e5', Enterprise: '#059669', Infrastructure: '#d97706' };

export function BlogCard({ post, delay = 0 }: { post: BlogPost; delay?: number }) {
  const color = categoryColors[post.category] || '#4f46e5';
  return (
    <RevealOnScroll delay={delay * 0.1}>
      <Link to={`/blog/${post.slug}`}>
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.07)" }}
          className="border border-border rounded-xl overflow-hidden transition-colors hover:border-border-strong cursor-pointer"
        >
          <div
            className="h-[180px] flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)` }}
          >
            <div style={{ opacity: 0.15 }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M8 8h32v32H8z" stroke={color} strokeWidth="2" fill="none" />
                <path d="M14 18h20M14 24h20M14 30h12" stroke={color} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute top-4 left-4">
              <span className="font-mono text-[11px] tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-accent-light text-primary border border-primary/20">
                {post.category}
              </span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-heading text-[17px] font-semibold tracking-[-0.02em] leading-[1.3] mb-2.5 text-text-primary">{post.title}</h3>
            <p className="text-[13px] text-text-secondary leading-[1.65] mb-5">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-text-primary">{post.author}</div>
                <div className="text-xs text-text-muted mt-0.5">{post.date} · {post.readTime}</div>
              </div>
              <span className="text-primary text-[13px]"><Icons.ArrowRight /></span>
            </div>
          </div>
        </motion.div>
      </Link>
    </RevealOnScroll>
  );
}

/* ResourceCard */
const typeColors: Record<string, string> = { Whitepaper: 'var(--accent)', Research: '#059669', Documentation: '#d97706', 'Case Study': '#dc2626' };

export function ResourceCard({ res, fileUrl, resourceId, delay = 0 }: { res: Resource; fileUrl?: string | null; resourceId?: string; delay?: number }) {
  const handleDownload = async () => {
    if (!fileUrl) {
      toast({ title: "Coming soon", description: "This file will be available for download shortly." });
      return;
    }
    if (resourceId) {
      trackDownload(resourceId);
    }
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
  };

  return (
    <RevealOnScroll delay={delay * 0.1}>
      <motion.div
        whileHover={{ y: -3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
        className="border border-border rounded-xl p-7 transition-colors hover:border-border-strong"
      >
        <div className="mb-3.5">
          <span className="font-mono text-[11px] tracking-[0.06em] uppercase" style={{ color: typeColors[res.type] || 'hsl(var(--accent))' }}>
            {res.type}
          </span>
        </div>
        <h3 className="font-heading text-base font-semibold tracking-[-0.02em] leading-[1.3] mb-2.5">{res.title}</h3>
        <p className="text-[13px] text-text-secondary leading-[1.65] mb-5">{res.desc}</p>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 text-[13px] text-primary font-medium cursor-pointer hover:gap-2.5 transition-all select-none"
        >
          Download <Icons.ArrowRight />
        </button>
      </motion.div>
    </RevealOnScroll>
  );
}

/* CTASection */
export function CTASection() {
  return (
    <div className="py-[120px]">
      <div className="section-container">
        <div className="bg-text-primary rounded-[20px] p-10 md:p-20 text-center relative overflow-hidden">
          <div className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(79,70,229,0.15)_0%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="relative z-10">
            <div className="mb-6">
              <span className="font-mono text-[11px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full bg-background/10 text-background/70 border border-background/15">
                GET STARTED
              </span>
            </div>
            <h2 className="font-heading text-[clamp(32px,4vw,52px)] font-semibold tracking-[-0.03em] text-background mb-4">
              See Regent in Action
            </h2>
            <p className="text-[17px] text-background/55 max-w-[500px] mx-auto mb-10 leading-[1.65]">
              Discover how Regent designs and builds systems that unify data, workflows, and intelligence into operational infrastructure.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                to="/demo"
                className="font-heading text-[15px] font-medium bg-primary text-primary-foreground rounded-lg px-7 py-3.5 inline-flex items-center gap-2 hover:bg-primary/90 hover:shadow-[0_8px_24px_rgba(79,70,229,0.25)] hover:-translate-y-0.5 transition-all"
              >
                Start a Project <Icons.ArrowRight />
              </Link>
              <Link
                to="/resources"
                className="font-heading text-[15px] font-medium bg-transparent text-background/80 border border-background/25 rounded-lg px-7 py-3.5 inline-flex items-center gap-2 hover:border-background/50 hover:text-background transition-all"
              >
                Read Whitepaper
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
