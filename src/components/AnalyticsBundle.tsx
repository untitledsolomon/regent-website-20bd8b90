'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function AnalyticsBundle() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      persistence: 'localStorage',
      autocapture: true,
    })
  }, [])

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

