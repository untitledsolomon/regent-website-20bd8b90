import type { Metadata } from 'next'
import Industries from '@/legacy-pages/Industries'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Industry Solutions',
  description: 'Specialized systems integration and data infrastructure for Finance, Government, Energy, and Infrastructure sectors.',
  openGraph: {
    title: 'Industry Solutions | Regent',
    description: 'Specialized systems integration and data infrastructure for Finance, Government, Energy, and Infrastructure sectors.',
    type: 'website',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industry Solutions | Regent',
    description: 'Specialized systems integration and data infrastructure for Finance, Government, Energy, and Infrastructure sectors.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/industries',
  },
}

export default function IndustriesPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Industry Solutions', href: '/industries' }]} />
      <Industries />
    </>
  )
}
