-- -----------------------------------------------------------------------------
-- 20261112000005_subscriber_dedupe_templates.sql
-- Two round-4 features:
--
-- 1. Newsletter-subscriber dedupe. The resource gates and footer wrote a fresh
--    newsletter_subscribers row per device / per signup, so one person with the
--    same email could appear several times. Fix at the data layer:
--      * Drop the duplicate rows that already exist (keep the earliest signup).
--      * Add a unique index on lower(trim(email)) so the DB itself blocks
--        future duplicates regardless of case or whitespace.
--      * Add record_newsletter_subscriber(), the SECURITY DEFINER path that all
--        client call sites use. It normalizes the email, inserts only when the
--        address is genuinely new (returns the new id), and returns NULL for an
--        existing address so callers can keep their "already subscribed" UX.
--        RLS on newsletter_subscribers only allows INSERT to the public role, so
--        the upsert/select-in-return logic has to live behind this function.
--
-- 2. newsletter_templates: a small table of reusable email templates so the
--    Emails section can show them and Composer can save/load them.
-- -----------------------------------------------------------------------------

-- ---- Subscriber dedupe -------------------------------------------------------

-- Remove existing duplicates: for each normalized email, keep the earliest row.
WITH ranked AS (
  SELECT id,
         row_number() OVER (PARTITION BY lower(trim(email)) ORDER BY created_at ASC, id ASC) AS rn
  FROM public.newsletter_subscribers
)
DELETE FROM public.newsletter_subscribers ns
USING ranked r
WHERE ns.id = r.id AND r.rn > 1;

-- The DB is now the enforcement point for future duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_normalized_idx
  ON public.newsletter_subscribers (lower(trim(email)));

CREATE OR REPLACE FUNCTION public.record_newsletter_subscriber(p_email text, p_source text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email text := lower(trim(p_email));
  v_id uuid;
BEGIN
  IF v_email IS NULL OR length(v_email) < 4 OR position('@' IN v_email) = 0 THEN
    RETURN NULL;
  END IF;

  -- Fresh address -> insert and return the new id (callers send the welcome
  -- email / track the conversion). Known address -> do nothing and return NULL
  -- (callers show "already subscribed" and never write a second row).
  INSERT INTO public.newsletter_subscribers (email, source)
  VALUES (v_email, NULLIF(trim(COALESCE(p_source, '')), ''))
  ON CONFLICT (lower(email)) DO NOTHING
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

-- The function replaces the plain public INSERT the site used before; grant it
-- to the roles the sites run as. SECURITY DEFINER runs as the table owner, so
-- none of these roles need direct INSERT once they use the function.
GRANT EXECUTE ON FUNCTION public.record_newsletter_subscriber(text, text)
  TO anon, authenticated, service_role;

-- ---- Reusable email templates -------------------------------------------------

CREATE TABLE IF NOT EXISTS public.newsletter_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL DEFAULT '',
  html text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;

-- Admin-only: templates are internal; never exposed to the public site.
CREATE POLICY "Admins can read newsletter templates"
  ON public.newsletter_templates FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage newsletter templates"
  ON public.newsletter_templates FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
