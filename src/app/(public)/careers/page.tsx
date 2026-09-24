import type { Metadata } from 'next'
import Careers from '@/legacy-pages/Careers'

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join Regent and help build Axis and other systems for growing businesses.',
  openGraph: {
    title: 'Careers | Regent',
    description: 'Join Regent and help build Axis and other systems for growing businesses.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers | Regent',
    description: 'Join Regent and help build Axis and other systems for growing businesses.',
  },
  alternates: {
    canonical: '/careers',
  },
}

export default function CareersPage() {
  return <Careers />
}
