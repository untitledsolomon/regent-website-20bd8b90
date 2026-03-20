"use client";

import { createClient } from "@/lib/supabase/client";

export async function logActivity(
  action: string,
  entityType: string,
  entityTitle: string,
  entityId?: string
) {
  const supabase = createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_activity_log" as any).insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      entity_title: entityTitle,
    });
  } catch {
    // Silent — activity logging should never block operations
  }
}
