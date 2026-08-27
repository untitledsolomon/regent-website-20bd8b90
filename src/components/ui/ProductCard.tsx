import Link from "next/link";
import { Icons } from "../Icons";

interface ProductCardProps {
  title: string;
  description: string;
  href: string;
  featured?: boolean;
}

export function ProductCard({ title, description, href, featured }: ProductCardProps) {
  return (
    <Link
      href={href}
      className={`block p-6 rounded-xl border border-border hover:shadow-lg transition-all bg-surface ${
        featured ? 'lg:col-span-2 bg-gradient-to-br from-primary/5 to-primary/3 border-none' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={`text-lg font-semibold ${featured ? 'text-text-primary' : 'text-text-primary'}`}>{title}</h3>
          <p className="mt-2 text-text-secondary">{description}</p>
        </div>
        <div className="shrink-0 self-center">
          <Icons.ArrowRight />
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
