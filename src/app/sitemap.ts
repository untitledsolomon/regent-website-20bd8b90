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
    { url: `${siteUrl}/axis`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/platform`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/pricing`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/capabilities`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/industries`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/case-studies`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/resources`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/careers`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/refund-policy`, changeFrequency: 'yearly', priority: 0.3 },
    ...(posts ?? []).map(post => {
      // post.date is a free-text column (e.g. "March 19, 2026") rather than
      // a real date type, so it must be parsed before being handed to the
      // sitemap serializer, or Next.js writes it into <lastmod> verbatim and
      // produces an invalid, non-ISO-8601 date that Google Search Console
      // rejects. Fall back to omitting lastMod entirely if it can't be parsed.
      const parsedDate = post.date ? new Date(post.date) : null
      const lastModified =
        parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : undefined

      return {
        url: `${siteUrl}/blog/${post.slug}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }
    }),
    ...(caseStudies ?? []).map(cs => ({
      url: `${siteUrl}/case-studies/${cs.slug}`,
      lastModified: cs.updated_at,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}