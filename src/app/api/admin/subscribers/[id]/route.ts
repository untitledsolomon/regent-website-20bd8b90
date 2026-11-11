import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeTags = (t: unknown) =>
  Array.isArray(t) ? [...new Set(t.map((x) => String(x).trim().toLowerCase()).filter(Boolean))] : undefined;

/** Update one subscriber: email / source / tags / note. Email changes go
 *  through the same rules as the site: normalized to lower(trim()), and the
 *  unique lower(trim(email)) index (migration 20261112000005) blocks duplicates
 *  — a 23505 surfaces as a friendly 409. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const patch: Record<string, unknown> = {};
  if (body.email !== undefined) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    patch.email = email;
  }
  if (body.source !== undefined) patch.source = typeof body.source === "string" && body.source.trim() ? body.source.trim() : null;
  if (body.note !== undefined) patch.note = typeof body.note === "string" ? body.note.trim() || null : null;
  const tags = normalizeTags(body.tags);
  if (tags !== undefined) patch.tags = tags;
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  patch.updated_at = new Date().toISOString();

  try {
    const supabase = createServiceClient();
    const { data, error } = await (supabase as any)
      .from("newsletter_subscribers")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (String(error.message).includes("23505") || /duplicate/i.test(error.message)) {
        return NextResponse.json({ error: "A subscriber with this email already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ subscriber: data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  const supabase = createServiceClient();
  const { error } = await (supabase as any).from("newsletter_subscribers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
