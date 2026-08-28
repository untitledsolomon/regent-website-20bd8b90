import { ProductCard } from "@/components/ui/ProductCard";
import { PageMeta } from "@/components/PageMeta";
import Link from "next/link";
import { Icons } from "@/components/Icons";

export const metadata = {
  title: "Products — Regent",
  description: "Regent product suite: Axis, Regent CRM, Forge, Dominion Finance, and Mabruk Atelier.",
};

export default function ProductsPage() {
  return (
    <div className="section-container py-28">
      <PageMeta title={metadata.title} description={metadata.description} />

      <div className="mb-14 max-w-3xl">
        <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
          <span className="h-px w-8 bg-primary" /> The Regent portfolio
        </div>
        <h1 className="mb-5 font-heading text-[clamp(38px,5vw,64px)] font-semibold leading-[1.04] tracking-[-0.05em] text-text-primary">
          The systems behind better business.
        </h1>
        <p className="max-w-2xl text-lg font-light leading-relaxed text-text-secondary">
          Business-facing products built and operated by Regent. Choose the system that fits the work you need to move forward.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 border-y border-border py-4 text-xs font-medium text-text-secondary">
        {['All products', 'Operations', 'Relationships', 'Publishing', 'Finance', 'Showcase'].map((category, index) => (
          <span key={category} className={`rounded-full px-3 py-1.5 ${index === 0 ? 'bg-text-primary text-background' : 'bg-surface'}`}>
            {category}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ProductCard
          title="Axis"
          eyebrow="Flagship platform"
          description="A done-for-you business operations system for teams moving beyond spreadsheets and disconnected tools."
          href="/axis"
          benefits={["Invoicing, clients, and full ledger accounting", "Inventory, custody, HR, and attendance", "One shared system for every core operation"]}
          ctaLabel="Explore Axis"
          featured
        />

        <ProductCard
          title="Regent CRM"
          eyebrow="Relationships"
          description="Multi-tenant CRM for managing client relationships and sales pipelines."
          href="/products/regent-crm"
          benefits={["Client relationship management", "Sales pipeline visibility"]}
          ctaLabel="View Regent CRM"
        />

        <ProductCard
          title="Forge"
          eyebrow="Publishing"
          description="A content management system for building and publishing sites and content."
          href="/products/forge"
          benefits={["Site and content publishing", "A structured editorial workflow"]}
          ctaLabel="View Forge"
        />

        <ProductCard
          title="Dominion Finance"
          eyebrow="Lending operations"
          description="Loan management platform for tracking lending operations end-to-end."
          href="/products/dominion-finance"
          benefits={["End-to-end lending operations", "Clear loan tracking"]}
          ctaLabel="View Dominion Finance"
        />

        <ProductCard
          title="Mabruk Atelier"
          eyebrow="Real-world showcase"
          description="A luxury fashion brand, built and run by Regent as a real-world showcase of its own systems."
          href="/products/mabruk-atelier"
          benefits={["A live Regent-operated brand", "Systems tested in the real world"]}
          ctaLabel="Visit Mabruk Atelier"
        />
      </div>

      <div className="mt-20 grid gap-8 border-t border-border pt-10 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Why Regent</div>
          <h2 className="font-heading text-2xl font-semibold leading-tight tracking-[-0.03em] text-text-primary">Products with a point of view.</h2>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-text-secondary">
          Regent does not collect disconnected tools. We build focused systems, operate them in the real world, and connect the right pieces when the work calls for it.
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-4 border-t border-border pt-6 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <span>One studio. Multiple operating systems.</span>
        <Link href="/demo" className="inline-flex items-center gap-2 font-medium text-primary hover:gap-3 transition-all">
          Talk to Regent <Icons.ArrowRight />
        </Link>
      </div>
    </div>
  );
}
