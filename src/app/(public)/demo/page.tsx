import type { Metadata } from 'next'
import Demo from '@/legacy-pages/Demo'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Book a Demo',
  description: 'Talk to Regent about building Axis or a custom system for your business.',
  openGraph: {
    title: 'Book a Demo | Regent',
    description: 'Talk to Regent about building Axis or a custom system for your business.',
    type: 'website',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Demo | Regent',
    description: 'Talk to Regent about building Axis or a custom system for your business.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/demo',
  },
}

export default function DemoPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Book a Demo', href: '/demo' }]} />
      <Demo />
    </>
  )
}
