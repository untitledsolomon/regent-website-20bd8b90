import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { seoTitle } from '@/lib/seo'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import CaseStudyDetail from '@/legacy-pages/CaseStudyDetail'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: cs } = await supabase
    .from('case_studies')
    .select('title, meta_title, meta_description, summary, image_url, og_image, industry')
    .eq('slug', slug)
    .single()

  if (!cs) return { title: 'Case Study Not Found' }

  const pageTitle = cs.meta_title || cs.title
  const description = cs.meta_description || cs.summary || ''
  const ogImage = cs.og_image || cs.image_url || '/og-image.png'

  return {
    title: seoTitle(pageTitle),
    description,
    openGraph: {
      type: 'article',
      title: pageTitle,
      description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [ogImage],
    },
    alternates: { canonical: `/case-studies/${slug}` },
  }
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: cs } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!cs) notFound()

  const { data: related } = await supabase
    .from('case_studies')
    .select('slug, title, industry, summary, image_url')
    .eq('published', true)
    .neq('slug', slug)
    .limit(3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: cs.title,
    description: cs.meta_description || cs.summary || '',
    image: cs.image_url || '',
    author: {
      '@type': 'Organization',
      name: 'Regent Technologies',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Regent Technologies',
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/case-studies/${cs.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ name: 'Case Studies', href: '/case-studies' }, { name: cs.title, href: `/case-studies/${cs.slug}` }]} />
      <CaseStudyDetail
        initialCaseStudy={{
          id: cs.id,
          slug: cs.slug,
          title: cs.title,
          industry: cs.industry,
          summary: cs.summary,
          challenge: cs.challenge,
          solution: cs.solution,
          results: cs.results as string[],
          metrics: cs.metrics as { value: string; label: string }[],
          image_url: (cs as any).image_url ?? null,
        }}
        initialRelated={related ?? []}
      />
    </>
  )
}
