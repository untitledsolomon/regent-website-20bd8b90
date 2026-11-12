import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: {
    default: 'Regent Technologies | Enterprise Systems & Infrastructure',
    template: '%s | Regent Technologies',
  },
  description:
    'Regent Technologies architects and builds enterprise systems that connect data, workflows and intelligence across organizations. Based in Kampala, Uganda.',
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
  // Site-wide Open Graph / Twitter defaults. Page-level metadata deep-merges
  // over these, so a page with its own values overrides; a page without an
  // image inherits the default og:image below (referencing the existing
  // public/og-image.png — dimensions are non-standard, so no sizes are set).
  openGraph: {
    type: 'website',
    siteName: 'Regent Technologies',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.regentplatform.com'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Regent Technologies',
  legalName: 'Regent Technologies',
  alternateName: 'Regent',
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description:
    "Regent Technologies architects and builds systems that connect data, workflows, and intelligence across organizations — including Axis, Regent's business operations platform.",
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kampala',
    addressCountry: 'UG',
    // TODO(solomon): add the full street address once one is public.
  },
  sameAs: [
    'https://www.facebook.com/profile.php?id=61579513311384',
    'https://www.linkedin.com/company/regent-technologies',
    'https://www.instagram.com/regent.technologies_/',
  ],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Regent Technologies',
  url: SITE_URL,
  inLanguage: 'en',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          async
          src="https://www.googletagmanager.com/gtm.js?id=AW-656595205"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date());`,
          }}
        />
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-H0EMG233LB"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-H0EMG233LB');`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}