const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Sync a consultation lead to the Regent Growth Engine.
 * Non-blocking — failures are logged but do not fail the consultation submission.
 *
 * Required env vars (set in Supabase Edge Function Secrets):
 *   GROWTH_ENGINE_URL          – e.g. https://<ref>.supabase.co/functions/v1
 *   GROWTH_ENGINE_AGENT_API_KEY – agent API key set in Growth Engine Supabase secrets
 *   GROWTH_ENGINE_ORG_ID        – UUID of the Regent org in the Growth Engine
 */
async function syncLeadToGrowthEngine(payload: {
  name: string;
  company: string;
  email: string;
  industry?: string;
  budget?: string;
  source?: string;
}): Promise<void> {
  const url = Deno.env.get('GROWTH_ENGINE_URL');
  const apiKey = Deno.env.get('GROWTH_ENGINE_AGENT_API_KEY');
  const orgId = Deno.env.get('GROWTH_ENGINE_ORG_ID');

  if (!url || !apiKey || !orgId) {
    console.warn('Growth Engine env vars not configured — skipping lead sync');
    return;
  }

  // Demo requests get highest priority score (90), regular consultations get 80.
  const score = payload.source === 'demo-request' ? 90 : 80;
  const tags = ['inbound', 'consultation'];
  if (payload.industry) tags.push(payload.industry.toLowerCase().replace(/\s+/g, '-'));

  const body = {
    org_id: orgId,
    name: payload.name,
    business: payload.company,
    email: payload.email,
    source: 'website',
    score,
    tags,
    status: 'new',
  };

  const res = await fetch(`${url}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-agent-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Growth Engine lead sync failed:', res.status, errText);
  } else {
    const data = await res.json();
    console.log('Growth Engine lead synced:', data?.id);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const NOTIFICATION_EMAIL = Deno.env.get('NOTIFICATION_EMAIL');

    if (!RESEND_API_KEY || !NOTIFICATION_EMAIL) {
      console.error('Missing RESEND_API_KEY or NOTIFICATION_EMAIL secret');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { name, company, email, industry, size, budget, message, source } = await req.json();

    const htmlBody = `
      <h2>New Consultation Request</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Company</td><td style="padding:8px;border-bottom:1px solid #eee;">${company}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Industry</td><td style="padding:8px;border-bottom:1px solid #eee;">${industry || 'Not specified'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Size</td><td style="padding:8px;border-bottom:1px solid #eee;">${size || 'Not specified'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Budget</td><td style="padding:8px;border-bottom:1px solid #eee;">${budget || 'Not specified'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${message || 'None'}</td></tr>
      </table>
    `;

    // Send email notification (primary action — must succeed)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Regent <updates@regent.systems>',
        to: [NOTIFICATION_EMAIL],
        subject: `New Consultation: ${name} from ${company}`,
        html: htmlBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend error:', data);
      return new Response(JSON.stringify({ error: 'Failed to send notification' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sync to Growth Engine — fire-and-forget, non-blocking
    syncLeadToGrowthEngine({ name, company, email, industry, budget, source }).catch(
      (e) => console.error('Growth Engine sync error (uncaught):', e),
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
