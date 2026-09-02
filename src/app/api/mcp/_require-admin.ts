import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

/**
 * Server-side admin guard for MCP admin API routes.
 * Uses the cookie-aware createClient() to read the request session from cookies,
 * then verifies the user has the 'admin' role. Returns NextResponse on failure.
 */
export async function requireAdmin() {
  // cookie-aware supabase client (reads session from next/headers)
  const supabase = await createClient();

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

  return { ok: true, uid: user.id };
}
