-- -----------------------------------------------------------------------------
-- 20261113000003_subscriber_upgrades.sql
-- Subscriber page round: tags + a note per subscriber so admins can group and
-- annotate the audience, and an updated_at stamp so edits are visible.
-- Additive and repeatable. Edits go through service-role API routes so RLS is
-- untouched.
-- -----------------------------------------------------------------------------

ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT ARRAY[]::text[];
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
