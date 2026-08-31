import Link from "next/link";
import { Icons } from "../Icons";

interface ProductCardProps {
  title: string;
  eyebrow?: string;
  description: string;
  href: string;
  benefits: string[];
  ctaLabel: string;
  featured?: boolean;
}

export function ProductCard({ title, eyebrow, description, href, benefits, ctaLabel, featured }: ProductCardProps) {
  return (
    <article
      className={`group flex h-full flex-col rounded-xl border border-border p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_45px_rgba(35,31,94,0.1)] ${
        featured ? "bg-primary text-primary-foreground lg:row-span-2" : "bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow && (
            <div className={`mb-4 font-mono text-[10px] uppercase tracking-[0.16em] ${featured ? "text-accent-mid" : "text-primary"}`}>
              {eyebrow}
            </div>
          )}
          <h3 className="font-heading text-xl font-semibold tracking-[-0.03em]">{title}</h3>
          <p className={`mt-3 text-sm leading-relaxed ${featured ? "text-primary-foreground/75" : "text-text-secondary"}`}>
            {description}
          </p>
        </div>
      </div>

      <ul className={`mt-7 space-y-3 border-t pt-6 text-sm ${featured ? "border-primary-foreground/15" : "border-border"}`}>
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5">
            <span className={`mt-0.5 ${featured ? "text-accent-mid" : "text-primary"}`}><Icons.Check size={15} /></span>
            <span className={featured ? "text-primary-foreground/85" : "text-text-secondary"}>{benefit}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`mt-auto inline-flex items-center gap-2 pt-8 font-heading text-[13px] font-medium ${featured ? "text-primary-foreground" : "text-primary"}`}
      >
        {ctaLabel}
        <span className="transition-transform group-hover:translate-x-1"><Icons.ArrowRight /></span>
      </Link>
    </article>
  );
}

export default ProductCard;
