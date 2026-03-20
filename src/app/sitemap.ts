import { createServiceClient } from '@/lib/supabase/service'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, date')

  const { data: caseStudies } = await supabase
    .from('case_studies')
    .select('slug, updated_at')

  return [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/platform`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/capabilities`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/case-studies`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/careers`, changeFrequency: 'weekly', priority: 0.6 },
    ...(posts ?? []).map(post => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...(caseStudies ?? []).map(cs => ({
      url: `${siteUrl}/case-studies/${cs.slug}`,
      lastModified: cs.updated_at,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}