'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import dynamic from 'next/dynamic'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { CookieConsent } from '@/components/CookieConsent'
import { AuthProvider } from '@/hooks/useAuth'
import { NavigationTracker } from '@/components/NavigationTracker'
import { useState, Suspense } from 'react'

const AnalyticsBundle = dynamic(
  () => import('@/components/AnalyticsBundle').then(m => m.AnalyticsBundle),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000 * 60 * 5, retry: 1 },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <NavigationTracker />
            </Suspense>
            {children}
            <Toaster />
            <Sonner />
            <CookieConsent />
            <AnalyticsBundle />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}