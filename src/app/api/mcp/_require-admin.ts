import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

/**
 * Server-side admin guard for MCP admin API routes.
 * Uses createServiceClient() the same way src/app/api/admin/users/route.ts does.
 */
export async function requireAdmin(request: Request) {
  const supabase = createServiceClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError || !roleRow) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { ok: true, uid: user.id, supabase };
}
