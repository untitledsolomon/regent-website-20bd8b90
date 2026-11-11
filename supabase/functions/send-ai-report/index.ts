// Weekly AI report / digest email delivery for the admin.
// Receives a pre-rendered HTML body from the Next.js generator/send routes and
// sends it via Resend to the supplied recipients (or the admin notification
// address). Mirrors send-newsletter: JWT-auth, cors headers, non-fatal on error.
// Auth accepts EITHER an authenticated admin's access token (browser-triggered
// sends) OR the service-role key itself (the cron route has no user session).
//
// Required env vars (set in Supabase Edge Function Secrets):
//   RESEND_API_KEY
//   NOTIFICATION_EMAIL     (optional; used only when `to` is not supplied)

import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Decode JWT claims for the failure log only (no signature verification).
    const claims = (t: string): Record<string, unknown> | null => {
      try {
        return JSON.parse(atob(t.split(".")[1]));
      } catch {
        return null;
      }
    };

    let authorized = false;
    if (svcKey && token === svcKey) {
      authorized = true; // cron (or a peer) using the project's service-role key
    } else {
      // A genuine access token (an admin session) validates against GoTrue
      // with a client that only needs the anon/publishable key — the injected
      // service-role key is not required, since some setups unset or override it.
      const clientKey = Deno.env.get("SUPABASE_ANON_KEY") ?? svcKey;
      if (clientKey) {
        const client = createClient(SUPABASE_URL, clientKey);
        const { data: { user }, error } = await client.auth.getUser(token);
        authorized = !error && !!user;
      }
    }

    if (!authorized) {
      const c = claims(token);
      console.error("send-ai-report unauthorized", {
        svcEnvSet: !!svcKey,
        tokenRole: c?.role ?? null,
        tokenRef: c?.ref ?? null,
      });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html, to } = await req.json();
    if (!subject || !html) {
      return new Response(JSON.stringify({ error: "Subject and html body required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!RESEND_API_KEY) {
      console.error("send-ai-report missing RESEND_API_KEY secret");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipients: string[] = Array.isArray(to)
      ? to.filter((r: unknown) => typeof r === "string" && r.trim())
      : typeof to === "string" && to.trim()
        ? [to]
        : [];
    const mailTo = recipients.length
      ? recipients
      : NOTIFICATION_EMAIL
        ? [NOTIFICATION_EMAIL]
        : [];
    if (!mailTo.length) {
      return new Response(JSON.stringify({ error: "No recipients and NOTIFICATION_EMAIL not set" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Regent <updates@regent.systems>",
        to: mailTo,
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: "Failed to send report" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
