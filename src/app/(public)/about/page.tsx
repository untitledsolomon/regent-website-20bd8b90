import type { Metadata } from 'next'
import About from '@/legacy-pages/About'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: { absolute: 'About Regent Technologies | Enterprise Systems' },
  description:
    'Regent Technologies architects and builds enterprise systems that connect data, workflows and intelligence across organizations.',
  openGraph: {
    title: 'About Regent Technologies | Enterprise Systems',
    description:
      'Regent Technologies architects and builds enterprise systems that connect data, workflows and intelligence across organizations.',
    type: 'website',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Regent Technologies | Enterprise Systems',
    description:
      'Regent Technologies architects and builds enterprise systems that connect data, workflows and intelligence across organizations.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Regent Technologies',
    alternateName: 'Regent',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.regentplatform.com',
    description:
      'Regent Technologies architects and builds enterprise systems that connect data, workflows and intelligence across organizations.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ name: 'About', href: '/about' }]} />
      <About />
    </>
  )
}
