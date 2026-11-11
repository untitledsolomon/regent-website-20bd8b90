import type { Metadata } from 'next'
import CaseStudies from '@/legacy-pages/CaseStudies'

export const metadata: Metadata = {
  title: 'Case Studies',
  description: 'How growing retail and service businesses move from spreadsheets and disconnected tools to one connected system.',
  openGraph: {
    title: 'Case Studies | Regent',
    description: 'How growing retail and service businesses move from spreadsheets and disconnected tools to one connected system.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Studies | Regent',
    description: 'How growing retail and service businesses move from spreadsheets and disconnected tools to one connected system.',
  },
  alternates: {
    canonical: '/case-studies',
  },
}

export default function CaseStudiesPage() {
  return <CaseStudies />
}
