import type { Metadata } from 'next'
import CaseStudies from '@/legacy-pages/CaseStudies'

export const metadata: Metadata = {
  title: 'Client Success Stories',
  description: 'Real-world examples of how Regent transforms enterprise infrastructure across finance, government, and infrastructure sectors.',
}

export default function CaseStudiesPage() {
  return <CaseStudies />
}
