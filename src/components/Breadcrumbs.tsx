import { SITE_URL } from '@/lib/seo'

type Crumb = { name: string; href: string }

/**
 * Server-rendered BreadcrumbList JSON-LD for inner pages. The first item is
 * always the homepage; every URL is absolute and uses the canonical www host.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const breadcrumb: Crumb[] = [
    { name: 'Home', href: '/' },
    ...items,
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
