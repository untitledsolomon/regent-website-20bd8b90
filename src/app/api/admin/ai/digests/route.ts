import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOUR_OK = (h: unknown): h is number =>
  typeof h === "number" && Number.isInteger(h) && h >= 0 && h <= 23;

/** Read the single email_settings row, or seed it if missing. */
async function getSettings() {
  const supabase = createServiceClient();
  const { data, error } = await (supabase as any).from("email_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: createError } = await (supabase as any)
    .from("email_settings")
    .insert({ id: 1 })
    .select()
    .single();
  if (createError) throw createError;
  return created;
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load settings" }, { status: 500 });
  }
}

/** Save any of the digest switches / recipients / send-hour fields. */
export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};

  for (const kind of ["weekly", "daily"] as const) {
    const enabled = body[`${kind}_enabled`];
    if (typeof enabled === "boolean") patch[`${kind}_enabled`] = enabled;

    const hour = body[`${kind}_hour`];
    if (hour !== undefined) {
      if (!HOUR_OK(hour)) return NextResponse.json({ error: `${kind} hour must be an integer 0-23` }, { status: 400 });
      patch[`${kind}_hour`] = hour;
    }

    const recipients = body[`${kind}_recipients`];
    if (recipients !== undefined) {
      if (!Array.isArray(recipients)) return NextResponse.json({ error: `${kind} recipients must be a list` }, { status: 400 });
      const cleaned = [...new Set(recipients.map((r) => String(r).trim().toLowerCase()).filter(Boolean))];
      const bad = cleaned.filter((r) => !EMAIL_RE.test(r));
      if (bad.length) return NextResponse.json({ error: `Invalid ${kind} recipient: ${bad[0]}` }, { status: 400 });
      patch[`${kind}_recipients`] = cleaned;
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid settings provided" }, { status: 400 });
  }
  patch.updated_at = new Date().toISOString();

  try {
    const supabase = createServiceClient();
    const { data, error } = await (supabase as any)
      .from("email_settings")
      .update(patch)
      .eq("id", 1)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to save settings" }, { status: 500 });
  }
}
