import type { Metadata } from 'next'
import CaseStudies from '@/legacy-pages/CaseStudies'

export const metadata: Metadata = {
  title: 'Client Success Stories',
  description: 'Real-world examples of how Regent transforms enterprise infrastructure across finance, government, and infrastructure sectors.',
  openGraph: {
    title: 'Client Success Stories | Regent Analytics',
    description: 'Real-world examples of how Regent transforms enterprise infrastructure across finance, government, and infrastructure sectors.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Client Success Stories | Regent Analytics',
    description: 'Real-world examples of how Regent transforms enterprise infrastructure across finance, government, and infrastructure sectors.',
  },
  alternates: {
    canonical: '/case-studies',
  },
}

export default function CaseStudiesPage() {
  return <CaseStudies />
}
