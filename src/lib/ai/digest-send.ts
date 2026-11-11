// WS6: deliver a rendered digest email through the send-ai-report edge function.
// RESEND_API_KEY lives only in the edge function secrets (Next runtime may not
// hold it), so every digest send funnels through there. The edge function
// accepts either an authenticated admin's access token or the service-role key
// (cron has no user session), so we always just pass the service-role key.

export interface SendDigestInput {
  subject: string;
  html: string;
  to: string[];
}

/** Returns "sent", or "failed (<status>)" / "failed" — never throws. */
export async function sendDigestEmail({ subject, html, to }: SendDigestInput): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return "failed";

  try {
    const res = await fetch(`${url}/functions/v1/send-ai-report`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subject, html, to }),
    });
    return res.ok ? "sent" : `failed (${res.status})`;
  } catch {
    return "failed";
  }
}
