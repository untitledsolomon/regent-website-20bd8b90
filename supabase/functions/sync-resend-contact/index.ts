import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESEND_AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID")!;

/**
 * Sync a newsletter subscriber to the Regent Growth Engine as a cold lead.
 * Non-blocking — failures are logged but do not fail the subscribe flow.
 *
 * Required env vars (set in Supabase Edge Function Secrets):
 *   GROWTH_ENGINE_URL           – e.g. https://<ref>.supabase.co/functions/v1
 *   GROWTH_ENGINE_AGENT_API_KEY  – agent API key set in Growth Engine Supabase secrets
 *   GROWTH_ENGINE_ORG_ID         – UUID of the Regent org in the Growth Engine
 */
async function syncNewsletterLeadToGrowthEngine(email: string): Promise<void> {
  const url = Deno.env.get("GROWTH_ENGINE_URL");
  const apiKey = Deno.env.get("GROWTH_ENGINE_AGENT_API_KEY");
  const orgId = Deno.env.get("GROWTH_ENGINE_ORG_ID");

  if (!url || !apiKey || !orgId) {
    console.warn("Growth Engine env vars not configured — skipping newsletter lead sync");
    return;
  }

  const body = {
    org_id: orgId,
    name: email.split("@")[0], // best-effort name from email prefix until enriched
    email,
    source: "website",
    score: 40,
    tags: ["newsletter", "cold"],
    status: "new",
  };

  const res = await fetch(`${url}/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-agent-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Growth Engine newsletter lead sync failed:", res.status, errText);
  } else {
    const data = await res.json();
    console.log("Growth Engine newsletter lead synced:", data?.id);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sync to Resend audience (primary action)
    const res = await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Resend contact sync error:", err);
      return new Response(JSON.stringify({ error: "Failed to sync contact" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sync to Growth Engine — fire-and-forget, non-blocking
    syncNewsletterLeadToGrowthEngine(email).catch(
      (e) => console.error("Growth Engine newsletter sync error (uncaught):", e),
    );

    return new Response(JSON.stringify({ success: true }), {
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
