-- -----------------------------------------------------------------------------
-- 20261112000002_content_analytics_fix.sql
-- Fixes per-content analytics reading "0"/resolving NULL for blog posts, case
-- studies and resources.
--
-- a) analytics_views joined resources on content_type = 'resource_download'
--    only, so reader rows tracked as 'resource' never resolved to a resource
--    (title/slug NULL, and dropped by some analytics). Mirror the legacy
--    IN ('resource','resource_download') patch.
-- b) Legacy rows tracked pre-overhaul hold page_path only (content_id NULL) and
--    the 0004 backfill only ran page_path <- content_id, never the reverse, so
--    they never matched the admin lists' content_id join. Backfill content_id
--    from page_path slug matches, idempotently (WHERE content_id IS NULL).
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.analytics_views(
  timestamptz, timestamptz, text, text, text, text, text, boolean
);

CREATE OR REPLACE FUNCTION public.analytics_views(
  p_from timestamptz DEFAULT NULL,
  p_to timestamptz DEFAULT NULL,
  p_content_type text DEFAULT NULL,
  p_slug text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_device text DEFAULT NULL,
  p_include_internal boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  content_type text,
  content_id uuid,
  page_path text,
  created_at timestamptz,
  session_id text,
  visitor_id text,
  device_type text,
  browser text,
  os text,
  referrer_domain text,
  referrer_category text,
  country_code text,
  city text,
  time_on_page bigint,
  scroll_depth bigint,
  is_returning boolean,
  excluded_reason text,
  title text,
  slug text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    cv.id, cv.content_type, cv.content_id, cv.page_path, cv.created_at,
    cv.session_id, cv.visitor_id, cv.device_type, cv.browser, cv.os,
    cv.referrer_domain, cv.referrer_category, cv.country_code, cv.city,
    cv.time_on_page, cv.scroll_depth, cv.is_returning, cv.excluded_reason,
    COALESCE(bp.title, cs.title, r.title),
    COALESCE(bp.slug, cs.slug, r.slug)
  FROM public.content_views cv
  LEFT JOIN public.blog_posts bp
    ON cv.content_type = 'blog_post' AND cv.content_id = bp.id
  LEFT JOIN public.case_studies cs
    ON cv.content_type = 'case_study' AND cv.content_id = cs.id
  LEFT JOIN public.resources r
    ON cv.content_type IN ('resource', 'resource_download') AND cv.content_id = r.id
  WHERE cv.created_at >= COALESCE(p_from, now() - interval '30 days')
    AND cv.created_at <  COALESCE(p_to, now())
    AND (p_include_internal OR cv.excluded_reason IS NULL)
    AND (p_content_type IS NULL OR cv.content_type = p_content_type)
    AND (p_slug IS NULL OR COALESCE(bp.slug, cs.slug, r.slug) = p_slug)
    AND (p_source IS NULL OR cv.referrer_category = p_source)
    AND (p_country IS NULL OR cv.country_code = p_country)
    AND (p_device IS NULL OR cv.device_type = p_device)
$$;

-- Backfill content_id from page_path for legacy slug/path-tracked rows.
UPDATE public.content_views cv
SET content_id = bp.id
FROM public.blog_posts bp
WHERE cv.content_type = 'blog_post'
  AND cv.content_id IS NULL
  AND cv.page_path IN ('/blog/' || bp.slug, '/blog/' || bp.slug || '/');

UPDATE public.content_views cv
SET content_id = cs.id
FROM public.case_studies cs
WHERE cv.content_type = 'case_study'
  AND cv.content_id IS NULL
  AND cv.page_path IN ('/case-studies/' || cs.slug, '/case-studies/' || cs.slug || '/');

UPDATE public.content_views cv
SET content_id = r.id
FROM public.resources r
WHERE cv.content_type IN ('resource', 'resource_download')
  AND cv.content_id IS NULL
  AND cv.page_path IN ('/resources/' || r.slug, '/resources/' || r.slug || '/');
