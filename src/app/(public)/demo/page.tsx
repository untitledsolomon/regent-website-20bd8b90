import type { Metadata } from 'next'
import Demo from '@/legacy-pages/Demo'

export const metadata: Metadata = {
  title: 'Book a Demo',
  description: 'Talk to Regent about building Axis or a custom system for your business.',
  openGraph: {
    title: 'Book a Demo | Regent',
    description: 'Talk to Regent about building Axis or a custom system for your business.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Demo | Regent',
    description: 'Talk to Regent about building Axis or a custom system for your business.',
  },
  alternates: {
    canonical: '/demo',
  },
}

export default function DemoPage() {
  return <Demo />
}
