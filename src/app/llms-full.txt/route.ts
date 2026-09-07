import { createServiceClient } from '@/lib/supabase/service'

// Hardcoded for the same reason as sitemap.ts: canonical host must never
// silently drift from what's deployed.
const SITE_URL = 'https://www.regentplatform.com'

// Same revalidation window as the sitemap so both stay in sync with
// publish/unpublish state without a redeploy.
export const revalidate = 3600 // 1 hour

// Strip the most common HTML tags so the concatenated plain-text body stays
// readable for agents. Content is authored as HTML in the admin editor, so we
// normalize it rather than dumping raw markup into the response.
function stripHtml(html: string): string {
  return html
    .replace(/<h[1-6][^>]*>/g, '\n\n')
    .replace(/<\/h[1-6]>/g, '\n\n')
    .replace(/<p[^>]*>/g, '\n\n')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<li[^>]*>/g, '\n- ')
    .replace(/<\/li>/g, '')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function postSection(p: {
  title: string
  slug: string
  content: string
  excerpt: string
  author: string
  date: string
}): string {
  const body = stripHtml(p.content) || p.excerpt
  return `## ${p.title}

${body}

Source: ${SITE_URL}/blog/${p.slug}

---`
}

function caseStudySection(cs: {
  title: string
  slug: string
  summary: string
  industry: string
  challenge: string
  solution: string
  results: string[]
  metrics: { value: string; label: string }[]
}): string {
  const parts: string[] = []
  if (cs.summary) parts.push(stripHtml(cs.summary))
  if (cs.challenge) parts.push(`**Challenge:**\n\n${stripHtml(cs.challenge)}`)
  if (cs.solution) parts.push(`**Solution:**\n\n${stripHtml(cs.solution)}`)
  if (cs.results.length > 0) {
    parts.push(`**Results:**\n\n${cs.results.map(r => `- ${stripHtml(r)}`).join('\n')}`)
  }
  if (cs.metrics.length > 0) {
    parts.push(
      `**Metrics:**\n\n${cs.metrics.map(m => `- ${m.value} — ${m.label}`).join('\n')}`
    )
  }
  const industry = cs.industry ? `\n\nIndustry: ${cs.industry}` : ''
  return `## ${cs.title}${industry}

${parts.join('\n\n')}

Source: ${SITE_URL}/case-studies/${cs.slug}

---`
}

function resourceSection(r: {
  title: string
  slug: string
  description: string
  type: string
}): string {
  const body = stripHtml(r.description) || r.type
  return `## ${r.title}

${body}

Source: ${SITE_URL}/resources/${r.slug}

---`
}

export async function GET() {
  const supabase = createServiceClient()

  // Same filter discipline as sitemap.ts / llms.txt: only published rows.
  const [
    { data: posts, error: postsError },
    { data: caseStudies, error: caseStudiesError },
    { data: resources, error: resourcesError },
  ] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('slug, title, excerpt, content, author, date, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false }),
    supabase
      .from('case_studies')
      .select(
        'slug, title, summary, industry, challenge, solution, results, metrics, updated_at'
      )
      .eq('published', true)
      .order('updated_at', { ascending: false }),
    supabase
      .from('resources')
      .select('slug, title, description, type, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false }),
  ])

  if (postsError) console.error('llms-full.txt: failed to fetch blog_posts', postsError)
  if (caseStudiesError)
    console.error('llms-full.txt: failed to fetch case_studies', caseStudiesError)
  if (resourcesError)
    console.error('llms-full.txt: failed to fetch resources', resourcesError)

  const sections = [
    ...(posts ?? []).map(postSection),
    ...(caseStudies ?? []).map(caseStudySection),
    ...(resources ?? []).map(resourceSection),
  ]

  const body = `# Regent — Full Content

> Regent is a custom software development firm building products for
> African businesses, including Axis, an ERP and accounting platform.

This file concatenates the full published content of Regent's blog posts,
case studies, and resources into one document for agents that want to ingest
everything at once. For a token-efficient map of links instead, see
/llms.txt.

---

${sections.join('\n\n')}
`

  // NOTE: no pagination at the current content volume. If the corpus grows
  // large enough that this single response becomes unwieldy, revisit this
  // (e.g. chunk per content type) rather than returning a bloated body.

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
