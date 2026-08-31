import type { Metadata } from 'next'
import Industries from '@/legacy-pages/Industries'

export const metadata: Metadata = {
  title: 'Industry Solutions',
  description: 'Specialized systems integration and data infrastructure for Finance, Government, Energy, and Infrastructure sectors.',
  openGraph: {
    title: 'Industry Solutions | Regent Analytics',
    description: 'Specialized systems integration and data infrastructure for Finance, Government, Energy, and Infrastructure sectors.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industry Solutions | Regent Analytics',
    description: 'Specialized systems integration and data infrastructure for Finance, Government, Energy, and Infrastructure sectors.',
  },
  alternates: {
    canonical: '/industries',
  },
}

export default function IndustriesPage() {
  return <Industries />
}
