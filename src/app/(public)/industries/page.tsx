import type { Metadata } from 'next'
import Industries from '@/legacy-pages/Industries'

export const metadata: Metadata = {
  title: 'Industry Solutions',
  description: 'Specialized systems integration and data infrastructure for Finance, Government, Energy, and Infrastructure sectors.',
}

export default function IndustriesPage() {
  return <Industries />
}
