// WS6: deliver a rendered digest email through the send-ai-report edge function.
// RESEND_API_KEY lives only in the edge function secrets (Next runtime may not
// hold it), so every digest send funnels through there. The edge function
// accepts an authenticated admin's access token OR the service-role key (the
// cron route has no user session). Browser-triggered sends pass the admin's own
// session token so they never depend on the app's service-role key value; the
// token falls back to the service-role key for keyless callers (cron).

export interface SendDigestInput {
  subject: string;
  html: string;
  to: string[];
  /** Admin session access token. Falls back to SUPABASE_SERVICE_ROLE_KEY when absent. */
  token?: string;
}

/** Returns "sent", or "failed (<status>)" / "failed" — never throws. */
export async function sendDigestEmail({ subject, html, to, token }: SendDigestInput): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bearer = token?.trim() || serviceKey;
  if (!url || !bearer) return "failed";

  try {
    const res = await fetch(`${url}/functions/v1/send-ai-report`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearer}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subject, html, to }),
    });
    return res.ok ? "sent" : `failed (${res.status})`;
  } catch {
    return "failed";
  }
}
