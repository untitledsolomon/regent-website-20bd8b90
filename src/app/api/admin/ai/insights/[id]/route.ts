import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Dismiss an insight: marks dismissed_at so it leaves the dashboard list.
// Regenerating a category keeps dismissed rows (and never recreates a
// day-deduped anomaly), so a dismissed finding stays gone.
export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  const supabase = createServiceClient();
  const { error } = await (supabase as any)
    .from("ai_insights")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
