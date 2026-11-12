import type { Metadata } from 'next'
import PrivacyPolicy from '@/legacy-pages/PrivacyPolicy'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read how Regent collects, uses, and protects your data across Regent and Axis.',
  openGraph: {
    title: 'Privacy Policy | Regent',
    description: 'Read how Regent collects, uses, and protects your data across Regent and Axis.',
    type: 'website',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Regent',
    description: 'Read how Regent collects, uses, and protects your data across Regent and Axis.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Privacy Policy', href: '/privacy' }]} />
      <PrivacyPolicy />
    </>
  )
}
