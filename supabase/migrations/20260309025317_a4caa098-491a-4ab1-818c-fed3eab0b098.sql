
-- Add rich tracking columns to content_views
ALTER TABLE public.content_views
  ADD COLUMN country text,
  ADD COLUMN city text,
  ADD COLUMN device_type text,
  ADD COLUMN browser text,
  ADD COLUMN os text,
  ADD COLUMN referrer text,
  ADD COLUMN session_id text;

-- Function: get detailed analytics with content titles
CREATE OR REPLACE FUNCTION public.get_analytics_detail(p_limit int DEFAULT 100, p_offset int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  content_type text,
  content_id uuid,
  title text,
  created_at timestamptz,
  country text,
  city text,
  device_type text,
  browser text,
  os text,
  referrer text,
  session_id text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    cv.id,
    cv.content_type,
    cv.content_id,
    COALESCE(bp.title, cs.title, r.title, 'Unknown') AS title,
    cv.created_at,
    cv.country,
    cv.city,
    cv.device_type,
    cv.browser,
    cv.os,
    cv.referrer,
    cv.session_id
  FROM content_views cv
  LEFT JOIN blog_posts bp ON cv.content_type = 'blog_post' AND cv.content_id = bp.id
  LEFT JOIN case_studies cs ON cv.content_type = 'case_study' AND cv.content_id = cs.id
  LEFT JOIN resources r ON cv.content_type = 'resource_download' AND cv.content_id = r.id
  ORDER BY cv.created_at DESC
  LIMIT p_limit OFFSET p_offset
$$;

-- Function: audience breakdown aggregation
CREATE OR REPLACE FUNCTION public.get_audience_breakdown()
RETURNS TABLE (
  dimension text,
  value text,
  count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 'device_type' AS dimension, COALESCE(device_type, 'Unknown'), COUNT(*)
  FROM content_views GROUP BY device_type
  UNION ALL
  SELECT 'browser', COALESCE(browser, 'Unknown'), COUNT(*)
  FROM content_views GROUP BY browser
  UNION ALL
  SELECT 'os', COALESCE(os, 'Unknown'), COUNT(*)
  FROM content_views GROUP BY os
  UNION ALL
  SELECT 'country', COALESCE(country, 'Unknown'), COUNT(*)
  FROM content_views GROUP BY country
  UNION ALL
  SELECT 'referrer', COALESCE(referrer, 'Direct'), COUNT(*)
  FROM content_views GROUP BY referrer
  ORDER BY dimension, count DESC
$$;
