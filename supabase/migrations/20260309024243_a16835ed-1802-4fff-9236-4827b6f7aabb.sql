
-- Create content_views table
CREATE TABLE public.content_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public tracking)
CREATE POLICY "Anyone can insert content views"
ON public.content_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admins can read all
CREATE POLICY "Admins can read content views"
ON public.content_views
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Analytics function: top content by views
CREATE OR REPLACE FUNCTION public.get_content_analytics()
RETURNS TABLE (content_type text, content_id uuid, title text, view_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    cv.content_type,
    cv.content_id,
    COALESCE(
      bp.title,
      cs.title,
      r.title,
      'Unknown'
    ) AS title,
    COUNT(*) AS view_count
  FROM content_views cv
  LEFT JOIN blog_posts bp ON cv.content_type = 'blog_post' AND cv.content_id = bp.id
  LEFT JOIN case_studies cs ON cv.content_type = 'case_study' AND cv.content_id = cs.id
  LEFT JOIN resources r ON cv.content_type = 'resource_download' AND cv.content_id = r.id
  GROUP BY cv.content_type, cv.content_id, bp.title, cs.title, r.title
  ORDER BY view_count DESC
  LIMIT 20
$$;

-- Daily views function for chart
CREATE OR REPLACE FUNCTION public.get_daily_views(days_back int DEFAULT 30)
RETURNS TABLE (view_date date, view_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    DATE(created_at) AS view_date,
    COUNT(*) AS view_count
  FROM content_views
  WHERE created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY DATE(created_at)
  ORDER BY view_date ASC
$$;
