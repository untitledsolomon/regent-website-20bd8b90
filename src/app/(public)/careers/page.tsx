import type { Metadata } from 'next'
import Careers from '@/legacy-pages/Careers'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join Regent and help build Axis and other systems for growing businesses.',
  openGraph: {
    title: 'Careers | Regent',
    description: 'Join Regent and help build Axis and other systems for growing businesses.',
    type: 'website',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers | Regent',
    description: 'Join Regent and help build Axis and other systems for growing businesses.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/careers',
  },
}

export default function CareersPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Careers', href: '/careers' }]} />
      <Careers />
    </>
  )
}
