-- -----------------------------------------------------------------------------
-- 20261111000005_analytics_functions.sql
-- WS4: the analytics_* family. Shared 8-param filter signature
--   (p_from, p_to, p_content_type, p_slug, p_source, p_country, p_device,
--    p_include_internal DEFAULT false)
-- p_from inclusive / p_to exclusive; NULL -> now()-30d / now.
-- All SECURITY DEFINER, gated by public.is_admin(), executable by
-- authenticated + service_role only. Non-null excluded_reason rows are
-- excluded unless p_include_internal. Engaged = time_on_page >= 30 OR
-- scroll_depth >= 50. Conversions come from conversion_events; inquiry
-- statuses from consultation_requests.status.
-- Also retires the drift-only known_sessions table (superseded by
-- analytics_sessions in 0003).
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS public.known_sessions CASCADE;

-- -----------------------------------------------------------------------------
-- Internal helper: filtered, enriched view rows.
-- One LEFT JOIN per content table, scoped by content_type like the legacy
-- get_content_analytics, so title/slug come from the owning table.
-- -----------------------------------------------------------------------------
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
    ON cv.content_type = 'resource_download' AND cv.content_id = r.id
  WHERE cv.created_at >= COALESCE(p_from, now() - interval '30 days')
    AND cv.created_at <  COALESCE(p_to, now())
    AND (p_include_internal OR cv.excluded_reason IS NULL)
    AND (p_content_type IS NULL OR cv.content_type = p_content_type)
    AND (p_slug IS NULL OR COALESCE(bp.slug, cs.slug, r.slug) = p_slug)
    AND (p_source IS NULL OR cv.referrer_category = p_source)
    AND (p_country IS NULL OR cv.country_code = p_country)
    AND (p_device IS NULL OR cv.device_type = p_device)
$$;

-- -----------------------------------------------------------------------------
-- Internal helper: filtered conversion_events.
-- Session columns (country/device) and the tracked source come from the
-- session row; p_slug filters through the source view (view_id).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_conversions(
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
  type text,
  session_id text,
  visitor_id text,
  view_id uuid,
  content_id uuid,
  ref_id uuid,
  source text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ce.id, ce.type, ce.session_id, ce.visitor_id, ce.view_id,
    ce.content_id, ce.ref_id, ce.source, ce.created_at
  FROM public.conversion_events ce
  LEFT JOIN public.analytics_sessions s ON s.session_id = ce.session_id
  LEFT JOIN public.content_views v ON v.id = ce.view_id
  WHERE ce.created_at >= COALESCE(p_from, now() - interval '30 days')
    AND ce.created_at <  COALESCE(p_to, now())
    AND (p_include_internal OR s.session_id IS NULL OR s.excluded_reason IS NULL)
    AND (p_content_type IS NULL OR ce.content_type = p_content_type)
    AND (p_slug IS NULL OR v.page_path = p_slug)
    AND (p_source IS NULL OR ce.source = p_source)
    AND (p_country IS NULL OR s.country_code = p_country)
    AND (p_device IS NULL OR s.device_type = p_device)
$$;

-- -----------------------------------------------------------------------------
-- 1. analytics_overview: headline metrics with equal-length previous period.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_overview(
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
  views bigint, prev_views bigint, views_change numeric,
  visitors bigint, prev_visitors bigint, visitors_change numeric,
  sessions bigint, prev_sessions bigint, sessions_change numeric,
  engaged_views bigint, prev_engaged_views bigint, engaged_views_change numeric,
  engaged_rate numeric, prev_engaged_rate numeric, engaged_rate_change numeric,
  avg_time_on_page numeric, prev_avg_time_on_page numeric, avg_time_change numeric,
  conversions bigint, prev_conversions bigint, conversions_change numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from  timestamptz := COALESCE(p_from, now() - interval '30 days');
  v_to    timestamptz := COALESCE(p_to, now());
  v_len   interval := v_to - v_from;
  v_prev  timestamptz := v_from - v_len;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  RETURN QUERY
  WITH cur AS (
    SELECT
      count(*)::bigint AS views,
      count(DISTINCT visitor_id)::bigint AS visitors,
      count(DISTINCT session_id)::bigint AS sessions,
      count(*) FILTER (WHERE time_on_page >= 30 OR scroll_depth >= 50)::bigint AS engaged_views,
      avg(time_on_page) FILTER (WHERE time_on_page > 0) AS avg_t
    FROM public.analytics_views(v_from, v_to, p_content_type, p_slug, p_source, p_country, p_device, p_include_internal)
  ), prev AS (
    SELECT
      count(*)::bigint AS views,
      count(DISTINCT visitor_id)::bigint AS visitors,
      count(DISTINCT session_id)::bigint AS sessions,
      count(*) FILTER (WHERE time_on_page >= 30 OR scroll_depth >= 50)::bigint AS engaged_views,
      avg(time_on_page) FILTER (WHERE time_on_page > 0) AS avg_t
    FROM public.analytics_views(v_prev, v_from, p_content_type, p_slug, p_source, p_country, p_device, p_include_internal)
  ), curconv AS (
    SELECT count(*)::bigint AS c FROM public.analytics_conversions(v_from, v_to, p_content_type, p_slug, p_source, p_country, p_device, p_include_internal)
  ), prevconv AS (
    SELECT count(*)::bigint AS c FROM public.analytics_conversions(v_prev, v_from, p_content_type, p_slug, p_source, p_country, p_device, p_include_internal)
  )
  SELECT
    cur.views, prev.views, round((cur.views - prev.views)::numeric * 100.0 / NULLIF(prev.views, 0), 1),
    cur.visitors, prev.visitors, round((cur.visitors - prev.visitors)::numeric * 100.0 / NULLIF(prev.visitors, 0), 1),
    cur.sessions, prev.sessions, round((cur.sessions - prev.sessions)::numeric * 100.0 / NULLIF(prev.sessions, 0), 1),
    cur.engaged_views, prev.engaged_views, round((cur.engaged_views - prev.engaged_views)::numeric * 100.0 / NULLIF(prev.engaged_views, 0), 1),
    round(cur.engaged_views::numeric * 100.0 / NULLIF(cur.sessions, 0), 1),
    round(prev.engaged_views::numeric * 100.0 / NULLIF(prev.sessions, 0), 1),
    CASE WHEN prev.sessions IS NULL OR prev.sessions = 0 THEN NULL
         ELSE round((cur.engaged_views::numeric * 100.0 / NULLIF(cur.sessions, 0))
                  - (prev.engaged_views::numeric * 100.0 / NULLIF(prev.sessions, 0)), 1)
    END,
    round(cur.avg_t), round(prev.avg_t),
    CASE WHEN prev.avg_t IS NULL OR prev.avg_t = 0 THEN NULL
         ELSE round((cur.avg_t - prev.avg_t) * 100.0 / prev.avg_t, 1)
    END,
    curconv.c, prevconv.c, round((curconv.c - prevconv.c)::numeric * 100.0 / NULLIF(prevconv.c, 0), 1)
  FROM cur, prev, curconv, prevconv;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. analytics_daily: daily series.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_daily(
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
  day date,
  views bigint,
  visitors bigint,
  sessions bigint,
  engaged_views bigint,
  conversions bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.day,
    sum(v.views)::bigint,
    sum(v.visitors)::bigint,
    sum(v.sessions)::bigint,
    sum(v.engaged_views)::bigint,
    coalesce(sum(c.c), 0)::bigint
  FROM (
    SELECT
      date_trunc('day', created_at)::date AS day,
      count(*) AS views,
      count(DISTINCT visitor_id) AS visitors,
      count(DISTINCT session_id) AS sessions,
      count(*) FILTER (WHERE time_on_page >= 30 OR scroll_depth >= 50) AS engaged_views
    FROM public.analytics_views(
      COALESCE(p_from, now() - interval '30 days'), COALESCE(p_to, now()),
      p_content_type, p_slug, p_source, p_country, p_device, p_include_internal)
    GROUP BY 1
  ) v
  LEFT JOIN (
    SELECT date_trunc('day', created_at)::date AS day, count(*) AS c
    FROM public.analytics_conversions(
      COALESCE(p_from, now() - interval '30 days'), COALESCE(p_to, now()),
      p_content_type, p_slug, p_source, p_country, p_device, p_include_internal)
    GROUP BY 1
  ) c ON c.day = v.day
  GROUP BY v.day
  ORDER BY v.day
$$;

-- -----------------------------------------------------------------------------
-- 3. analytics_top_content: per-content-piece aggregates, sorted by views.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_top_content(
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
  content_type text,
  title text,
  slug text,
  views bigint,
  visitors bigint,
  avg_time_on_page numeric,
  avg_scroll_depth numeric,
  engaged_sessions bigint,
  conversions bigint,
  last_viewed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.content_type,
    v.title,
    v.slug,
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
  GROUP BY v.content_type, v.title, v.slug
  ORDER BY views DESC
$$;

-- -----------------------------------------------------------------------------
-- 4. analytics_content_trend: daily rows per content piece (top 25 by views,
--    or a single piece when p_slug is set).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_content_trend(
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
  content_type text,
  title text,
  slug text,
  day date,
  views bigint,
  visitors bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ranked AS (
    SELECT v.content_type, v.content_id, v.title, v.slug, count(*) AS p_views
    FROM public.analytics_views(
      COALESCE(p_from, now() - interval '30 days'), COALESCE(p_to, now()),
      p_content_type, p_slug, p_source, p_country, p_device, p_include_internal) v
    GROUP BY v.content_type, v.content_id, v.title, v.slug
    ORDER BY p_views DESC
    LIMIT CASE WHEN COALESCE(p_slug, '') = '' THEN 25 ELSE 500 END
  )
  SELECT
    v.content_type, v.title, v.slug,
    date_trunc('day', v.created_at)::date AS day,
    count(*)::bigint AS views,
    count(DISTINCT v.visitor_id)::bigint AS visitors
  FROM public.analytics_views(
    COALESCE(p_from, now() - interval '30 days'), COALESCE(p_to, now()),
    p_content_type, p_slug, p_source, p_country, p_device, p_include_internal) v
  JOIN ranked r ON r.content_type = v.content_type AND r.content_id = v.content_id
  GROUP BY v.content_type, v.title, v.slug, 4
  ORDER BY v.title, day
$$;

-- -----------------------------------------------------------------------------
-- 5. analytics_sources: channel attribution + source domain.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_sources(
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
  channel text,
  source text,
  sessions bigint,
  visitors bigint,
  views bigint,
  conversions bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.referrer_category AS channel,
    v.referrer_domain AS source,
    count(DISTINCT v.session_id)::bigint AS sessions,
    count(DISTINCT v.visitor_id)::bigint AS visitors,
    count(*)::bigint AS views,
    coalesce(max(cc.c), 0)::bigint AS conversions
  FROM public.analytics_views(
    COALESCE(p_from, now() - interval '30 days'), COALESCE(p_to, now()),
    p_content_type, p_slug, p_source, p_country, p_device, p_include_internal) v
  LEFT JOIN (
    SELECT ce.source, count(*) AS c
    FROM public.analytics_conversions(
      COALESCE(p_from, now() - interval '30 days'), COALESCE(p_to, now()),
      p_content_type, p_slug, p_source, p_country, p_device, p_include_internal) ce
    GROUP BY ce.source
  ) cc ON cc.source = v.referrer_category
  GROUP BY v.referrer_category, v.referrer_domain, cc.c
  ORDER BY views DESC
$$;

-- -----------------------------------------------------------------------------
-- 6. analytics_geo: by country code, % of views.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_geo(
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
  country_code text,
  sessions bigint,
  visitors bigint,
  views bigint,
  share numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.country_code,
    count(DISTINCT v.session_id)::bigint,
    count(DISTINCT v.visitor_id)::bigint,
    count(*)::bigint AS views,
    round(count(*)::numeric * 100.0 / NULLIF(sum(count(*)) OVER (), 0), 1)
  FROM public.analytics_views(
    COALESCE(p_from, now() - interval '30 days'), COALESCE(p_to, now()),
    p_content_type, p_slug, p_source, p_country, p_device, p_include_internal) v
  WHERE v.country_code IS NOT NULL
  GROUP BY v.country_code
  ORDER BY views DESC
$$;

-- -----------------------------------------------------------------------------
-- 7. analytics_devices: by device type.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_devices(
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
  device_type text,
  sessions bigint,
  visitors bigint,
  views bigint,
  share numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.device_type,
    count(DISTINCT v.session_id)::bigint,
    count(DISTINCT v.visitor_id)::bigint,
    count(*)::bigint AS views,
    round(count(*)::numeric * 100.0 / NULLIF(sum(count(*)) OVER (), 0), 1)
  FROM public.analytics_views(
    COALESCE(p_from, now() - interval '30 days'), COALESCE(p_to, now()),
    p_content_type, p_slug, p_source, p_country, p_device, p_include_internal) v
  WHERE v.device_type IS NOT NULL
  GROUP BY v.device_type
  ORDER BY views DESC
$$;

-- -----------------------------------------------------------------------------
-- 8. analytics_funnel: Visitors -> Engaged -> Converted + inquiry statuses.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_funnel(
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
  visitors bigint,
  engaged_visitors bigint,
  converted_visitors bigint,
  engaged_rate numeric,
  conversion_rate numeric,
  engaged_drop numeric,
  converted_drop numeric,
  inquiry_statuses jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from  timestamptz := COALESCE(p_from, now() - interval '30 days');
  v_to    timestamptz := COALESCE(p_to, now());
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  RETURN QUERY
  WITH views AS (
    SELECT visitor_id,
           (time_on_page >= 30 OR scroll_depth >= 50) AS engaged
    FROM public.analytics_views(v_from, v_to, p_content_type, p_slug, p_source, p_country, p_device, p_include_internal)
  ), conv AS (
    SELECT DISTINCT visitor_id
    FROM public.analytics_conversions(v_from, v_to, p_content_type, p_slug, p_source, p_country, p_device, p_include_internal)
    WHERE visitor_id IS NOT NULL
  ), statuses AS (
    SELECT cr.status, count(*) AS c
    FROM public.consultation_requests cr
    JOIN (
      SELECT DISTINCT ref_id
      FROM public.analytics_conversions(v_from, v_to, p_content_type, p_slug, p_source, p_country, p_device, p_include_internal)
      WHERE type = 'inquiry' AND ref_id IS NOT NULL
    ) i ON i.ref_id = cr.id
    GROUP BY cr.status
  )
  SELECT
    (SELECT count(DISTINCT visitor_id) FROM views)::bigint,
    (SELECT count(DISTINCT visitor_id) FROM views WHERE engaged)::bigint,
    (SELECT count(*) FROM conv)::bigint,
    round((SELECT count(DISTINCT visitor_id) FROM views WHERE engaged)::numeric
          * 100.0 / NULLIF((SELECT count(DISTINCT visitor_id) FROM views), 0), 1),
    round((SELECT count(*) FROM conv)::numeric
          * 100.0 / NULLIF((SELECT count(DISTINCT visitor_id) FROM views), 0), 1),
    round(((SELECT count(DISTINCT visitor_id) FROM views)
         - (SELECT count(DISTINCT visitor_id) FROM views WHERE engaged))::numeric
          * 100.0 / NULLIF((SELECT count(DISTINCT visitor_id) FROM views), 0), 1),
    round(((SELECT count(DISTINCT visitor_id) FROM views WHERE engaged)
         - (SELECT count(*) FROM conv))::numeric
          * 100.0 / NULLIF((SELECT count(DISTINCT visitor_id) FROM views WHERE engaged), 0), 1),
    COALESCE((SELECT jsonb_object_agg(status, c) FROM statuses), '{}'::jsonb)
  ;
END;
$$;

-- -----------------------------------------------------------------------------
-- 9. analytics_unique_visitors: distinct visitors + sessions per day.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_unique_visitors(
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
  day date,
  visitors bigint,
  sessions bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    date_trunc('day', created_at)::date AS day,
    count(DISTINCT visitor_id)::bigint AS visitors,
    count(DISTINCT session_id)::bigint AS sessions
  FROM public.analytics_views(
    COALESCE(p_from, now() - interval '30 days'), COALESCE(p_to, now()),
    p_content_type, p_slug, p_source, p_country, p_device, p_include_internal)
  GROUP BY 1
  ORDER BY 1
$$;

-- -----------------------------------------------------------------------------
-- Executable by authenticated admins + the service role; never anon/public.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  fn text;
BEGIN
  FOR fn IN SELECT p.proname
            FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public'
              AND p.proname IN (
                'analytics_views', 'analytics_conversions',
                'analytics_overview', 'analytics_daily', 'analytics_top_content',
                'analytics_content_trend', 'analytics_sources', 'analytics_geo',
                'analytics_devices', 'analytics_funnel', 'analytics_unique_visitors'
              )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I FROM anon, public', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I TO authenticated, service_role', fn);
  END LOOP;
END;
$$;
