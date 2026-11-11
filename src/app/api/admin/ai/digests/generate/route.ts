import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { generateDigest, type DigestKind } from "@/lib/ai/digest";
import { createServiceClient } from "@/lib/supabase/service";
import { applyTemplateToHtml, loadTemplateContext } from "@/lib/ai/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Generate (not send) a digest preview so the admin can edit it before sending. */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const kind: DigestKind = body?.kind === "daily" ? "daily" : "weekly";

  try {
    const preview = await generateDigest(kind, guard.uid);
    // Return the markdown body wrapped in the selected template, so the preview
    // matches the email a recipient would receive.
    const ctx = await loadTemplateContext(createServiceClient());
    const html = applyTemplateToHtml(kind, preview.html, ctx.settings, ctx.templates, { subject: preview.subject });
    return NextResponse.json({ ok: true, ...preview, html });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Generation failed" }, { status: 502 });
  }
}
