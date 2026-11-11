-- =============================================================================
-- WS3: Tracking schema (additive, idempotent)
-- Regent Analytics & AI Overhaul, 11 Nov 2026
--
--   1. analytics_sessions  — one row per 30-min session (the new tracker's unit)
--   2. content_views extensions — referrer/utm/exclusion attribution columns
--   3. conversion_events   — first-touch-source conversions (newsletter/inquiry/
--                            resource_access), linking the analytics funnel
--   4. content_views INSERT policy dropped: all tracking writes now go through
--      /api/track with the service role (this was the WS1 contract).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. analytics_sessions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  session_id text PRIMARY KEY,
  visitor_id text,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz,
  landing_path text,
  referrer_domain text,
  referrer_category text NOT NULL DEFAULT 'direct',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  country_code text,
  city text,
  device_type text,
  browser text,
  os text,
  is_returning boolean NOT NULL DEFAULT false,
  excluded_reason text
);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started ON public.analytics_sessions (started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor ON public.analytics_sessions (visitor_id);

ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. content_views extensions (country_code, referrer, utm, exclusion)
-- -----------------------------------------------------------------------------
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS country_code text;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS referrer_domain text;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS referrer_category text;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS utm_term text;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS utm_content text;
ALTER TABLE public.content_views ADD COLUMN IF NOT EXISTS excluded_reason text;

-- -----------------------------------------------------------------------------
-- 3. conversion_events
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('newsletter', 'inquiry', 'resource_access')),
  session_id text,
  visitor_id text,
  view_id uuid REFERENCES public.content_views(id) ON DELETE SET NULL,
  content_type text,
  content_id uuid,
  ref_id uuid,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_created ON public.conversion_events (created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_session ON public.conversion_events (session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON public.conversion_events (type);

ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. RLS: sessions + conversions are admin-read; writes come from the service
--    role via /api/track (BYPASSRLS). content_views loses its public INSERT —
--    tracking writes flow through the service role only from here on.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='analytics_sessions' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.analytics_sessions', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='conversion_events' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.conversion_events', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admins can read analytics sessions" ON public.analytics_sessions
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can read conversion events" ON public.conversion_events
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can insert content views" ON public.content_views;
