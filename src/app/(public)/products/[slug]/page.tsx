import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icons } from "@/components/Icons";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { PageMeta } from "@/components/PageMeta";

type Product = {
  name: string;
  eyebrow: string;
  description: string;
  accent: string;
  icon: keyof typeof Icons;
  benefits: string[];
  details: string[];
};

const PRODUCTS: Record<string, Product> = {
  "regent-crm": {
    name: "Regent CRM",
    eyebrow: "Relationships",
    description: "A multi-tenant CRM for managing client relationships and sales pipelines with clarity.",
    accent: "#4f46e5",
    icon: "Integration",
    benefits: ["Keep every client relationship in one place", "Move opportunities through a visible sales pipeline", "Give teams a shared view of the work that matters"],
    details: ["Client relationship management", "Sales pipeline visibility", "Multi-tenant foundations"],
  },
  forge: {
    name: "Forge",
    eyebrow: "Publishing",
    description: "A content management system for building and publishing sites and content without friction.",
    accent: "#059669",
    icon: "FileText",
    benefits: ["Build and publish sites with structure", "Keep content organized as it grows", "Create a dependable publishing workflow"],
    details: ["Site building", "Content publishing", "Editorial workflows"],
  },
  "dominion-finance": {
    name: "Dominion Finance",
    eyebrow: "Lending operations",
    description: "A loan management platform for tracking lending operations end-to-end.",
    accent: "#d97706",
    icon: "BarChart",
    benefits: ["Track lending operations from one system", "Keep loan activity visible end-to-end", "Give finance teams a clearer operating picture"],
    details: ["Loan management", "Lending operations", "End-to-end tracking"],
  },
  "mabruk-atelier": {
    name: "Mabruk Atelier",
    eyebrow: "Real-world showcase",
    description: "A luxury fashion brand built and run by Regent as a real-world showcase of its own systems.",
    accent: "#be123c",
    icon: "Intelligence",
    benefits: ["A live Regent-operated brand", "Systems tested in the real world", "A working example of Regent's operating approach"],
    details: ["Luxury fashion", "Regent-operated", "Real-world systems"],
  },
};

export function generateStaticParams() {
  return Object.keys(PRODUCTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS[slug];
  return { title: product ? `${product.name} — Regent` : "Product — Regent", description: product?.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = PRODUCTS[slug];

  // Previously returned a "Product not found" page with a 200 status for
  // any unknown slug -- a soft 404. notFound() makes Next.js serve a real
  // 404 status instead.
  if (!product) {
    notFound();
  }

  const ProductIcon = Icons[product.icon];

  return (
    <>
      <PageMeta title={product.name} description={product.description} />
      <div className="border-b border-border bg-background/90 backdrop-blur">
        <div className="section-container flex h-12 items-center justify-between">
          <Link href="/products" className="text-xs text-text-secondary hover:text-text-primary">← All products</Link>
          <span className="font-heading text-sm font-semibold text-text-primary">{product.name}</span>
          <Link href="/demo" className="hidden text-xs font-medium text-primary sm:block">Talk to Regent</Link>
        </div>
      </div>

      <main>
        <section className="grid-bg border-b border-border">
          <div className="section-container grid gap-12 pb-20 pt-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
            <RevealOnScroll>
              <div className="max-w-xl">
                <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: product.accent }}>
                  <span className="h-px w-8" style={{ backgroundColor: product.accent }} /> {product.eyebrow}
                </div>
                <h1 className="mb-6 font-heading text-[clamp(42px,6vw,72px)] font-semibold leading-[1] tracking-[-0.06em] text-text-primary">{product.name}</h1>
                <p className="mb-8 max-w-lg text-lg font-light leading-relaxed text-text-secondary">{product.description}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/demo" className="inline-flex items-center gap-2 rounded-lg bg-text-primary px-[18px] py-3 font-heading text-[13px] font-medium text-background transition-all hover:-translate-y-px hover:shadow-lg">Discuss this product <Icons.ArrowRight /></Link>
                  <Link href="/products" className="inline-flex items-center rounded-lg border border-border-strong px-[18px] py-3 font-heading text-[13px] font-medium text-text-primary hover:border-primary hover:text-primary">Explore all products</Link>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <div className="rounded-2xl border border-border bg-background p-3 shadow-[0_24px_80px_rgba(35,31,94,0.12)]">
                <div className="overflow-hidden rounded-xl border border-border bg-surface">
                  <div className="flex items-center justify-between border-b border-border bg-background px-5 py-4">
                    <div className="flex items-center gap-2 font-heading text-sm font-semibold"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: product.accent }} /> {product.name} workspace</div>
                    <span className="font-mono text-[10px] text-text-muted">OVERVIEW</span>
                  </div>
                  <div className="grid gap-4 p-5 sm:grid-cols-[0.75fr_1.25fr] sm:p-7">
                    <div className="space-y-2">
                      {product.details.map((detail, index) => <div key={detail} className={`rounded-md border p-3 text-xs ${index === 0 ? 'border-primary/20 bg-background text-text-primary' : 'border-border text-text-secondary'}`}><span className="mr-2 font-mono text-[10px]" style={{ color: product.accent }}>0{index + 1}</span>{detail}</div>)}
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <div className="mb-5 flex items-center justify-between text-xs font-medium"><span>Activity overview</span><span style={{ color: product.accent }}>Live</span></div>
                      <div className="flex h-36 items-end gap-2 border-b border-border pb-2">{[35, 48, 42, 58, 54, 72, 65, 84, 78, 92].map((height, index) => <span key={index} className="flex-1 rounded-t-sm opacity-80" style={{ height: `${height}%`, backgroundColor: index > 6 ? product.accent : `${product.accent}55` }} />)}</div>
                      <div className="mt-4 flex justify-between text-[10px] text-text-muted"><span>START OF PERIOD</span><span>NOW</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="section-container py-24">
          <div className="mb-12 max-w-2xl">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: product.accent }}>What it helps you do</div>
            <h2 className="font-heading text-3xl font-semibold leading-tight tracking-[-0.04em] text-text-primary md:text-4xl">Focused tools for the work in front of you.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {product.benefits.map((benefit, index) => <RevealOnScroll key={benefit} delay={index * 0.06}><div className="h-full rounded-xl border border-border bg-surface p-7"><div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-background" style={{ color: product.accent }}><ProductIcon size={18} /></div><div className="mb-3 font-mono text-[10px]" style={{ color: product.accent }}>0{index + 1}</div><p className="font-heading text-base font-semibold leading-snug text-text-primary">{benefit}</p></div></RevealOnScroll>)}
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="section-container flex flex-col gap-6 py-16 md:flex-row md:items-center md:justify-between">
            <div><div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: product.accent }}>Built by Regent</div><h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary">Make the next move with {product.name}.</h2></div>
            <Link href="/demo" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-text-primary px-5 py-3 font-heading text-[13px] font-medium text-background transition-all hover:-translate-y-px hover:shadow-lg">Start a conversation <Icons.ArrowRight /></Link>
          </div>
        </section>
      </main>
    </>
  );
}