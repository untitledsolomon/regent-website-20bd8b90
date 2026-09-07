import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.regentplatform.com'

  // Explicit Allow rules for the AI/LLM crawlers. The default `*` rule already
  // allows everything except /admin/, so these don't widen access — they make
  // the existing allowance explicit per-bot. Several GEO/AI-visibility audits
  // score the absence of explicit Allow entries for these user-agents as a
  // gap, and this site's whole point is to be referenced from AI chats.
  const aiBots = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'PerplexityBot', 'anthropic-ai']

  return {
    rules: [
      ...aiBots.map(userAgent => ({
        userAgent,
        allow: '/',
        disallow: '/admin/',
      })),
      {
        userAgent: '*',
        allow: '/',
        disallow: '/admin/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
