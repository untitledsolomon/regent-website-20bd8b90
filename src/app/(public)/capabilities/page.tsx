import type { Metadata } from 'next'
import Capabilities from '@/legacy-pages/Capabilities'

export const metadata: Metadata = {
  title: 'What We Build',
  description: 'Regent builds custom business software, integrations, and workflow automation for growing businesses that need their systems connected.',
  openGraph: {
    title: 'What We Build | Regent',
    description: 'Regent builds custom business software, integrations, and workflow automation for growing businesses that need their systems connected.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What We Build | Regent',
    description: 'Regent builds custom business software, integrations, and workflow automation for growing businesses that need their systems connected.',
  },
  alternates: {
    canonical: '/capabilities',
  },
}

export default function CapabilitiesPage() {
  return <Capabilities />
}
