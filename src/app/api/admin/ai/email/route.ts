import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { callModel, recordAiUsage } from "@/lib/ai/model";
import { markdownToHtml } from "@/lib/ai/insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EmailSchema = z.object({
  subject: z.string().min(1),
  markdown: z.string().min(1),
});

/** Crude HTML → text for the "improve" mode so we can paraphrase existing bodies. */
const stripHtml = (s: string) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function parseEmail(text: string): { subject: string; markdown: string } | null {
  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) cleaned = cleaned.slice(start, end + 1);
  const parsed = EmailSchema.safeParse(JSON.parse(cleaned));
  return parsed.success ? parsed.data : null;
}

/**
 * AI email helper for the newsletter composer.
 *   draft:   brief (topic, audience, goal, tone) → fresh subject + body
 *   improve: current subject + body → tightened rewrite
 * Returns { subject, html } — markdown from the model is converted server-side so
 * the RichTextEditor always receives clean, email-safe HTML.
 */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const uid = guard.uid;

  const body = await req.json().catch(() => ({}));
  const mode = body?.mode === "improve" ? "improve" : "draft";
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  const audience = typeof body?.audience === "string" ? body.audience.trim() : "";
  const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
  const tone = typeof body?.tone === "string" ? body.tone.trim() : "professional";
  const currentSubject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const currentBody = typeof body?.body === "string" ? stripHtml(body.body) : "";

  if (mode === "improve" && !currentBody) {
    return NextResponse.json({ error: "Write a body to improve first" }, { status: 400 });
  }

  const system =
    mode === "draft"
      ? "You are the email copywriter for Regent Systems, a business software company. Write a concise email newsletter. Respond with ONLY a JSON object: {\"subject\": \"under 60 characters, specific and not clickbaity\", \"markdown\": \"the email body — 4-8 short paragraphs, a few short bullets where useful; plain markdown, no level-1 headings\"}. No prose around the JSON."
      : "You are the email copywriter for Regent Systems, a business software company. Tighten and sharpen the supplied email: shorter sentences, a clearer opening hook, one clear next step — while keeping its core message. Respond with ONLY a JSON object: {\"subject\": \"under 60 characters\", \"markdown\": \"the improved body in plain markdown\"}. No prose around the JSON.";

  const user =
    mode === "draft"
      ? `Topic: ${topic || "an update from Regent"}\nAudience: ${audience || "our subscribers"}\nGoal: ${goal || "inform and invite a reply"}\nTone: ${tone}`
      : `Current subject: ${currentSubject}\n\nCurrent body:\n${currentBody.slice(0, 6000)}\n\nTone: ${tone}`;

  let result;
  try {
    result = await callModel({ system, messages: [{ role: "user", content: user }], temperature: 0.5, maxTokens: 1200 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Model call failed" }, { status: 502 });
  }
  await recordAiUsage({ uid, feature: "email_writer", usage: result.usage, latency_ms: result.latency_ms, success: true });

  let parsed;
  try {
    parsed = parseEmail(result.text);
  } catch {
    parsed = null;
  }
  if (!parsed) {
    return NextResponse.json({ error: "Could not parse the model's draft" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, subject: parsed.subject, html: markdownToHtml(parsed.markdown) });
}
