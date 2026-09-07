import { createServiceClient } from '@/lib/supabase/service'
import type { MetadataRoute } from 'next'

// Hardcoded (not env-driven) on purpose: canonical tags, robots.ts, and the
// www redirect all target this exact host. NEXT_PUBLIC_SITE_URL has drifted
// to a bare/old domain before (see git history), which produced a sitemap
// full of non-canonical <loc> values GSC would refuse to trust. Pinning it
// here means the sitemap host can never silently diverge from canonical.
const SITE_URL = 'https://www.regentplatform.com'

// Revalidate periodically so newly published/unpublished content is picked
// up without requiring a full redeploy, even if this route is served from
// a cached/static rendering path.
export const revalidate = 3600 // 1 hour

type StaticEntry = {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}

// Static marketing pages that don't have their own DB-backed collection.
// This list should rarely change; new content-type pages (blog posts, case
// studies, resources) must NEVER be added here — they come from the queries
// below so publishing/unpublishing is automatically reflected.
const staticPages: StaticEntry[] = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 }, // homepage
  { path: '/axis', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/platform', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/products', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/capabilities', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/industries', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/case-studies', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.8 },
  { path: '/resources', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/careers', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/refund-policy', changeFrequency: 'yearly', priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient()

  // Only published content should ever appear in the sitemap — this is the
  // core fix. The previous version queried blog_posts/case_studies without
  // filtering on `published`, and separately a stale public/sitemap.xml had
  // silently gone out of date, which together caused live posts and case
  // studies to fall out of Google's index ("Discovered — currently not
  // indexed"). Pulling live from the tables with this filter means a post
  // disappears from the sitemap the instant it's unpublished, and a newly
  // published post/case study appears on the next request/revalidation with
  // no manual file edit.
  const [
    { data: posts, error: postsError },
    { data: caseStudies, error: caseStudiesError },
    { data: resources, error: resourcesError },
  ] = await Promise.all([
    supabase.from('blog_posts').select('slug, updated_at').eq('published', true),
    supabase.from('case_studies').select('slug, updated_at').eq('published', true),
    // /resources/[slug] is a real published-content page with the exact same
    // indexing risk as posts/case studies, so it's generated the same way
    // rather than left to only the static /resources hub-page entry below.
    supabase.from('resources').select('slug, updated_at').eq('published', true),
  ])

  if (postsError) {
    console.error('sitemap: failed to fetch blog_posts', postsError)
  }
  if (caseStudiesError) {
    console.error('sitemap: failed to fetch case_studies', caseStudiesError)
  }
  if (resourcesError) {
    console.error('sitemap: failed to fetch resources', resourcesError)
  }

  const staticEntries: MetadataRoute.Sitemap = staticPages.map(page => ({
    url: `${SITE_URL}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const caseStudyEntries: MetadataRoute.Sitemap = (caseStudies ?? []).map(cs => ({
    url: `${SITE_URL}/case-studies/${cs.slug}`,
    lastModified: cs.updated_at,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const resourceEntries: MetadataRoute.Sitemap = (resources ?? []).map(r => ({
    url: `${SITE_URL}/resources/${r.slug}`,
    lastModified: r.updated_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...postEntries, ...caseStudyEntries, ...resourceEntries]
}