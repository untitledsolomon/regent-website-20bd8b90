import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { loadAiSettings, resolveApiKey, computeCost } from "@/lib/ai/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "AI test unavailable: Supabase credentials not configured" }, { status: 503 });
  }
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const uid = guard.uid;

  const settings = await loadAiSettings();
  if (!settings) return NextResponse.json({ error: "AI settings not initialized" }, { status: 404 });
  const apiKey = await resolveApiKey(settings);
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured — set it in AI settings" }, { status: 404 });
  }

  const started = Date.now();
  const supabase = createServiceClient();
  const record = async (success: boolean, usage: { prompt_tokens: number; completion_tokens: number; cached_tokens: number; total_tokens: number }, error?: string) => {
    const cost = computeCost(usage, settings);
    await supabase.from("ai_usage").insert({
      user_id: uid,
      feature: "test_connection",
      provider: settings.provider,
      model: settings.model,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      cached_tokens: usage.cached_tokens,
      total_tokens: usage.total_tokens,
      cost: cost.cost_total,
      price_input_per_mtok: settings.price_input_per_mtok,
      price_output_per_mtok: settings.price_output_per_mtok,
      price_input_cached_per_mtok: settings.price_input_cached_per_mtok,
      currency: settings.currency,
      latency_ms: Date.now() - started,
      success,
      error: error ?? null,
    });
  };

  try {
    const res = await fetch(`${settings.base_url.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: settings.model,
        messages: [{ role: "user", content: "Ping — reply with the single word: OK." }],
        max_tokens: 8,
        temperature: 0,
        stream: false,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || body?.message || `HTTP ${res.status}`;
      await record(false, { prompt_tokens: 0, completion_tokens: 0, cached_tokens: 0, total_tokens: 0 }, message);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const usage = body?.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    await record(true, {
      prompt_tokens: usage.prompt_tokens ?? 0,
      completion_tokens: usage.completion_tokens ?? 0,
      cached_tokens: usage.prompt_cache_hit_tokens ?? usage.prompt_tokens_details?.cached_tokens ?? 0,
      total_tokens: usage.total_tokens ?? 0,
    });

    const reply = body?.choices?.[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ ok: true, reply, model: settings.model, base_url: settings.base_url, latency_ms: Date.now() - started });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    await record(false, { prompt_tokens: 0, completion_tokens: 0, cached_tokens: 0, total_tokens: 0 }, message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
