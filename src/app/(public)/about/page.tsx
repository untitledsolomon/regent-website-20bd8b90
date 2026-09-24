import type { Metadata } from 'next'
import About from '@/legacy-pages/About'

export const metadata: Metadata = {
  title: 'About Regent',
  description:
    'Regent builds Axis and other custom software for growing businesses that have outgrown spreadsheets and disconnected tools.',
  openGraph: {
    title: 'About Regent',
    description:
      'Regent builds Axis and other custom software for growing businesses that have outgrown spreadsheets and disconnected tools.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Regent',
    description:
      'Regent builds Axis and other custom software for growing businesses that have outgrown spreadsheets and disconnected tools.',
  },
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Regent',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.regentplatform.com',
    description:
      'Regent builds Axis and other custom software for growing businesses.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <About />
    </>
  )
}
