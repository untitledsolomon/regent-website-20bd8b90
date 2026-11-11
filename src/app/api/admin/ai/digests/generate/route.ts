import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { generateDigest, type DigestKind } from "@/lib/ai/digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Generate (not send) a digest preview so the admin can edit it before sending. */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const kind: DigestKind = body?.kind === "daily" ? "daily" : "weekly";

  try {
    const preview = await generateDigest(kind, guard.uid);
    return NextResponse.json({ ok: true, ...preview });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Generation failed" }, { status: 502 });
  }
}
