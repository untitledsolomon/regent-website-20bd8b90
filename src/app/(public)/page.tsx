import type { Metadata } from 'next'
import Index from '@/legacy-pages/Index'

export const metadata: Metadata = {
  title: { absolute: 'Regent: Infrastructure for the Next Generation of Systems' },
  description:
    'Regent architects and builds enterprise systems that connect data, workflows, and intelligence across organizations.',
  openGraph: {
    title: 'Regent: Infrastructure for the Next Generation of Systems',
    description:
      'Regent architects and builds enterprise systems that connect data, workflows, and intelligence across organizations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regent: Infrastructure for the Next Generation of Systems',
    description:
      'Regent architects and builds enterprise systems that connect data, workflows, and intelligence across organizations.',
  },
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Regent',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.regentplatform.com',
    description:
      'Regent builds Axis and other business systems for growing businesses.',
    makesOffer: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'SoftwareApplication',
        name: 'Axis',
        applicationCategory: 'BusinessApplication',
        description:
          "Axis is Regent's all-in-one business operations platform: invoicing, ledger accounting, inventory, and HR in one system.",
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Index />
    </>
  )
}
