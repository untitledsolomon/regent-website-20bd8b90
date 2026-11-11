import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Highest privilege wins when a user holds several roles (app_role: admin > moderator > user)
const ROLE_PRIORITY: Record<string, number> = { admin: 3, moderator: 2, user: 1 };

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Users unavailable: Supabase credentials not configured" },
      { status: 503 }
    );
  }

  // Requester must be a logged-in admin (cookie session + role check)
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const supabase = createServiceClient();

  try {
    // Roles come from user_roles (single source of truth), never app_metadata
    const { data: roleRows, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");
    if (rolesError) {
      console.error("Error listing roles:", rolesError);
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }

    const roleByUser = new Map<string, string>();
    for (const row of roleRows ?? []) {
      const prev = roleByUser.get(row.user_id);
      if (!prev || (ROLE_PRIORITY[row.role] ?? 0) > (ROLE_PRIORITY[prev] ?? 0)) {
        roleByUser.set(row.user_id, row.role);
      }
    }

    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error("Error listing users:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Only users holding a role in user_roles are surfaced as system users
    const users = data.users
      .filter(u => roleByUser.has(u.id))
      .map(u => ({
        id: u.id,
        email: u.email,
        last_login: u.last_sign_in_at,
        role: roleByUser.get(u.id)!,
        created_at: u.created_at,
        metadata: u.user_metadata,
      }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Unexpected error listing users:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
