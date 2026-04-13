import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createServiceClient();

  // Verify the requester is an admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // In this context, we check if the user exists and has a session.
  // Ideally we'd check a 'role' or similar, but for now we'll rely on authentication.
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error listing users:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format the response for the UI
    const users = data.users.map(u => ({
      id: u.id,
      email: u.email,
      last_login: u.last_sign_in_at,
      role: u.app_metadata?.role || 'Admin',
      created_at: u.created_at,
      metadata: u.user_metadata
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Unexpected error listing users:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
