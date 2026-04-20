import type { Metadata } from 'next'
import Resources from '@/legacy-pages/Resources'

export const metadata: Metadata = {
  title: 'Technical Resources & Whitepapers',
  description: 'Technical whitepapers, research, and documentation for enterprise integration and data infrastructure.',
  openGraph: {
    title: 'Technical Resources & Whitepapers | Regent Analytics',
    description: 'Technical whitepapers, research, and documentation for enterprise integration and data infrastructure.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Technical Resources & Whitepapers | Regent Analytics',
    description: 'Technical whitepapers, research, and documentation for enterprise integration and data infrastructure.',
  },
  alternates: { canonical: '/resources' },
}

export default function ResourcesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Technical Resources & Whitepapers',
    description: 'Technical whitepapers, research, and documentation for enterprise integration and data infrastructure.',
    publisher: {
      '@type': 'Organization',
      name: 'Regent Analytics',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Resources />
    </>
  )
}
