import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { callModel, recordAiUsage } from "@/lib/ai/model";
import {
  gatherInsightFacts,
  buildInsightPrompt,
  buildWeeklyReportPrompt,
  parseInsightResponse,
  detectAnomalies,
  markdownToHtml,
  type InsightRow,
} from "@/lib/ai/insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rows older than this are shown with a "stale" hint; the refresh button
// regenerates. Regenerated model rows replace the previous non-dismissed ones.
const STALE_AFTER_MS = 12 * 60 * 60_000;
const REGENERATED_CATEGORIES = ["content", "consultation", "anomaly"] as const;

export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const supabase = createServiceClient();
  const { data, error } = await (supabase as any)
    .from("ai_insights")
    .select("*")
    .is("dismissed_at", null)
    .order("generated_at", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data || [];
  const newest = rows.reduce((m: number, r: any) => Math.max(m, new Date(r.generated_at).getTime()), 0);
  const stale = rows.length === 0 || Date.now() - newest > STALE_AFTER_MS;
  return NextResponse.json({ insights: rows, stale });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const uid = guard.uid;

  // The generator supports two modes: "content" (dashboard insights, the
  // default) and "weekly_report" (email + dashboard card row).
  const body = await req.json().catch(() => ({}));
  if (body?.mode === "weekly_report") {
    return handleWeeklyReport(uid);
  }

  const supabase = createServiceClient();
  let model_error: string | null = null;
  const modelRows: InsightRow[] = [];

  try {
    const facts = await gatherInsightFacts();
    const { system, user } = buildInsightPrompt(facts);
    const result = await callModel({ system, messages: [{ role: "user", content: user }], temperature: 0.3 });
    modelRows.push(...parseInsightResponse(result.text));
    await recordAiUsage({
      uid,
      feature: "insights_generator",
      usage: result.usage,
      latency_ms: result.latency_ms,
      success: true,
    });
  } catch (err) {
    model_error = err instanceof Error ? err.message : "Model call failed";
  }

  // Rule-based anomaly alerts never depend on the model; they are deduped so
  // each metric fires at most once per day and re-running cannot recreate a
  // dismissed alert.
  let anomalyRows: InsightRow[] = [];
  try {
    const facts = await gatherInsightFacts();
    anomalyRows = detectAnomalies(facts);
    if (anomalyRows.length) {
      const dedupeKeys = anomalyRows.map((r) => r.dedupe_key).filter(Boolean) as string[];
      const { data: existing } = await (supabase as any)
        .from("ai_insights")
        .select("dedupe_key")
        .in("dedupe_key", dedupeKeys);
      const seen = new Set((existing || []).map((r: any) => r.dedupe_key));
      anomalyRows = anomalyRows.filter((r) => !r.dedupe_key || !seen.has(r.dedupe_key));
    }
  } catch {
    anomalyRows = [];
  }

  // Replace the previous non-dismissed rows of the categories we regenerate;
  // dismissed rows are kept and never recreated (see the anomaly dedupe above).
  if (modelRows.length || anomalyRows.length) {
    for (const category of REGENERATED_CATEGORIES) {
      await (supabase as any).from("ai_insights").delete().eq("category", category).is("dismissed_at", null);
    }
    const inserts = [...modelRows, ...anomalyRows];
    const { data: inserted, error: insertError } = await (supabase as any)
      .from("ai_insights")
      .insert(inserts)
      .select();
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    return NextResponse.json({ ok: true, insights: inserted, model_error: model_error });
  }

  if (model_error) return NextResponse.json({ error: model_error }, { status: 502 });
  return NextResponse.json({ ok: true, insights: [] });
}

/** Generate the weekly AI report: store a dashboard row and email it. */
async function handleWeeklyReport(uid: string): Promise<NextResponse> {
  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const facts = await gatherInsightFacts();
  const { system, user } = buildWeeklyReportPrompt(facts);
  const result = await callModel({ system, messages: [{ role: "user", content: user }], temperature: 0.4, maxTokens: 1500 });
  await recordAiUsage({
    uid,
    feature: "weekly_report",
    usage: result.usage,
    latency_ms: result.latency_ms,
    success: true,
  });

  // Replace the previous week's report; dismissed rows are kept.
  await (supabase as any).from("ai_insights").delete().eq("category", "weekly_report").is("dismissed_at", null);
  const { data: row, error: insertErr } = await (supabase as any)
    .from("ai_insights")
    .insert({
      category: "weekly_report",
      severity: "medium",
      title: `Weekly report — ${today}`,
      body: result.text,
      target_type: null,
      target_slug: null,
      target_url: null,
      actionable: false,
      generated_by: "model",
      dedupe_key: null,
    })
    .select()
    .single();
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  // Email is best-effort: the Next runtime may not hold RESEND_API_KEY (it
  // lives in the edge function secrets), so route delivery through the
  // send-ai-report edge function and log any failure without failing the row.
  let email: string;
  try {
    const supabaseSession = await createClient();
    const { data: sessionData } = await supabaseSession.auth.getSession();
    const token = sessionData.session?.access_token ?? "";
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-ai-report`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: `Regent weekly AI report — ${today}`,
        html: markdownToHtml(result.text),
      }),
    });
    email = res.ok ? "sent" : `failed (${res.status})`;
  } catch {
    email = "failed";
  }

  return NextResponse.json({ ok: true, insight: row, email });
}
