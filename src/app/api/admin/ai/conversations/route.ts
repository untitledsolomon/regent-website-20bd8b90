import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  feature: z.enum(["analytics_assistant", "general_chat"]).default("analytics_assistant"),
  first_message: z.string().min(1).max(8000).optional(),
});

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "AI unavailable: Supabase credentials not configured" }, { status: 503 });
  }
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const supabase = createServiceClient();
  const { data, error } = await (supabase as any)
    .from("ai_conversations")
    .select("id, title, feature, created_at, updated_at")
    .eq("user_id", guard.uid)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("Error listing conversations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ conversations: data ?? [] });
}

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "AI unavailable: Supabase credentials not configured" }, { status: 503 });
  }
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const { title, feature } = parsed.data;

  const supabase = createServiceClient();
  const { data, error } = await (supabase as any)
    .from("ai_conversations")
    .insert({
      user_id: guard.uid,
      title: title ?? "New conversation",
      feature,
    })
    .select("id, title, feature, created_at, updated_at")
    .single();
  if (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ conversation: data }, { status: 201 });
}
