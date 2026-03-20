import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: {
    default: 'Regent Analytics',
    template: '%s | Regent Analytics',
  },
  description: 'Enterprise analytics platform.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://regentplatform.com'
  ),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}