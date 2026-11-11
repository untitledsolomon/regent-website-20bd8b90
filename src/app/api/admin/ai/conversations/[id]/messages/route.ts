import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getOwnedConversation(supabase: ReturnType<typeof createServiceClient>, id: string, uid: string) {
  const { data, error } = await (supabase as any)
    .from("ai_conversations")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  if (!data || data.user_id !== uid) return null;
  return data;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "AI unavailable: Supabase credentials not configured" }, { status: 503 });
  }
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const { id } = await ctx.params;

  const supabase = createServiceClient();
  const conv = await getOwnedConversation(supabase, id, guard.uid);
  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const { data, error } = await (supabase as any)
    .from("ai_messages")
    .select("id, role, content, tool_calls, tool_name, tool_events, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Error reading messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ messages: data ?? [] });
}
