-- -----------------------------------------------------------------------------
-- 20261113000005_newsletter_sends_counts.sql
-- newsletter_sends started as a bare audit log (subject + sent_at). The Emails
-- page already renders a campaign history with counts and an HTML preview, so
-- give the table the columns it needs and let the send-newsletter edge function
-- record a row per send. Additive and repeatable.
-- -----------------------------------------------------------------------------

ALTER TABLE public.newsletter_sends
  ADD COLUMN IF NOT EXISTS html_preview text,
  ADD COLUMN IF NOT EXISTS sent_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read newsletter_sends" ON public.newsletter_sends;
CREATE POLICY "Admins can read newsletter_sends"
  ON public.newsletter_sends FOR SELECT
  TO authenticated
  USING (public.is_admin());
