-- =============================================================================
-- WS1 step 6: Reconcile live-DB drift back into the repo (idempotent).
--
-- The live database has schema and functions that no repo migration defines
-- (columns added by hand, tables created outside migrations, functions created
-- on the live DB). This migration snapshots that state so the repo matches the
-- database. Everything is IF NOT EXISTS / guarded so it is a no-op on the live
-- DB and a faithful reconstruction on a fresh one.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- content_views columns the client tracker has relied on since before the
-- repo caught up (page_path, time_on_page, scroll_depth, converted_to,
-- is_returning); content_id is nullable in the live DB (page paths live in
-- page_path while content UUIDs live in content_id).
-- -----------------------------------------------------------------------------
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS page_path text;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS time_on_page integer;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS scroll_depth integer;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS converted_to text;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS is_returning boolean;
ALTER TABLE public.content_views ALTER COLUMN content_id DROP NOT NULL;

-- -----------------------------------------------------------------------------
-- inquiry workflow columns on consultation_requests (live-DB drift)
-- -----------------------------------------------------------------------------
ALTER TABLE public.consultation_requests ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
ALTER TABLE public.consultation_requests ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.consultation_requests ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.consultation_requests ADD COLUMN IF NOT EXISTS replied_at timestamptz;
ALTER TABLE public.consultation_requests ADD COLUMN IF NOT EXISTS replied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- scattered drift columns
-- -----------------------------------------------------------------------------
ALTER TABLE public.careers ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';

-- -----------------------------------------------------------------------------
-- Drift tables (no migration ever created them on the live DB)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.known_sessions (
  session_id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletter_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.application_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.job_applications(id) ON DELETE CASCADE,
  body text NOT NULL,
  replied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inquiry_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid REFERENCES public.consultation_requests(id) ON DELETE CASCADE,
  note text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mcp_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  api_key_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  revoked_at timestamptz
);

ALTER TABLE public.application_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_agents ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='application_replies' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.application_replies', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='inquiry_notes' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.inquiry_notes', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='mcp_agents' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.mcp_agents', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admins can read application replies" ON public.application_replies
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert application replies" ON public.application_replies
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Admins can read inquiry notes" ON public.inquiry_notes
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert inquiry notes" ON public.inquiry_notes
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage mcp agents" ON public.mcp_agents
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- get_conversion_stats(): drift function the dashboard already calls.
-- Re-homed into the repo, admin-guarded like the other analytics functions.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'get_conversion_stats'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s)', fn.proname, fn.args);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.get_conversion_stats()
RETURNS TABLE (conversion_type text, count bigint)
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
  SELECT 'newsletter'::text, COUNT(*)::bigint FROM public.newsletter_subscribers
  UNION ALL
  SELECT 'inquiry', COUNT(*)::bigint FROM public.consultation_requests
  ORDER BY 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_conversion_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_conversion_stats() TO authenticated, service_role;
