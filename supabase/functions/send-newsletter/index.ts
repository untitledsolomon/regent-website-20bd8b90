import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth using service role client to validate the JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html, template_html } = await req.json();
    if (!subject || (!html && !template_html)) {
      return new Response(JSON.stringify({ error: "Subject and html body required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all subscribers
    const { data: subscribers, error: subErr } = await admin.from("newsletter_subscribers").select("email");
    if (subErr) throw subErr;

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ error: "No subscribers found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emails = subscribers.map((s: { email: string }) => s.email);

    let sent = 0;
    let failed = 0;
    const batchSize = 10;

    // Per-recipient unsubscribe link (same URL shape the legacy wrapper used).
    const unsubscribeFor = (recipient: string) =>
      `<a href="https://regentplatform.com/unsubscribe?email=${encodeURIComponent(recipient)}" style="color:#657081;text-decoration:underline;">Unsubscribe</a>`;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (recipient: string) => {
          let finalHtml: string;
          if (template_html) {
            // Admin-picked template shell (from the Emails > Templates page):
            // the edge fills the per-recipient unsubscribe token, the app has
            // already substituted logo/content/preheader/subject/year.
            finalHtml = template_html.replace(/\{\{unsubscribe\}\}/g, unsubscribeFor(recipient));
          } else {
            // Legacy path: wrap the body in today's hard-coded layout.
            finalHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px;">
  <div style="font-size:20px;font-weight:600;letter-spacing:-0.03em;color:#0a0f1a;margin-bottom:32px;">
    Regent<span style="color:#4f8cff">.</span>
  </div>
  ${html}
  <div style="border-top:1px solid #e2e8f0;margin-top:40px;padding-top:20px;">
    <p style="font-size:12px;color:#a0aec0;margin:0;">
      © ${new Date().getFullYear()} Regent Systems, Inc. You received this because you subscribed at regentplatform.com.
    </p>
    <p style="font-size:12px;color:#a0aec0;margin:8px 0 0;">
      ${unsubscribeFor(recipient)}
    </p>
  </div>
</div>
</body></html>`;
          }
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Regent Systems <updates@regentplatform.com>",
              to: [recipient],
              subject,
              html: finalHtml,
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            console.error("Resend error for", recipient, err);
            throw new Error("Send failed");
          }
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled") sent++;
        else failed++;
      }
    }

    // Record the campaign in the send log so the Emails page history and the
    // failure indicators have real data. Non-fatal if the write fails.
    try {
      await admin.from("newsletter_sends").insert({
        subject,
        html_preview: html,
        sent_count: sent,
        failed_count: failed,
      });
    } catch (e) {
      console.error("Failed to record newsletter_sends row", e);
    }

    return new Response(JSON.stringify({ sent, failed, total: emails.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});