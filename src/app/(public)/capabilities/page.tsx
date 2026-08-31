import type { Metadata } from 'next'
import Capabilities from '@/legacy-pages/Capabilities'

export const metadata: Metadata = {
  title: 'Capabilities & Solutions',
  description: 'Enterprise capabilities in systems integration, data infrastructure, workflow automation, and intelligence.',
  openGraph: {
    title: 'Capabilities & Solutions | Regent Analytics',
    description: 'Enterprise capabilities in systems integration, data infrastructure, workflow automation, and intelligence.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capabilities & Solutions | Regent Analytics',
    description: 'Enterprise capabilities in systems integration, data infrastructure, workflow automation, and intelligence.',
  },
  alternates: {
    canonical: '/capabilities',
  },
}

export default function CapabilitiesPage() {
  return <Capabilities />
}
