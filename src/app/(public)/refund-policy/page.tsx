import type { Metadata } from 'next'
import RefundPolicy from '@/legacy-pages/RefundPolicy'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Read Regent\'s refund policy covering Axis trials, cancellations, and billing.',
  openGraph: {
    title: 'Refund Policy | Regent',
    description:
      'Read Regent\'s refund policy covering Axis trials, cancellations, and billing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refund Policy | Regent',
    description:
      'Read Regent\'s refund policy covering Axis trials, cancellations, and billing.',
  },
  alternates: {
    canonical: '/refund-policy',
  },
}

export default function RefundPolicyPage() {
  return <RefundPolicy />
}
