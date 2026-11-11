// Reusable email shells for the scheduled reports (weekly/daily) and the
// newsletter. A template is a standalone email-safe HTML shell with {{...}}
// placeholders that the app fills at send time. Admin-built templates live in
// the email_templates table (Emails > Templates); the built-in fallback shell
// (DEFAULT_SHELL) is inlined here so emails never go out unstyled even before a
// template is picked. Content is always passed in as already-rendered HTML and
// is injected unescaped; the short text fields (preheader/subject) are escaped.

export type TemplateKind = "weekly" | "daily" | "newsletter";

export interface EmailTemplate {
  id: string;
  name: string;
  kind: string;
  html: string;
  subject?: string | null;
  is_preset: boolean;
}

/** Row shape we read from email_settings (weekly/daily/newsletter_template_id). */
export interface EmailTemplateSettings {
  weekly_template_id?: string | null;
  daily_template_id?: string | null;
  newsletter_template_id?: string | null;
}

/** Fields filled into a shell at send/render time. */
export interface EmailTemplateFields {
  /** Already-rendered HTML body (digest markdown-to-HTML or newsletter body). */
  content: string;
  /** Hidden preheader text (optional; falls back to subject). */
  preheader?: string;
  /** Subject line, shown in the message header. */
  subject?: string;
  /** Footer year; defaults to the current year. */
  year?: number;
  /** Per-recipient unsubscribe markup; empty for digests. */
  unsubscribe?: string;
}

/** Escape HTML for the short text fields, so user/AI text cannot break the shell. */
function escapeHtml(text: string): string {
  const escape: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return text.replace(/[&<>"']/g, (c) => escape[c]);
}

/** Preheader: strip tags, collapse whitespace, clamp to ~100 chars. */
export function makePreheader(text: string): string {
  const clean = text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > 100 ? clean.slice(0, 99) + "…" : clean;
}

/** The base64 Regent logo, as an email-safe <img> element. */
export const REGENT_LOGO = `<img src="data:image/png;base64,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" width="28" height="26" alt="Regent" style="display:block;border:0;" />`;

/** Axis-style fallback shell (the "Regent Signal" preset, inlined). */
export const DEFAULT_SHELL = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><title>Regent</title></head>
<body style="margin:0;padding:0;background-color:#1A3A5B;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{preheader}}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1A3A5B;">
    <tr>
      <td align="center" style="padding:48px 20px;">
        <table role="presentation" width="440" cellpadding="0" cellspacing="0" border="0" style="max-width:440px;width:100%;background-color:#FFFFFF;border-radius:20px;overflow:hidden;">
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
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:23px;color:#1C2431;">{{content}}</td>
                </tr>
              </table>
            </td>
          </tr>
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
</html>`;

/** Fill every {placeholder} in a shell. Unknown or missing tokens become "". */
export function renderEmailTemplate(shellHtml: string, fields: EmailTemplateFields): string {
  const year = fields.year ?? new Date().getFullYear();
  const preheader = makePreheader(fields.preheader ?? fields.subject ?? "");
  let html = shellHtml;
  html = html.replace(/\{\{logo\}\}/g, REGENT_LOGO);
  html = html.replace(/\{\{content\}\}/g, fields.content);
  html = html.replace(/\{\{preheader\}\}/g, escapeHtml(preheader));
  html = html.replace(/\{\{subject\}\}/g, escapeHtml(fields.subject ?? ""));
  html = html.replace(/\{\{year\}\}/g, String(year));
  html = html.replace(/\{\{unsubscribe\}\}/g, fields.unsubscribe ?? "");
  return html;
}

/** Resolve the configured shell for a use case, falling back to DEFAULT_SHELL. */
export function resolveTemplateFor(
  kind: TemplateKind,
  settings: EmailTemplateSettings | null | undefined,
  templates: EmailTemplate[] | null | undefined,
): string {
  const id = settings?.[`${kind}_template_id`];
  const found = templates?.find((t) => t.id === id);
  return found?.html || DEFAULT_SHELL;
}

/**
 * Load the settings row and the template list in one shot, for the server
 * routes that render a digest. `supabase` is an admin client (service-role or
 * session). Errors degrade to empty context so callers fall back to
 * DEFAULT_SHELL rather than failing the send.
 */
export async function loadTemplateContext(supabase: any): Promise<{
  settings: EmailTemplateSettings | null;
  templates: EmailTemplate[];
}> {
  try {
    const [{ data: settings }, { data: templates }] = await Promise.all([
      supabase.from("email_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("email_templates").select("*").order("name"),
    ]);
    return { settings: settings ?? null, templates: templates ?? [] };
  } catch {
    return { settings: null, templates: [] };
  }
}

/** Convenience wrapper for the digest send/generate/cron paths and previews. */
export function applyTemplateToHtml(
  kind: TemplateKind,
  contentHtml: string,
  settings: EmailTemplateSettings | null | undefined,
  templates: EmailTemplate[] | null | undefined,
  extra: { subject?: string; unsubscribe?: string } = {},
): string {
  const shell = resolveTemplateFor(kind, settings, templates);
  return renderEmailTemplate(shell, {
    content: contentHtml,
    subject: extra.subject,
    unsubscribe: extra.unsubscribe ?? "",
  });
}
