import type { Metadata } from 'next'
import About from '@/legacy-pages/About'

export const metadata: Metadata = {
  title: 'About Regent',
  description: 'Regent architects and builds enterprise systems that connect data, workflows, and intelligence across complex organizations.',
  openGraph: {
    title: 'About Regent | Regent Analytics',
    description: 'Regent architects and builds enterprise systems that connect data, workflows, and intelligence across complex organizations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Regent | Regent Analytics',
    description: 'Regent architects and builds enterprise systems that connect data, workflows, and intelligence across complex organizations.',
  },
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return <About />
}
