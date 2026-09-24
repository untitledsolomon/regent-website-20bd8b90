import type { Metadata } from 'next'
import { Suspense } from 'react'
import Unsubscribe from '@/legacy-pages/Unsubscribe'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    }>
      <Unsubscribe />
    </Suspense>
  )
}
