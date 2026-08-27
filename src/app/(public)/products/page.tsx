import { SectionHeader } from "@/components/SectionHeader";
import { ProductCard } from "@/components/ui/ProductCard";
import { PageMeta } from "@/components/PageMeta";

export const metadata = {
  title: "Products — Regent",
  description: "Regent product suite: Axis, Regent CRM, Forge, Dominion Finance, and Mabruk Atelier.",
};

export default function ProductsPage() {
  return (
    <div className="page-container py-24">
      <PageMeta title={metadata.title} description={metadata.description} />

      <SectionHeader title="Products" subtitle="Business-facing products built and operated by Regent." center />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <ProductCard
          title="Axis"
          description="Live flagship ERP for businesses: invoicing, ledger, inventory, and operations."
          href="/axis"
          featured
        />

        <ProductCard
          title="Regent CRM"
          description="Multi-tenant CRM for managing client relationships and sales pipelines."
          href="/products/regent-crm"
        />

        <ProductCard
          title="Forge"
          description="A content management system for building and publishing sites and content."
          href="/products/forge"
        />

        <ProductCard
          title="Dominion Finance"
          description="Loan management platform for tracking lending operations end-to-end."
          href="/products/dominion-finance"
        />

        <ProductCard
          title="Mabruk Atelier"
          description="A luxury fashion brand, built and run by Regent as a real-world showcase of its own systems."
          href="/products/mabruk-atelier"
        />
      </div>
    </div>
  );
}
