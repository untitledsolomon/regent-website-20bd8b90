import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { markdownToHtml } from "@/lib/ai/insights";
import { sendDigestEmail } from "@/lib/ai/digest-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Send a digest (edited preview or generated one) to the chosen recipients. */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const body = (await req.json().catch(() => ({}))) as {
    kind?: unknown;
    subject?: unknown;
    markdown?: unknown;
    to?: unknown[];
  };
  const kind = body?.kind === "weekly" ? "weekly" : "daily";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const markdown = typeof body?.markdown === "string" ? body.markdown.trim() : "";
  const recipients = Array.isArray(body?.to)
    ? [...new Set(body.to.map((r: unknown) => String(r).trim().toLowerCase()).filter(Boolean))]
    : [];

  if (!subject || !markdown) {
    return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
  }
  const bad = recipients.filter((r) => !EMAIL_RE.test(r));
  if (!recipients.length || bad.length) {
    return NextResponse.json({ error: bad.length ? `Invalid recipient: ${bad[0]}` : "At least one recipient is required" }, { status: 400 });
  }

  const html = markdownToHtml(markdown);
  // Send with the admin's own session token (not the service-role key), so the
  // edge function validates a real access token; falls back to the service key
  // for keyless callers like the cron route.
  const { data: { session } } = await (await createClient()).auth.getSession();
  const email = await sendDigestEmail({ subject, html, to: recipients, token: session?.access_token });

  const supabase = createServiceClient();
  if (email === "sent") {
    const col = kind === "weekly" ? "weekly_last_sent_at" : "daily_last_sent_at";
    await (supabase as any)
      .from("email_settings")
      .update({ [col]: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", 1);
  }

  // The weekly report also becomes the dashboard card so it stays reviewable
  // in the Insights hub; dismissed rows are never recreated.
  let insightRow: any = null;
  if (kind === "weekly") {
    try {
      const today = new Date().toISOString().slice(0, 10);
      await (supabase as any).from("ai_insights").delete().eq("category", "weekly_report").is("dismissed_at", null);
      const { data: row } = await (supabase as any)
        .from("ai_insights")
        .insert({
          category: "weekly_report",
          severity: "medium",
          title: `Weekly report — ${today}`,
          body: markdown,
          target_type: null,
          target_id: null,
          target_slug: null,
          target_url: null,
          action: null,
          actionable: false,
          generated_by: "digest",
          dedupe_key: null,
        })
        .select()
        .single();
      insightRow = row ?? null;
    } catch {
      // Non-fatal: the email is the point, the dashboard card is a convenience.
    }
  }

  return NextResponse.json({ ok: email === "sent", email, insight: insightRow });
}
