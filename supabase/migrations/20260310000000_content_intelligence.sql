
-- Add visitor_id for tracking unique visitors across sessions
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS visitor_id text;

-- Update get_content_analytics to include engagement metrics and last viewed
CREATE OR REPLACE FUNCTION public.get_content_analytics()
RETURNS TABLE (
  content_type text,
  content_id uuid,
  title text,
  view_count bigint,
  avg_time_on_page double precision,
  avg_scroll_depth double precision,
  last_viewed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    cv.content_type,
    cv.content_id,
    COALESCE(bp.title, cs.title, r.title, 'Unknown') AS title,
    COUNT(*) AS view_count,
    AVG(cv.time_on_page) FILTER (WHERE cv.time_on_page > 0) AS avg_time_on_page,
    AVG(cv.scroll_depth) FILTER (WHERE cv.scroll_depth > 0) AS avg_scroll_depth,
    MAX(cv.created_at) AS last_viewed_at
  FROM content_views cv
  LEFT JOIN blog_posts bp ON cv.content_type = 'blog_post' AND cv.content_id = bp.id
  LEFT JOIN case_studies cs ON cv.content_type = 'case_study' AND cv.content_id = cs.id
  LEFT JOIN resources r ON cv.content_type = 'resource_download' AND cv.content_id = r.id
  GROUP BY cv.content_type, cv.content_id, bp.title, cs.title, r.title
  ORDER BY view_count DESC
$$;

-- Create get_content_insights for automated suggestions
CREATE OR REPLACE FUNCTION public.get_content_insights()
RETURNS TABLE (
  content_id uuid,
  content_type text,
  title text,
  performance_category text,
  suggestion text,
  metric_value bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      cv.content_id,
      cv.content_type,
      COALESCE(bp.title, cs.title, r.title, 'Unknown') AS content_title,
      COUNT(*) as views,
      AVG(cv.time_on_page) as avg_time,
      MAX(cv.created_at) as last_view
    FROM content_views cv
    LEFT JOIN blog_posts bp ON cv.content_type = 'blog_post' AND cv.content_id = bp.id
    LEFT JOIN case_studies cs ON cv.content_type = 'case_study' AND cv.content_id = cs.id
    LEFT JOIN resources r ON cv.content_type = 'resource_download' AND cv.content_id = r.id
    GROUP BY cv.content_id, cv.content_type, bp.title, cs.title, r.title
  )
  -- Stellar Content (Top 3 by views)
  SELECT
    s.content_id, s.content_type, s.content_title,
    'stellar'::text as performance_category,
    'High traffic. Consider creating a "Part 2" or related deep-dive content.'::text as suggestion,
    s.views as metric_value
  FROM stats s
  ORDER BY s.views DESC
  LIMIT 3

  UNION ALL

  -- Improving (Recent views but low overall)
  SELECT
    s.content_id, s.content_type, s.content_title,
    'improving'::text as performance_category,
    'Gaining traction. Share this on social channels to boost momentum.'::text as suggestion,
    s.views as metric_value
  FROM stats s
  WHERE s.last_view > NOW() - INTERVAL '48 hours'
    AND s.views < (SELECT AVG(views) FROM stats)
  LIMIT 2

  UNION ALL

  -- Underperforming (Old, low views)
  SELECT
    s.content_id, s.content_type, s.content_title,
    'underperforming'::text as performance_category,
    'Low engagement. Try updating the title or meta description for SEO.'::text as suggestion,
    s.views as metric_value
  FROM stats s
  WHERE s.last_view < NOW() - INTERVAL '30 days'
  ORDER BY s.views ASC
  LIMIT 3;
END;
$$;

-- Get count of unique visitors
CREATE OR REPLACE FUNCTION public.get_unique_visitors_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(DISTINCT visitor_id) FROM content_views WHERE visitor_id IS NOT NULL;
$$;

-- Update get_daily_views to include unique sessions (daily visitors)
CREATE OR REPLACE FUNCTION public.get_daily_views(days_back int DEFAULT 30)
RETURNS TABLE (view_date date, view_count bigint, unique_sessions bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    DATE(created_at) AS view_date,
    COUNT(*) AS view_count,
    COUNT(DISTINCT session_id) AS unique_sessions
  FROM content_views
  WHERE created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY DATE(created_at)
  ORDER BY view_date ASC
$$;
