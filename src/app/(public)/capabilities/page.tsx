import type { Metadata } from 'next'
import Capabilities from '@/legacy-pages/Capabilities'

export const metadata: Metadata = {
  title: 'Capabilities & Solutions',
  description: 'Enterprise capabilities in systems integration, data infrastructure, workflow automation, and intelligence.',
}

export default function CapabilitiesPage() {
  return <Capabilities />
}
