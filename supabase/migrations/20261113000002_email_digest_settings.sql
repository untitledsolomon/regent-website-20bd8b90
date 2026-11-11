-- -----------------------------------------------------------------------------
-- 20261113000002_email_digest_settings.sql
-- Control center for the scheduled AI report emails. A single-row table holds
-- the on/off switches, recipients and send hour for the weekly and (new) daily
-- digests. The Emails page reads and writes it; the optional cron route reads
-- it to decide what to send. Additive and repeatable.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.email_settings (
  id smallint PRIMARY KEY CHECK (id = 1),
  weekly_enabled boolean NOT NULL DEFAULT false,
  weekly_recipients text[] NOT NULL DEFAULT ARRAY[]::text[],
  weekly_hour smallint NOT NULL DEFAULT 9 CHECK (weekly_hour BETWEEN 0 AND 23),
  daily_enabled boolean NOT NULL DEFAULT false,
  daily_recipients text[] NOT NULL DEFAULT ARRAY[]::text[],
  daily_hour smallint NOT NULL DEFAULT 8 CHECK (daily_hour BETWEEN 0 AND 23),
  weekly_last_sent_at timestamptz,
  daily_last_sent_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Keep exactly one row, seeded.
INSERT INTO public.email_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read email_settings" ON public.email_settings;
CREATE POLICY "Admins can read email_settings"
  ON public.email_settings FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update email_settings" ON public.email_settings;
CREATE POLICY "Admins can update email_settings"
  ON public.email_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
