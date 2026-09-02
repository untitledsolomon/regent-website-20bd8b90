import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "../_require-admin";

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const supabase = createServiceClient();

  const body = await request.json();
  const id = body.id;
  const scopes = body.scopes;
  if (!id || !Array.isArray(scopes)) return NextResponse.json({ error: "id and scopes required" }, { status: 400 });
  const { error } = await supabase.from("mcp_agents").update({ scopes }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
