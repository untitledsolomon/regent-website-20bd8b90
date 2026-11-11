-- -----------------------------------------------------------------------------
-- 20261112000004_analytics_data_quality.sql
-- Two data-quality fixes, both applied at the analytics_* layer so every
-- consumer (dashboard, assistant, MCP, insights) sees the cleaned view:
--
-- 1. Exclude /admin/* views from ALL analytics. The client hook guards /admin,
--    but the DataFast auto-pageview fired there too (row posted as site_view
--    with page_path /admin/...), polluting overview/sources/geo figures.
--    The /api/track route now drops them server-side; this filter also makes
--    legacy rows stop counting without a destructive delete.
--
-- 2. analytics_top_content groups "site_view" rows by page_path instead of
--    collapsing every unattached view into one null-slug bucket. Content rows
--    (blog_post/case_study/resource) have a title and slug; site_view rows have
--    only a page_path, so COALESCE(title, page_path) labels each bucket.
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.analytics_views(timestamp with time zone, timestamp with time zone, text, text, text, text, text, boolean);

CREATE OR REPLACE FUNCTION public.analytics_views(p_from timestamp with time zone DEFAULT NULL::timestamp with time zone, p_to timestamp with time zone DEFAULT NULL::timestamp with time zone, p_content_type text DEFAULT NULL::text, p_slug text DEFAULT NULL::text, p_source text DEFAULT NULL::text, p_country text DEFAULT NULL::text, p_device text DEFAULT NULL::text, p_include_internal boolean DEFAULT false)
 RETURNS TABLE(id uuid, content_type text, content_id uuid, page_path text, created_at timestamp with time zone, session_id text, visitor_id text, device_type text, browser text, os text, referrer_domain text, referrer_category text, country_code text, city text, time_on_page bigint, scroll_depth bigint, is_returning boolean, excluded_reason text, title text, slug text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND (cv.page_path IS NULL OR (cv.page_path <> '/admin' AND cv.page_path NOT LIKE '/admin/%'))
    AND (p_content_type IS NULL OR cv.content_type = p_content_type)
    AND (p_slug IS NULL OR COALESCE(bp.slug, cs.slug, r.slug) = p_slug)
    AND (p_source IS NULL OR cv.referrer_category = p_source)
    AND (p_country IS NULL OR cv.country_code = p_country)
    AND (p_device IS NULL OR cv.device_type = p_device)
$function$;

DROP FUNCTION IF EXISTS public.analytics_top_content(timestamp with time zone, timestamp with time zone, text, text, text, text, text, boolean);

CREATE OR REPLACE FUNCTION public.analytics_top_content(p_from timestamp with time zone DEFAULT NULL::timestamp with time zone, p_to timestamp with time zone DEFAULT NULL::timestamp with time zone, p_content_type text DEFAULT NULL::text, p_slug text DEFAULT NULL::text, p_source text DEFAULT NULL::text, p_country text DEFAULT NULL::text, p_device text DEFAULT NULL::text, p_include_internal boolean DEFAULT false)
 RETURNS TABLE(content_type text, title text, slug text, views bigint, visitors bigint, avg_time_on_page numeric, avg_scroll_depth numeric, engaged_sessions bigint, conversions bigint, last_viewed_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    v.content_type,
    COALESCE(v.title, v.page_path) AS title,
    COALESCE(v.slug, v.page_path) AS slug,
    count(*)::bigint AS views,
    count(DISTINCT v.visitor_id)::bigint AS visitors,
    round(avg(v.time_on_page) FILTER (WHERE v.time_on_page > 0)) AS avg_time_on_page,
    round(avg(v.scroll_depth)) AS avg_scroll_depth,
    count(DISTINCT v.session_id) FILTER (WHERE v.time_on_page >= 30 OR v.scroll_depth >= 50)::bigint AS engaged_sessions,
    count(DISTINCT c.id)::bigint AS conversions,
    max(v.created_at) AS last_viewed_at
  FROM public.analytics_views(
    COALESCE(p_from, now() - interval '30 days'), COALESCE(p_to, now()),
    p_content_type, p_slug, p_source, p_country, p_device, p_include_internal) v
  LEFT JOIN public.analytics_conversions(
    COALESCE(p_from, now() - interval '30 days'), COALESCE(p_to, now()),
    p_content_type, p_slug, p_source, p_country, p_device, p_include_internal) c
    ON c.view_id = v.id
  GROUP BY v.content_type, COALESCE(v.title, v.page_path), COALESCE(v.slug, v.page_path)
  ORDER BY views DESC
$function$;
