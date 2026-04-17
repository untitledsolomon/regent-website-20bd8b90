import type { Metadata } from 'next'
import About from '@/legacy-pages/About'

export const metadata: Metadata = {
  title: 'About Regent',
  description: 'Regent architects and builds enterprise systems that connect data, workflows, and intelligence across complex organizations.',
}

export default function AboutPage() {
  return <About />
}
