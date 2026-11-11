-- -----------------------------------------------------------------------------
-- 20261113000007_email_templates.sql
-- Reusable email shells for the scheduled reports (weekly/daily) and the
-- newsletter. Each row is a standalone email-safe HTML shell with {{...}}
-- placeholders filled at send time by the app:
--   {{logo}} {{preheader}} {{content}} {{subject}} {{year}} {{unsubscribe}}
-- The admin picks which shell each use case renders with via email_settings
-- (weekly/daily/newsletter_template_id). Built-in presets are seeded here;
-- users build more from the Emails > Templates page.
-- -----------------------------------------------------------------------------

-- Templates table ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  kind        text NOT NULL CHECK (kind IN ('weekly', 'daily', 'newsletter', 'any')),
  html        text NOT NULL,
  subject     text,
  is_preset   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admin-only: templates are internal, never exposed to the public site.
CREATE POLICY "Admins can read email templates"
  ON public.email_templates FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage email templates"
  ON public.email_templates FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_email_templates_kind ON public.email_templates (kind);

-- Settings: default template per use case -------------------------------------
ALTER TABLE public.email_settings
  ADD COLUMN IF NOT EXISTS weekly_template_id uuid REFERENCES public.email_templates (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS daily_template_id uuid REFERENCES public.email_templates (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS newsletter_template_id uuid REFERENCES public.email_templates (id) ON DELETE SET NULL;

-- Presets --------------------------------------------------------------------

-- 1) Regent Signal (Axis-style) — navy outer, white rounded card, message
-- panel header with the logo + subject, light footer.
INSERT INTO public.email_templates (id, name, kind, subject, is_preset, html) VALUES
(
  'b1111111-0000-4000-8000-000000000001', 'Regent Signal', 'any', '{{subject}}', true,
  '<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><title>Regent</title></head>
<body style="margin:0;padding:0;background-color:#1A3A5B;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{preheader}}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1A3A5B;">
    <tr>
      <td align="center" style="padding:48px 20px;">
        <table role="presentation" width="440" cellpadding="0" cellspacing="0" border="0" style="max-width:440px;width:100%;background-color:#FFFFFF;border-radius:20px;overflow:hidden;">
          <!-- Message bubble panel -->
          <tr>
            <td style="padding:20px 20px 0 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF2F6;border-radius:16px;">
                <tr>
                  <td style="padding:22px 24px 26px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:14px;">{{logo}}</td>
                        <td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#657081;vertical-align:top;padding-top:2px;">Regent report</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="font-family:Helvetica,Arial,sans-serif;font-size:21px;line-height:27px;font-weight:700;color:#1C2431;padding-bottom:8px;">{{subject}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Main white section -->
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:23px;color:#1C2431;">{{content}}</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F2F4F6;padding:18px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:17px;color:#657081;">
                    &copy; Regent &middot; {{year}}<br/>{{unsubscribe}}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
),
-- 2) Regent Minimal — clean white, plain logo header, content, simple footer.
(
  'b1111111-0000-4000-8000-000000000002', 'Regent Minimal', 'any', '{{subject}}', true,
  '<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><title>Regent</title></head>
<body style="margin:0;padding:0;background-color:#F6F7F9;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{preheader}}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F6F7F9;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E7EAEE;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #E7EAEE;">{{logo}}</td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:23px;color:#1C2431;">{{content}}</td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:18px 32px;border-top:1px solid #E7EAEE;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:17px;color:#95A1B1;">&copy; Regent &middot; {{year}}</p>
              <p style="margin:6px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:17px;color:#95A1B1;">{{unsubscribe}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
)
ON CONFLICT (id) DO NOTHING;

-- Default the scheduled reports + newsletter to the Signal preset.
UPDATE public.email_settings
SET weekly_template_id    = 'b1111111-0000-4000-8000-000000000001',
    daily_template_id     = 'b1111111-0000-4000-8000-000000000001',
    newsletter_template_id = 'b1111111-0000-4000-8000-000000000001',
    updated_at            = now()
WHERE id = 1;

-- Widen ai_usage.feature for the template builder.
ALTER TABLE public.ai_usage DROP CONSTRAINT IF EXISTS ai_usage_feature_check;
ALTER TABLE public.ai_usage ADD CONSTRAINT ai_usage_feature_check CHECK (
  feature IN ('analytics_assistant', 'general_chat', 'test_connection',
              'insights_generator', 'weekly_report', 'consultation_triage', 'editorial_helpers',
              'email_writer', 'digest_daily', 'email_template_builder')
);
