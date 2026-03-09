import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Regent Systems <updates@regent.systems>",
        to: [email],
        subject: "Welcome to Regent Insights",
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px;">
  <div style="font-size:20px;font-weight:600;letter-spacing:-0.03em;color:#0a0f1a;margin-bottom:32px;">
    Regent<span style="color:#4f8cff">.</span>
  </div>
  <h1 style="font-size:24px;font-weight:600;color:#0a0f1a;margin:0 0 16px;letter-spacing:-0.02em;">
    Welcome aboard
  </h1>
  <p style="font-size:15px;line-height:1.7;color:#4a5568;margin:0 0 24px;">
    Thanks for subscribing to Regent Insights. You'll receive our latest thinking on systems infrastructure, enterprise technology, and operational intelligence — delivered straight to your inbox.
  </p>
  <p style="font-size:15px;line-height:1.7;color:#4a5568;margin:0 0 32px;">
    In the meantime, explore our latest content:
  </p>
  <a href="https://regent.systems/blog" style="display:inline-block;background:#4f8cff;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">
    Read the Blog →
  </a>
  <div style="border-top:1px solid #e2e8f0;margin-top:40px;padding-top:20px;">
    <p style="font-size:12px;color:#a0aec0;margin:0;">
      © ${new Date().getFullYear()} Regent Systems, Inc. You're receiving this because you subscribed at regent.systems.
    </p>
    <p style="font-size:12px;color:#a0aec0;margin:8px 0 0;">
      <a href="https://regent.systems/unsubscribe?email=${encodeURIComponent(email)}" style="color:#a0aec0;text-decoration:underline;">Unsubscribe</a>
    </p>
  </div>
</div>
</body></html>`,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: "Failed to send welcome email" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
