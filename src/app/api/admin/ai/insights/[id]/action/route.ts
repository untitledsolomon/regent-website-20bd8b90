import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ACTIONS = new Set(["create_post_draft", "open_editor", "view_analytics"]);

const slugify = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

/**
 * Take action on an insight:
 *   create_post_draft -> seeds a draft blog post from the insight and returns
 *                        its id so the UI can open the editor straight away.
 *   open_editor       -> returns the admin editor url stamped on the row.
 *   view_analytics    -> returns the analytics route.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const action = typeof body?.action === "string" ? body.action : "";
  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: insight, error: insErr } = await (supabase as any)
    .from("ai_insights")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (insErr || !insight) return NextResponse.json({ error: "Insight not found" }, { status: 404 });

  if (action === "create_post_draft") {
    const title = (insight.title ?? "Untitled").slice(0, 160);
    const body = (insight.body ?? "").slice(0, 20000);
    const { data: row, error } = await (supabase as any)
      .from("blog_posts")
      .insert({
        title,
        slug: `${slugify(title) || "post"}-${Date.now().toString(36)}`,
        excerpt: body.slice(0, 280),
        content: body,
        published: false,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action, id: row.id });
  }

  if (action === "open_editor" && insight.target_url) {
    return NextResponse.json({ ok: true, action, url: insight.target_url });
  }
  if (action === "view_analytics" || insight.category === "anomaly") {
    return NextResponse.json({ ok: true, action, url: "/admin/analytics" });
  }
  if (insight.category === "consultation") {
    return NextResponse.json({ ok: true, action, url: "/admin/inquiries" });
  }
  return NextResponse.json({ ok: true, action, url: "/admin/insights" });
}
