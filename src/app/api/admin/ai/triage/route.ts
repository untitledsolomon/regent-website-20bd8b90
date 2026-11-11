import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { callModel, recordAiUsage } from "@/lib/ai/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TriageSchema = z.object({
  summary: z.string(),
  category: z.string(),
  suggested_reply: z.string(),
});

/** Consultation lead triage: summarize, categorize, suggest a reply. */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const uid = guard.uid;

  const body = await req.json().catch(() => ({}));
  const consultationId = body?.consultation_id;
  if (!consultationId) {
    return NextResponse.json({ error: "consultation_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: row, error: findErr } = await (supabase as any)
    .from("consultation_requests")
    .select("*")
    .eq("id", consultationId)
    .maybeSingle();
  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Consultation not found" }, { status: 404 });

  const system =
    "You are the intake assistant for Regent Technologies. Analyze a consultation lead and return a JSON object with exactly: summary (2-3 sentences, plain language), category (one short tag: e.g. 'demo', 'pricing', 'partnership', 'integration', 'general'), suggested_reply (a 3-5 sentence draft email reply to the lead, professional and specific to their message). Respond with ONLY the JSON object — no markdown, no prose around it.";
  const user =
    `Analyze this consultation request:\n\n` +
    `- name: ${row.name ?? ""}\n- company: ${row.company ?? ""}\n- email: ${row.email ?? ""}\n` +
    `- industry: ${row.industry ?? ""}\n- size: ${row.size ?? ""}\n- budget: ${row.budget ?? ""}\n` +
    `- message: ${row.message ?? ""}\n- requested: ${row.created_at ?? ""}\n`;
  const result = await callModel({ system, messages: [{ role: "user", content: user }], temperature: 0.3 });
  await recordAiUsage({
    uid,
    feature: "consultation_triage",
    usage: result.usage,
    latency_ms: result.latency_ms,
    success: true,
  });

  let parsed: z.SafeParseReturnType<unknown, { summary: string; category: string; suggested_reply: string }>;
  try {
    let cleaned = result.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) cleaned = cleaned.slice(start, end + 1);
    parsed = TriageSchema.safeParse(JSON.parse(cleaned));
  } catch {
    return NextResponse.json({ error: "Could not parse the model's suggestion" }, { status: 502 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: "Could not parse the model's suggestion" }, { status: 502 });
  }

  const { error: updateErr } = await (supabase as any)
    .from("consultation_requests")
    .update({
      ai_summary: parsed.data.summary,
      ai_category: parsed.data.category,
      suggested_reply: parsed.data.suggested_reply,
      processed_at: new Date().toISOString(),
    })
    .eq("id", consultationId);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, ...parsed.data });
}
