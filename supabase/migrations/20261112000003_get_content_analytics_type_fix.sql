-- -----------------------------------------------------------------------------
-- 20261112000003_get_content_analytics_type_fix.sql
-- get_content_analytics() threw 42804 on every call: AVG() over a bigint column
-- returns numeric, but the function's declared RETURN TABLE typed the two
-- averages as double precision. Every admin list (posts, case studies,
-- resources) called this RPC, so the error propagated and the clients fell
-- back to view_count = 0 for all rows. Cast the averages explicitly.
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.get_content_analytics();

CREATE OR REPLACE FUNCTION public.get_content_analytics()
 RETURNS TABLE(
   content_type text,
   content_id uuid,
   title text,
   view_count bigint,
   avg_time_on_page double precision,
   avg_scroll_depth double precision,
   last_viewed_at timestamptz
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT
    cv.content_type,
    cv.content_id,
    COALESCE(bp.title, cs.title, r.title, 'Unknown') AS title,
    COUNT(*) AS view_count,
    (AVG(cv.time_on_page) FILTER (WHERE cv.time_on_page > 0))::double precision AS avg_time_on_page,
    (AVG(cv.scroll_depth) FILTER (WHERE cv.scroll_depth > 0))::double precision AS avg_scroll_depth,
    MAX(cv.created_at) AS last_viewed_at
  FROM content_views cv
  LEFT JOIN blog_posts bp ON cv.content_type = 'blog_post' AND cv.content_id = bp.id
  LEFT JOIN case_studies cs ON cv.content_type = 'case_study' AND cv.content_id = cs.id
  LEFT JOIN resources r ON cv.content_type IN ('resource', 'resource_download') AND cv.content_id = r.id
  GROUP BY cv.content_type, cv.content_id, bp.title, cs.title, r.title
  ORDER BY view_count DESC;
END;
$function$;
