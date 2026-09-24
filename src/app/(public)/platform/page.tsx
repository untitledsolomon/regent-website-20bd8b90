import type { Metadata } from 'next'
import Platform from '@/legacy-pages/Platform'

export const metadata: Metadata = {
  title: 'Platform Overview',
  description:
    "See how Regent's platform connects data, workflows, and operations into one system for growing businesses.",
  openGraph: {
    title: 'Platform Overview | Regent',
    description:
      "See how Regent's platform connects data, workflows, and operations into one system for growing businesses.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Platform Overview | Regent',
    description:
      "See how Regent's platform connects data, workflows, and operations into one system for growing businesses.",
  },
  alternates: {
    canonical: '/platform',
  },
}

export default function PlatformPage() {
  return <Platform />
}
