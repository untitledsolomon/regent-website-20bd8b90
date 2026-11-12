import type { Metadata } from 'next'
import Index from '@/legacy-pages/Index'

export const metadata: Metadata = {
  title: { absolute: 'Regent Technologies | Enterprise Systems & Infrastructure' },
  description:
    'Regent Technologies architects and builds enterprise systems that connect data, workflows and intelligence across organizations. Based in Kampala, Uganda.',
  openGraph: {
    title: 'Regent Technologies | Enterprise Systems & Infrastructure',
    description:
      'Regent Technologies architects and builds enterprise systems that connect data, workflows and intelligence across organizations. Based in Kampala, Uganda.',
    type: 'website',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regent Technologies | Enterprise Systems & Infrastructure',
    description:
      'Regent Technologies architects and builds enterprise systems that connect data, workflows and intelligence across organizations. Based in Kampala, Uganda.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  // Organization JSON-LD is rendered once, server-side, in the root layout.
  return <Index />
}
