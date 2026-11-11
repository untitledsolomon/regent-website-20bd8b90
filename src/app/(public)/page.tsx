import type { Metadata } from 'next'
import Index from '@/legacy-pages/Index'

export const metadata: Metadata = {
  title: { absolute: 'Regent: Infrastructure for the Next Generation of Systems' },
  description:
    'Regent architects and builds enterprise systems that connect data, workflows, and intelligence across organizations.',
  openGraph: {
    title: 'Regent: Infrastructure for the Next Generation of Systems',
    description:
      'Regent architects and builds enterprise systems that connect data, workflows, and intelligence across organizations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regent: Infrastructure for the Next Generation of Systems',
    description:
      'Regent architects and builds enterprise systems that connect data, workflows, and intelligence across organizations.',
  },
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  // Organization JSON-LD is rendered once, server-side, in the root layout.
  return <Index />
}
