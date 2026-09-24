import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Resources from '@/legacy-pages/Resources'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Technical Resources & Whitepapers',
  description: 'Technical whitepapers, research, and documentation for enterprise integration and data infrastructure.',
  openGraph: {
    title: 'Technical Resources & Whitepapers | Regent',
    description: 'Technical whitepapers, research, and documentation for enterprise integration and data infrastructure.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Technical Resources & Whitepapers | Regent',
    description: 'Technical whitepapers, research, and documentation for enterprise integration and data infrastructure.',
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
    name: 'Technical Resources & Whitepapers',
    description: 'Technical whitepapers, research, and documentation for enterprise integration and data infrastructure.',
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
      <Resources initialResources={resources ?? []} />
    </>
  )
}
