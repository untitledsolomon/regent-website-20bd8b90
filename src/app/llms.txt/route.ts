import { createServiceClient } from '@/lib/supabase/service'

// Hardcoded for the same reason as sitemap.ts: canonical host must never
// silently drift from what's deployed.
const SITE_URL = 'https://www.regentplatform.com'

// Same revalidation window as the sitemap so both stay in sync with
// publish/unpublish state without a redeploy.
export const revalidate = 3600 // 1 hour

function section(title: string, lines: string[]): string {
  if (lines.length === 0) return ''
  return `\n## ${title}\n\n${lines.join('\n')}\n`
}

export async function GET() {
  const supabase = createServiceClient()

  // Same filter discipline as sitemap.ts: only published rows should ever
  // be exposed here. An llms.txt leaking a draft is the same class of bug
  // as a sitemap leaking one.
  const [
    { data: posts, error: postsError },
    { data: caseStudies, error: caseStudiesError },
    { data: resources, error: resourcesError },
  ] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('slug, title, excerpt, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false }),
    supabase
      .from('case_studies')
      .select('slug, title, summary, industry, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false }),
    supabase
      .from('resources')
      .select('slug, title, description, type, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false }),
  ])

  if (postsError) console.error('llms.txt: failed to fetch blog_posts', postsError)
  if (caseStudiesError) console.error('llms.txt: failed to fetch case_studies', caseStudiesError)
  if (resourcesError) console.error('llms.txt: failed to fetch resources', resourcesError)

  const postLines = (posts ?? []).map(
    p => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt ?? ''}`.trim()
  )

  const caseStudyLines = (caseStudies ?? []).map(
    cs =>
      `- [${cs.title}](${SITE_URL}/case-studies/${cs.slug}): ${cs.summary ?? ''}`.trim()
  )

  const resourceLines = (resources ?? []).map(
    r => `- [${r.title}](${SITE_URL}/resources/${r.slug}): ${r.description ?? ''}`.trim()
  )

  const body = `# Regent

> Regent is a custom software development firm building products for
> African businesses, including Axis, an ERP and accounting platform.

Regent designs and builds software for companies whose scale and context
outgrow generic, imported tools — with Axis as its flagship in-house
product for finance, inventory, and invoicing.

For agents that want the full content of every published page in one shot
instead of just this map of links, see /llms-full.txt.

## Product

- [Axis](${SITE_URL}/axis): ERP, accounting, inventory, and invoicing platform for growing businesses.
- [Platform](${SITE_URL}/platform): Overview of Regent's technical platform and architecture.
- [Pricing](${SITE_URL}/pricing): Pricing for Regent's products and services.
- [Products](${SITE_URL}/products): Full list of Regent's in-house products.
- [Capabilities](${SITE_URL}/capabilities): What Regent builds and the technical capabilities behind it.
- [Industries](${SITE_URL}/industries): Industries and business types Regent serves.

## Company

- [About](${SITE_URL}/about): Who Regent is and what the company does.
- [Careers](${SITE_URL}/careers): Open roles at Regent.
${section('Blog', postLines)}${section('Case Studies', caseStudyLines)}${section('Resources', resourceLines)}
## Optional

- [Privacy Policy](${SITE_URL}/privacy)
- [Terms](${SITE_URL}/terms)
- [Refund Policy](${SITE_URL}/refund-policy)
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
