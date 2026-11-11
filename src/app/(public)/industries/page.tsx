import type { Metadata } from 'next'
import Industries from '@/legacy-pages/Industries'

export const metadata: Metadata = {
  title: 'Who We Build For',
  description: 'Regent builds business systems for growing retail and service businesses that have outgrown spreadsheets and disconnected tools.',
  openGraph: {
    title: 'Who We Build For | Regent',
    description: 'Regent builds business systems for growing retail and service businesses that have outgrown spreadsheets and disconnected tools.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Who We Build For | Regent',
    description: 'Regent builds business systems for growing retail and service businesses that have outgrown spreadsheets and disconnected tools.',
  },
  alternates: {
    canonical: '/industries',
  },
}

export default function IndustriesPage() {
  return <Industries />
}
