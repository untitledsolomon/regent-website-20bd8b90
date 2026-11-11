import type { NextConfig } from 'next'

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Vercel cron: hourly so the digest route can pick up whichever of the weekly
  // or daily schedules is due. The route is a no-op when no digest is due.
  crons: [{ path: '/api/cron/digest', schedule: '0 * * * *' }],
} as unknown as NextConfig

export default nextConfig