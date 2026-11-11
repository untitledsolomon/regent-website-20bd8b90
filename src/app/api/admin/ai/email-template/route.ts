import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { callModel, recordAiUsage } from "@/lib/ai/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HTML = 40_000;

/**
 * Strip a code fence (some models wrap the HTML in ```html ... ```) and pull
 * the single outer <html> document, forgiving leading prose.
 */
function extractHtml(text: string): string {
  let clean = text.trim().replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/, "").trim();
  const start = clean.toLowerCase().indexOf("<!doctype html>");
  const tagStart = clean.toLowerCase().indexOf("<html");
  const pick = start >= 0 ? start : tagStart >= 0 ? tagStart : 0;
  clean = clean.slice(pick);
  return clean;
}

/**
 * AI template builder (Emails > Templates > Build template). Deliberately
 * SEPARATE from /api/admin/ai/email: this writes the SHELL (the table-based
 * layout with placeholders), never newsletter copy. The content writer stays
 * untouched so the two modes cannot be confused.
 */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const uid = guard.uid;

  const body = await req.json().catch(() => ({}));
  const brief = typeof body?.brief === "string" ? body.brief.trim() : "";
  const kind = typeof body?.kind === "string" && ["weekly", "daily", "newsletter"].includes(body.kind) ? body.kind : "any";
  const tone = typeof body?.tone === "string" && body.tone.trim() ? body.tone.trim() : "professional";
  if (!brief) {
    return NextResponse.json({ error: "A short design brief is required" }, { status: 400 });
  }

  const system =
    "You are an email designer for Regent Technologies, a business software company. " +
    "Produce ONLY a complete, email-safe HTML email template — the SHELL (layout), not content. " +
    "The template is the container: table-based layout, inline styles only (email clients strip <style>), " +
    "brand palette navy #1A3A5B with a white rounded card (#FFFFFF, border-radius 20px), " +
    "a message-panel header (#EEF2F6) holding the logo and a headline, a body area, and a light footer. " +
    "Include these EXACT placeholder tokens, unchanged, in the template: " +
    "{{preheader}} (in a hidden div), {{logo}} (in the header), {{subject}} (as the headline), " +
    "{{content}} (in the body area, where the article body renders), {{year}} and {{unsubscribe}} (in the footer). " +
    "Do NOT write article or newsletter copy. Do NOT replace any placeholder with text — the caller fills them. " +
    "Do NOT wrap in markdown code fences unless your output is otherwise valid HTML. " +
    "Respond with ONLY the HTML document starting with <!DOCTYPE html>."

  const user = `Design brief: ${brief}\nPurpose: ${kind === "newsletter" ? "a product newsletter" : kind === "weekly" ? "a weekly AI report digest" : "a daily AI report digest"}\nTone: ${tone}`;

  let result;
  try {
    result = await callModel({ system, messages: [{ role: "user", content: user }], temperature: 0.7, maxTokens: 3000 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Model call failed" }, { status: 502 });
  }
  await recordAiUsage({ uid, feature: "email_template_builder", usage: result.usage, latency_ms: result.latency_ms, success: true });

  const html = extractHtml(result.text);
  if (!html || !html.includes("{{content}}")) {
    return NextResponse.json(
      { error: "The model returned invalid HTML without the required {{content}} placeholder — try again" },
      { status: 502 },
    );
  }
  if (html.length > MAX_HTML) {
    return NextResponse.json({ error: "The generated template is too large" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, html });
}
