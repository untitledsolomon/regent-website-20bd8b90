import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { callModel, recordAiUsage } from "@/lib/ai/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EditorSchema = z.object({
  meta_description: z.string(),
  excerpt: z.string(),
  social_copy: z.string(),
});

/** Editorial helpers: meta description, excerpt and social copy for content. */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const uid = guard.uid;

  const body = await req.json().catch(() => ({}));
  const title: string = body?.title ?? "";
  const contentBody: string = body?.body ?? "";
  if (!title.trim() || !contentBody.trim()) {
    return NextResponse.json({ error: "title and body are required" }, { status: 400 });
  }

  const system =
    "You are the copy editor for Regent Technologies, a business software company. From an article title and body produce a JSON object with exactly: meta_description (150-160 characters, SEO, with a call to action), excerpt (one short paragraph suitable for blog cards, 2-3 sentences), social_copy (a 200-280 character post for X/LinkedIn, with the title and a hook). Respond with ONLY the JSON object — no markdown, no prose around it.";
  const user = `Title: ${title}\n\nBody:\n${contentBody.slice(0, 6000)}`;
  const result = await callModel({ system, messages: [{ role: "user", content: user }], temperature: 0.4 });
  await recordAiUsage({
    uid,
    feature: "editorial_helpers",
    usage: result.usage,
    latency_ms: result.latency_ms,
    success: true,
  });

  let parsed: z.SafeParseReturnType<unknown, { meta_description: string; excerpt: string; social_copy: string }>;
  try {
    let cleaned = result.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) cleaned = cleaned.slice(start, end + 1);
    parsed = EditorSchema.safeParse(JSON.parse(cleaned));
  } catch {
    return NextResponse.json({ error: "Could not parse the model's suggestion" }, { status: 502 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: "Could not parse the model's suggestion" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ...parsed.data });
}
