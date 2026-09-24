import type { Metadata } from 'next'
import PrivacyPolicy from '@/legacy-pages/PrivacyPolicy'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read how Regent collects, uses, and protects your data across Regent and Axis.',
  openGraph: {
    title: 'Privacy Policy | Regent',
    description: 'Read how Regent collects, uses, and protects your data across Regent and Axis.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Regent',
    description: 'Read how Regent collects, uses, and protects your data across Regent and Axis.',
  },
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return <PrivacyPolicy />
}
