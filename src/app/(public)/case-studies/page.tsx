import type { Metadata } from 'next'
import CaseStudies from '@/legacy-pages/CaseStudies'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Case Studies',
  description: 'How retail and service businesses move from spreadsheets and disconnected tools to one connected system.',
  openGraph: {
    title: 'Case Studies | Regent',
    description: 'How retail and service businesses move from spreadsheets and disconnected tools to one connected system.',
    type: 'website',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Studies | Regent',
    description: 'How retail and service businesses move from spreadsheets and disconnected tools to one connected system.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/case-studies',
  },
}

export default function CaseStudiesPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Case Studies', href: '/case-studies' }]} />
      <CaseStudies />
    </>
  )
}
