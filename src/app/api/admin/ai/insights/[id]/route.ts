import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Update an insight: dismiss it (marks dismissed_at so it leaves the lists) or
// save an internal note. Regenerating a category keeps dismissed rows (and
// never recreates a day-deduped anomaly), so a dismissed finding stays gone.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const patch: Record<string, unknown> = {};
  if (body.dismiss === true) patch.dismissed_at = new Date().toISOString();
  if (typeof body.note === "string") patch.note = body.note;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update — send dismiss or note" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await (supabase as any)
    .from("ai_insights")
    .update(patch)
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
