import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: {
    default: 'Regent: Infrastructure for the Next Generation of Systems',
    template: '%s | Regent',
  },
  description:
    'Regent architects and builds enterprise systems that connect data, workflows, and intelligence across organizations.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.regentplatform.com'
  ),
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.regentplatform.com'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Regent',
  legalName: 'Regent Technologies',
  alternateName: ['Regent Platform', 'Regent Technologies'],
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description:
    'Regent architects and builds systems that connect data, workflows, and intelligence across organizations.',
  sameAs: [
    'https://www.facebook.com/profile.php?id=61579513311384',
    'https://www.linkedin.com/company/regent-technologies',
    'https://www.instagram.com/regent.technologies_/',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}