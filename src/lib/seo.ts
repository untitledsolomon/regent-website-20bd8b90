import type { Metadata } from 'next'

/** The full company name. The daily brand name is "Regent"; the domain is regentplatform.com. */
export const BRAND = 'Regent Technologies'

// Hardcoded (not env-driven) on purpose: the site-wide title template, the
// canonical tags, robots.ts and the sitemap all target this exact host.
export const SITE_URL = 'https://www.regentplatform.com'

/**
 * Remove a trailing brand suffix so the site-wide title template never appends
 * the brand twice. Handles both "| Regent Technologies" and the older
 * "| Regent" form that can appear in database `meta_title` values.
 */
export function stripBrandSuffix(title: string): string {
  return title
    .replace(/\s*[|–—-]\s*Axis by Regent\s*$/i, '')
    .replace(/\s*[|–—-]\s*Regent Technologies\s*$/i, '')
    .replace(/\s*[|–—-]\s*Regent\s*$/i, '')
    .trim()
}

/**
 * Build a page title for sources that are not already known to fit (blog posts
 * and case-study titles coming from the database). The brand suffix is appended
 * only when the result is 60 characters or fewer — a longer title is returned
 * as an `absolute` so the template does not push it over the limit. Words are
 * never cut. Pages whose own code title already embeds the brand must set
 * `title.absolute` directly rather than go through this helper.
 */
export function seoTitle(base: string): Metadata['title'] {
  const stripped = stripBrandSuffix(base.trim())
  const withBrand = `${stripped} | ${BRAND}`
  return withBrand.length <= 60 ? withBrand : { absolute: stripped }
}
