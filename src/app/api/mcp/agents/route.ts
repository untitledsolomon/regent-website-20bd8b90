import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "../_require-admin";

export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard instanceof NextResponse) return guard;
  const supabase = createServiceClient();

  const { data, error } = await supabase.from("mcp_agents").select("id, name, scopes, created_at, last_used_at, revoked, revoked_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
