-- -----------------------------------------------------------------------------
-- 20261112000001_ai_insights_features.sql
-- Admin AI features round: ai_insights table (dashboard insights + weekly
-- report), wider ai_usage.feature for the new generator features, and the
-- consultation-request AI triage columns. Additive and repeatable; writes to
-- ai_insights go through the service role via the API routes, so INSERT/delete
-- policies are intentionally not granted.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'content'
    CHECK (category IN ('content', 'anomaly', 'consultation', 'weekly_report')),
  severity text NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high')),
  title text NOT NULL,
  body text,
  target_type text,
  target_id uuid,
  target_slug text,
  target_url text,
  actionable boolean NOT NULL DEFAULT false,
  generated_by text NOT NULL DEFAULT 'auto',
  dedupe_key text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  dismissed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_generated_at ON public.ai_insights (generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dismissed ON public.ai_insights (category, dismissed_at);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read ai_insights" ON public.ai_insights;
CREATE POLICY "Admins can read ai_insights"
  ON public.ai_insights FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update ai_insights" ON public.ai_insights;
CREATE POLICY "Admins can update ai_insights"
  ON public.ai_insights FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Widen the ai_usage feature enum for the new generator-driven features.
ALTER TABLE public.ai_usage DROP CONSTRAINT IF EXISTS ai_usage_feature_check;
ALTER TABLE public.ai_usage ADD CONSTRAINT ai_usage_feature_check CHECK (
  feature IN ('analytics_assistant', 'general_chat', 'test_connection',
              'insights_generator', 'weekly_report', 'consultation_triage', 'editorial_helpers')
);

-- Consultation AI triage columns.
ALTER TABLE public.consultation_requests ADD COLUMN IF NOT EXISTS ai_summary text;
ALTER TABLE public.consultation_requests ADD COLUMN IF NOT EXISTS ai_category text;
ALTER TABLE public.consultation_requests ADD COLUMN IF NOT EXISTS suggested_reply text;
ALTER TABLE public.consultation_requests ADD COLUMN IF NOT EXISTS processed_at timestamptz;
