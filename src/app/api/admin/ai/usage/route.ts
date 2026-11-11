import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "AI usage unavailable: Supabase credentials not configured" }, { status: 503 });
  }
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const supabase = createServiceClient();
  const { data, error } = await (supabase as any)
    .from("ai_usage")
    .select("id, feature, model, prompt_tokens, completion_tokens, cached_tokens, total_tokens, cost, currency, success, error, latency_ms, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) {
    console.error("Error reading ai_usage:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byDay = new Map<string, { tokens: number; cost: number; calls: number; success: number }>();
  const byFeature = new Map<string, { tokens: number; cost: number; calls: number }>();
  const byModel = new Map<string, { tokens: number; cost: number; calls: number }>();
  let totalTokens = 0;
  let totalCost = 0;
  let totalCalls = 0;
  let failedCalls = 0;

  for (const row of data ?? []) {
    const day = (row.created_at ?? "").slice(0, 10) || "unknown";
    const centsCost = Number(row.cost) || 0;
    const tokens = Number(row.total_tokens) || 0;
    totalTokens += tokens;
    totalCost += centsCost;
    totalCalls += 1;
    if (!row.success) failedCalls += 1;

    const d = byDay.get(day) ?? { tokens: 0, cost: 0, calls: 0, success: 0 };
    d.tokens += tokens; d.cost += centsCost; d.calls += 1; if (row.success) d.success += 1;
    byDay.set(day, d);

    for (const key of [["feature", row.feature, byFeature], ["model", row.model, byModel]] as const) {
      const m = key[2].get(key[1] ?? "unknown") ?? { tokens: 0, cost: 0, calls: 0 };
      m.tokens += tokens; m.cost += centsCost; m.calls += 1;
      key[2].set(key[1] ?? "unknown", m);
    }
  }

  const daySeries = Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, v]) => ({ day, tokens: v.tokens, cost: +v.cost.toFixed(6), calls: v.calls, success: v.success }));
  const byFeatureOut = Array.from(byFeature.entries()).map(([feature, v]) => ({ feature, tokens: v.tokens, cost: +v.cost.toFixed(6), calls: v.calls }));
  const byModelOut = Array.from(byModel.entries()).map(([model, v]) => ({ model, tokens: v.tokens, cost: +v.cost.toFixed(6), calls: v.calls }));

  return NextResponse.json({
    totals: { tokens: totalTokens, cost: +totalCost.toFixed(6), calls: totalCalls, failed: failedCalls },
    currency: data?.[0]?.currency ?? "USD",
    byDay: daySeries,
    byFeature: byFeatureOut,
    byModel: byModelOut,
    recent: (data ?? []).slice(0, 50),
  });
}
