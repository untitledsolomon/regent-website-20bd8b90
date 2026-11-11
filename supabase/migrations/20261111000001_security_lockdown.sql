-- =============================================================================
-- WS1: Security lockdown (idempotent, straight to production)
-- Regent Analytics & AI Overhaul, 11 Nov 2026
--
-- Closes the audit findings:
--   1. user_roles had an ALL policy for any authenticated user (self-esc to admin)
--   2. has_role had a broken live overload (role = role -> always true) + drift overloads
--   3. content_views had public UPDATE / public SELECT(true) drift policies
--   4. Every analytics function is SECURITY DEFINER with default PUBLIC EXECUTE,
--      so anon callers could read every analytics row, bypassing RLS
--
-- Everything here is guarded and re-runnable (IF NOT EXISTS / CREATE OR REPLACE /
-- policy drops are idempotent).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Canonical public.is_admin() helper.
--    - service_role has no auth.uid() (BYPASSRLS); it must count as admin.
--    - authenticated callers must hold the 'admin' role in user_roles.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '') = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
$$;

-- -----------------------------------------------------------------------------
-- 2. has_role canonicalization.
--    The repo migration defines ONE overload  has_role(_user_id uuid, _role app_role)
--    The live DB drifted to TWO overloads, one of which was broken
--    (role = role, always true for anyone holding any role).
--    Drop the drifted (uuid, text) overload if it exists; CREATE OR REPLACE the
--    canonical (uuid, app_role) overload with the correct EXISTS body.
--
--    Drift tables may carry policies bound to the (uuid, text) overload
--    (e.g. mcp_agents_admins, mcp_call_log_admins on the live DB); a plain
--    DROP FUNCTION then fails with 2BP01 (objects in the catalogs depend on
--    it). CASCADE removes exactly those dependents — the broken always-true
--    overload should not stay referenced by any policy. Policies bound to the
--    canonical (uuid, app_role) overload are untouched, since they depend on a
--    different function object. 0002 re-creates the admin policies for the
--    drift tables it reconciles (mcp_agents, mcp_call_log).
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- -----------------------------------------------------------------------------
-- 3. user_roles policies: admins only for writes, users may read their own roles.
--    Drop ALL existing policies first (this also removes any drift policy such
--    as the audit's permissive ALL-for-authenticated one, whatever its name).
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 4. content_views: drop ALL policies (removes drift public UPDATE / SELECT(true)),
--    keep only anonymous INSERT (public tracking) + admin-gated SELECT.
--    WS3 drops the INSERT policy once all tracking writes go through /api/track.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'content_views'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.content_views', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Anyone can insert content views"
  ON public.content_views FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read content views"
  ON public.content_views FOR SELECT TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. Analytics functions: no public/anon execution + internal admin guard.
--    REVOKE/GRANT uses pg_proc introspection so drifted signatures
--    (e.g. get_conversion_stats) are also covered. The six functions whose
--    bodies the repo knows are then redefined as plpgsql with an
--    is_admin() guard (authenticated non-admins must not bypass RLS through a
--    SECURITY DEFINER function).
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'get_content_analytics', 'get_daily_views', 'get_analytics_detail',
        'get_audience_breakdown', 'get_content_insights',
        'get_unique_visitors_count', 'get_conversion_stats'
      )
  LOOP
    EXECUTE format(
      'REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC, anon',
      fn.proname, fn.args
    );
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated, service_role',
      fn.proname, fn.args
    );
  END LOOP;
END $$;

-- get_content_analytics()  (re-homed resource join: 'resource' AND 'resource_download')
-- DROP-first: legacy signature may differ from this guarded definition on the
-- live DB; the replacement is created in the same (transactional) migration.
DROP FUNCTION IF EXISTS public.get_content_analytics();
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
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    AVG(cv.time_on_page) FILTER (WHERE cv.time_on_page > 0) AS avg_time_on_page,
    AVG(cv.scroll_depth) FILTER (WHERE cv.scroll_depth > 0) AS avg_scroll_depth,
    MAX(cv.created_at) AS last_viewed_at
  FROM content_views cv
  LEFT JOIN blog_posts bp ON cv.content_type = 'blog_post' AND cv.content_id = bp.id
  LEFT JOIN case_studies cs ON cv.content_type = 'case_study' AND cv.content_id = cs.id
  LEFT JOIN resources r ON cv.content_type IN ('resource', 'resource_download') AND cv.content_id = r.id
  GROUP BY cv.content_type, cv.content_id, bp.title, cs.title, r.title
  ORDER BY view_count DESC;
END;
$$;

-- get_daily_views(days_back int)
CREATE OR REPLACE FUNCTION public.get_daily_views(days_back int DEFAULT 30)RETURNS TABLE (view_date date, view_count bigint, unique_sessions bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT
    DATE(created_at) AS view_date,
    COUNT(*) AS view_count,
    COUNT(DISTINCT session_id) AS unique_sessions
  FROM content_views
  WHERE created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY DATE(created_at)
  ORDER BY view_date ASC;
END;
$$;

-- get_analytics_detail(p_limit, p_offset)  (re-homed resource join)
-- DROP-first: the repo baseline defines a 12-column version; the guarded
-- definition below carries the 16-column shape the live DB already has.
DROP FUNCTION IF EXISTS public.get_analytics_detail(integer, integer);
CREATE OR REPLACE FUNCTION public.get_analytics_detail(p_limit int DEFAULT 200, p_offset int DEFAULT 0)
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
  session_id text,
  time_on_page integer,
  scroll_depth integer,
  is_returning boolean,
  converted_to text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT
    cv.id,
    cv.content_type,
    cv.content_id,
    COALESCE(bp.title, cs.title, r.title,
      CASE WHEN cv.content_type IN ('site_view', 'page')
           THEN initcap(replace(cv.content_type, '_', ' '))
           ELSE 'Unknown' END
    ) AS title,
    cv.created_at,
    cv.country,
    cv.city,
    cv.device_type,
    cv.browser,
    cv.os,
    cv.referrer,
    cv.session_id,
    cv.time_on_page,
    cv.scroll_depth,
    cv.is_returning,
    cv.converted_to
  FROM content_views cv
  LEFT JOIN blog_posts bp ON cv.content_type = 'blog_post' AND cv.content_id = bp.id
  LEFT JOIN case_studies cs ON cv.content_type = 'case_study' AND cv.content_id = cs.id
  LEFT JOIN resources r ON cv.content_type IN ('resource', 'resource_download') AND cv.content_id = r.id
  ORDER BY cv.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- get_audience_breakdown()
CREATE OR REPLACE FUNCTION public.get_audience_breakdown()
RETURNS TABLE (dimension text, value text, count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
    WITH dims AS (
      SELECT 'device_type' AS dimension, COALESCE(device_type, 'Unknown') AS value, COUNT(*)::bigint AS count
      FROM content_views GROUP BY device_type
      UNION ALL
      SELECT 'browser', COALESCE(browser, 'Unknown'), COUNT(*)::bigint
      FROM content_views GROUP BY browser
      UNION ALL
      SELECT 'os', COALESCE(os, 'Unknown'), COUNT(*)::bigint
      FROM content_views GROUP BY os
      UNION ALL
      SELECT 'country', COALESCE(country, 'Unknown'), COUNT(*)::bigint
      FROM content_views GROUP BY country
      UNION ALL
      SELECT 'referrer', COALESCE(referrer, 'Direct'), COUNT(*)::bigint
      FROM content_views GROUP BY referrer
    )
    SELECT dimension, value, count FROM dims
    ORDER BY dimension, count DESC;
END;
$$;

-- get_content_insights()
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
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  WITH stats AS (
    SELECT
      cv.content_id,
      cv.content_type,
      COALESCE(bp.title, cs.title, r.title, 'Unknown') AS content_title,
      COUNT(*) AS views,
      AVG(cv.time_on_page) AS avg_time,
      MAX(cv.created_at) AS last_view
    FROM content_views cv
    LEFT JOIN blog_posts bp ON cv.content_type = 'blog_post' AND cv.content_id = bp.id
    LEFT JOIN case_studies cs ON cv.content_type = 'case_study' AND cv.content_id = cs.id
    LEFT JOIN resources r ON cv.content_type IN ('resource', 'resource_download') AND cv.content_id = r.id
    GROUP BY cv.content_id, cv.content_type, bp.title, cs.title, r.title
  )
  SELECT
    s.content_id, s.content_type, s.content_title,
    'stellar'::text AS performance_category,
    'High traffic. Consider creating a "Part 2" or related deep-dive content.'::text AS suggestion,
    s.views AS metric_value
  FROM stats s
  ORDER BY s.views DESC
  LIMIT 3

  UNION ALL

  SELECT
    s.content_id, s.content_type, s.content_title,
    'improving'::text,
    'Gaining traction. Share this on social channels to boost momentum.'::text,
    s.views
  FROM stats s
  WHERE s.last_view > NOW() - INTERVAL '48 hours'
    AND s.views < (SELECT AVG(views) FROM stats)
  LIMIT 2

  UNION ALL

  SELECT
    s.content_id, s.content_type, s.content_title,
    'underperforming'::text,
    'Low engagement. Try updating the title or meta description for SEO.'::text,
    s.views
  FROM stats s
  WHERE s.last_view < NOW() - INTERVAL '30 days'
  ORDER BY s.views ASC
  LIMIT 3;
END;
$$;

-- get_unique_visitors_count()
CREATE OR REPLACE FUNCTION public.get_unique_visitors_count()
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN (SELECT COUNT(DISTINCT visitor_id) FROM content_views WHERE visitor_id IS NOT NULL);
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. Re-home the two schema pieces that currently exist only in the MCP repo
--    (decided: the site repo owns schema). The polymorphic-FK triggers prevent
--    orphaned content_views rows; they live with the tables they touch.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_content_view_reference()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.content_type = 'blog_post' THEN
    IF NOT EXISTS (SELECT 1 FROM blog_posts WHERE id = NEW.content_id) THEN
      RAISE EXCEPTION 'content_views: no blog_posts row with id % (content_type=blog_post)', NEW.content_id;
    END IF;
  ELSIF NEW.content_type = 'case_study' THEN
    IF NOT EXISTS (SELECT 1 FROM case_studies WHERE id = NEW.content_id) THEN
      RAISE EXCEPTION 'content_views: no case_studies row with id % (content_type=case_study)', NEW.content_id;
    END IF;
  ELSIF NEW.content_type IN ('resource', 'resource_download') THEN
    IF NOT EXISTS (SELECT 1 FROM resources WHERE id = NEW.content_id) THEN
      RAISE EXCEPTION 'content_views: no resources row with id % (content_type=%)', NEW.content_id, NEW.content_type;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_content_view_reference ON public.content_views;
CREATE TRIGGER trg_check_content_view_reference
  BEFORE INSERT OR UPDATE ON public.content_views
  FOR EACH ROW
  EXECUTE FUNCTION public.check_content_view_reference();

CREATE OR REPLACE FUNCTION public.cascade_delete_content_views()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'blog_posts' THEN
    DELETE FROM content_views WHERE content_id = OLD.id AND content_type = 'blog_post';
  ELSIF TG_TABLE_NAME = 'case_studies' THEN
    DELETE FROM content_views WHERE content_id = OLD.id AND content_type = 'case_study';
  ELSIF TG_TABLE_NAME = 'resources' THEN
    DELETE FROM content_views WHERE content_id = OLD.id AND content_type IN ('resource', 'resource_download');
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_cascade_delete_blog_posts ON public.blog_posts;
CREATE TRIGGER trg_cascade_delete_blog_posts
  AFTER DELETE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.cascade_delete_content_views();

DROP TRIGGER IF EXISTS trg_cascade_delete_case_studies ON public.case_studies;
CREATE TRIGGER trg_cascade_delete_case_studies
  AFTER DELETE ON public.case_studies
  FOR EACH ROW
  EXECUTE FUNCTION public.cascade_delete_content_views();

DROP TRIGGER IF EXISTS trg_cascade_delete_resources ON public.resources;
CREATE TRIGGER trg_cascade_delete_resources
  AFTER DELETE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.cascade_delete_content_views();
