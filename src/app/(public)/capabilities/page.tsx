import type { Metadata } from 'next'
import Capabilities from '@/legacy-pages/Capabilities'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Capabilities & Solutions',
  description: 'Enterprise capabilities in systems integration, data infrastructure, workflow automation, and intelligence.',
  openGraph: {
    title: 'Capabilities & Solutions | Regent',
    description: 'Enterprise capabilities in systems integration, data infrastructure, workflow automation, and intelligence.',
    type: 'website',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capabilities & Solutions | Regent',
    description: 'Enterprise capabilities in systems integration, data infrastructure, workflow automation, and intelligence.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/capabilities',
  },
}

export default function CapabilitiesPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Capabilities & Solutions', href: '/capabilities' }]} />
      <Capabilities />
    </>
  )
}
