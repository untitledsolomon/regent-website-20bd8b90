import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "AI unavailable: Supabase credentials not configured" }, { status: 503 });
  }
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const { id } = await ctx.params;

  const supabase = createServiceClient();
  const { data: conv, error: findErr } = await (supabase as any)
    .from("ai_conversations").select("user_id").eq("id", id).maybeSingle();
  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
  if (!conv || conv.user_id !== guard.uid) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { error } = await (supabase as any).from("ai_conversations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
