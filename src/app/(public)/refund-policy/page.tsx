import type { Metadata } from 'next'
import RefundPolicy from '@/legacy-pages/RefundPolicy'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Read Regent\'s refund policy covering Axis trials, cancellations, and billing.',
  openGraph: {
    title: 'Refund Policy | Regent',
    description:
      'Read Regent\'s refund policy covering Axis trials, cancellations, and billing.',
    type: 'website',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refund Policy | Regent',
    description:
      'Read Regent\'s refund policy covering Axis trials, cancellations, and billing.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/refund-policy',
  },
}

export default function RefundPolicyPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Refund Policy', href: '/refund-policy' }]} />
      <RefundPolicy />
    </>
  )
}
