import type { Metadata } from 'next'
import Index from '@/legacy-pages/Index'

export const metadata: Metadata = {
  title: 'Regent — Custom Software for Growing Businesses',
  description:
    'Regent builds Axis and other business systems that give growing businesses a single source of truth for sales, inventory, finance, and operations.',
  openGraph: {
    title: 'Regent — Custom Software for Growing Businesses',
    description:
      'Regent builds Axis and other business systems that give growing businesses a single source of truth for sales, inventory, finance, and operations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regent — Custom Software for Growing Businesses',
    description:
      'Regent builds Axis and other business systems that give growing businesses a single source of truth for sales, inventory, finance, and operations.',
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
