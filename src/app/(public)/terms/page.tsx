import type { Metadata } from 'next'
import TermsOfService from '@/legacy-pages/TermsOfService'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms of service governing use of Regent and Axis.',
  openGraph: {
    title: 'Terms of Service | Regent',
    description: 'Read the terms of service governing use of Regent and Axis.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Regent',
    description: 'Read the terms of service governing use of Regent and Axis.',
  },
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Terms of Service', href: '/terms' }]} />
      <TermsOfService />
    </>
  )
}
