import type { Metadata } from 'next'
import CareerApply from '@/legacy-pages/CareerApply'

export const metadata: Metadata = {
  title: 'Apply',
  robots: { index: false, follow: true },
}

export default function CareerApplyPage() {
  return <CareerApply />
}
