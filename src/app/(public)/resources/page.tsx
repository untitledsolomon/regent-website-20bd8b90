import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Resources from '@/legacy-pages/Resources'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Guides and reports for growing businesses on inventory, finance, and operations, from the team behind Axis by Regent.',
  openGraph: {
    title: 'Resources | Regent',
    description: 'Guides and reports for growing businesses on inventory, finance, and operations, from the team behind Axis by Regent.',
    type: 'website',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resources | Regent',
    description: 'Guides and reports for growing businesses on inventory, finance, and operations, from the team behind Axis by Regent.',
    images: ['/og-image.png']
  },
  alternates: { canonical: '/resources' },
}

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Resources',
    description: 'Guides and reports for growing businesses on inventory, finance, and operations, from the team behind Axis by Regent.',
    publisher: {
      '@type': 'Organization',
      name: 'Regent',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ name: 'Resources', href: '/resources' }]} />
      <Resources initialResources={resources ?? []} />
    </>
  )
}
