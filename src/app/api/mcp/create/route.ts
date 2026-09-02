import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "../_require-admin";

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const supabase = createServiceClient();

  const body = await request.json();
  const name = body.name;
  const scopes = body.scopes || ["content:read"];
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const rawKey = `regent_mcp_sk_${crypto.randomBytes(48).toString("hex")}`;
  const hash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const { data, error } = await supabase.from("mcp_agents").insert({
    name,
    api_key_hash: hash,
    scopes,
    created_at: new Date().toISOString(),
    revoked: false,
  }).select().maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return raw key ONCE
  return NextResponse.json({ id: data.id, raw_key: rawKey });
}
