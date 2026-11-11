import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalizeTag = (t: unknown) => String(t ?? "").trim().toLowerCase();

/** Bulk subscriber ops: delete, add_tag, remove_tag across the given ids. */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const body = (await req.json().catch(() => ({}))) as {
    action?: unknown;
    ids?: unknown[];
    tag?: unknown;
  };
  const action = typeof body?.action === "string" ? body.action : "";
  const ids: string[] = Array.isArray(body?.ids)
    ? [...new Set(body.ids.map((x: unknown) => String(x)))]
    : [];
  if (!["delete", "add_tag", "remove_tag"].includes(action)) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  if (!ids.length) return NextResponse.json({ error: "No subscribers selected" }, { status: 400 });

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  try {
    if (action === "delete") {
      const { error } = await (supabase as any).from("newsletter_subscribers").delete().in("id", ids);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, count: ids.length });
    }

    if (action === "add_tag" || action === "remove_tag") {
      const tag = normalizeTag(body?.tag);
      if (!tag || tag.includes(",")) return NextResponse.json({ error: "A single tag name is required" }, { status: 400 });

      const { data: rows, error: readErr } = await (supabase as any)
        .from("newsletter_subscribers")
        .select("id, tags")
        .in("id", ids);
      if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });

      // Group the rows by their post-state so the writes stay batched.
      const grouped = new Map<string, string[]>();
      for (const row of rows ?? []) {
        const tags = Array.isArray(row.tags) ? row.tags : [];
        const next =
          action === "add_tag"
            ? [...new Set([...tags, tag])]
            : tags.filter((t: string) => t !== tag);
        const key = next.join("\u0001");
        grouped.set(key, [...(grouped.get(key) ?? []), row.id]);
      }
      for (const [key, list] of grouped) {
        const { error } = await (supabase as any)
          .from("newsletter_subscribers")
          .update({ tags: key ? key.split("\u0001") : [], updated_at: now })
          .in("id", list);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, count: rows?.length ?? 0, tag });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Bulk op failed" }, { status: 500 });
  }
}
