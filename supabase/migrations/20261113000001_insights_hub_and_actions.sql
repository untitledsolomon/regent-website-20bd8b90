-- -----------------------------------------------------------------------------
-- 20261113000001_insights_hub_and_actions.sql
-- Insights hub round: the admin dashboard card graduates to a full page
-- (/admin/insights). ai_insights gains an `action` (what the "Take action"
-- button does) and an internal `note`; a small ai_insight_comments table gives
-- admins a place to discuss each insight; the ai_usage feature enum widens for
-- the two new generative paths (email writer, daily digest).
-- Additive and repeatable. Writes to ai_insights stay on the service role
-- (API routes), so only SELECT/UPDATE policies exist.
-- -----------------------------------------------------------------------------

-- Action stamps on insight rows. Values used by the UI:
--   create_post_draft  -> open a new blog-post draft seeded from the insight
--   open_editor        -> open the admin editor for target_id / target_url
--   view_analytics     -> open the analytics page
--   null               -> a message-only insight (no action button)
ALTER TABLE public.ai_insights ADD COLUMN IF NOT EXISTS action text;
ALTER TABLE public.ai_insights ADD COLUMN IF NOT EXISTS note text;

-- Comments/discussion thread per insight.
CREATE TABLE IF NOT EXISTS public.ai_insight_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id uuid NOT NULL REFERENCES public.ai_insights (id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(trim(body)) > 0),
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_insight_comments_insight ON public.ai_insight_comments (insight_id, created_at);

ALTER TABLE public.ai_insight_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read ai_insight_comments" ON public.ai_insight_comments;
CREATE POLICY "Admins can read ai_insight_comments"
  ON public.ai_insight_comments FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can write ai_insight_comments" ON public.ai_insight_comments;
CREATE POLICY "Admins can write ai_insight_comments"
  ON public.ai_insight_comments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete ai_insight_comments" ON public.ai_insight_comments;
CREATE POLICY "Admins can delete ai_insight_comments"
  ON public.ai_insight_comments FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Widen the ai_usage feature enum for the two new generative features.
ALTER TABLE public.ai_usage DROP CONSTRAINT IF EXISTS ai_usage_feature_check;
ALTER TABLE public.ai_usage ADD CONSTRAINT ai_usage_feature_check CHECK (
  feature IN ('analytics_assistant', 'general_chat', 'test_connection',
              'insights_generator', 'weekly_report', 'consultation_triage',
              'editorial_helpers', 'email_writer', 'digest_daily')
);
