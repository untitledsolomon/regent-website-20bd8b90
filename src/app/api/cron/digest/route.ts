import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateDigest, type DigestKind } from "@/lib/ai/digest";
import { sendDigestEmail } from "@/lib/ai/digest-send";
import { applyTemplateToHtml } from "@/lib/ai/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hourly cron (see next.config crons). Each run figures out which digests are
// due — enabled setting, hour matches the current UTC hour and (weekly) today
// is Monday — generates the content and emails it. Safe to fire more often
// than the schedule: a kind only sends once per matching hour.
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const hour = now.getUTCHours();
  const monday = now.getUTCDay() === 1;

  try {
    const supabase = createServiceClient();
    const { data: settings, error } = await (supabase as any)
      .from("email_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error || !settings) {
      return NextResponse.json({ error: "No email settings" }, { status: 400 });
    }
    const { data: templates } = await (supabase as any).from("email_templates").select("*");
    const templateRows = templates ?? [];

    const due: Array<{ kind: DigestKind; to: string[] }> = [];
    if (settings.weekly_enabled && monday && settings.weekly_hour === hour && (settings.weekly_recipients ?? []).length) {
      due.push({ kind: "weekly", to: settings.weekly_recipients });
    }
    if (settings.daily_enabled && settings.daily_hour === hour && (settings.daily_recipients ?? []).length) {
      due.push({ kind: "daily", to: settings.daily_recipients });
    }

    const results: Partial<Record<DigestKind, string>> = {};
    // Cron runs have no admin session; record usage under a stable feature uid.
    const featureUid = "00000000-0000-0000-0000-000000000000";
    for (const { kind, to } of due) {
      try {
        const preview = await generateDigest(kind, featureUid);
        const html = applyTemplateToHtml(kind, preview.html, settings, templateRows, { subject: preview.subject });
        const outcome = await sendDigestEmail({ subject: preview.subject, html, to });
        results[kind] = outcome;
        if (outcome === "sent") {
          const col = kind === "weekly" ? "weekly_last_sent_at" : "daily_last_sent_at";
          await (supabase as any)
            .from("email_settings")
            .update({ [col]: now.toISOString(), updated_at: now.toISOString() })
            .eq("id", 1);
        }
      } catch (e) {
        results[kind] = `error: ${e instanceof Error ? e.message : "unknown"}`;
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Cron failed" }, { status: 500 });
  }
}
