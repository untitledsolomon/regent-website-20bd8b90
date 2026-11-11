// WS6: shared thin wrapper over the configured OpenAI-compatible chat endpoint,
// used by the generative admin features (AI insights, weekly report, triage,
// editorial helpers). Mirrors the fetch pattern in /api/admin/ai/test so every
// generative path hits the same settings, key resolution and cost model.

import { createServiceClient } from "@/lib/supabase/service";
import { loadAiSettings, resolveApiKey, computeCost } from "./settings";

export interface ModelUsage {
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  total_tokens: number;
}

export interface ModelResult {
  text: string;
  model: string;
  usage: ModelUsage;
  latency_ms: number;
}

export interface CallModelOpts {
  system?: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  temperature?: number;
  maxTokens?: number;
}

/** Single non-streaming model call. Throws with the provider error message. */
export async function callModel(opts: CallModelOpts): Promise<ModelResult> {
  const settings = await loadAiSettings();
  if (!settings) throw new Error("AI settings not initialized");
  const apiKey = await resolveApiKey(settings);
  if (!apiKey) throw new Error("No API key configured — set it in AI settings");

  const started = Date.now();
  const res = await fetch(`${settings.base_url.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        ...(opts.system ? [{ role: "system" as const, content: opts.system }] : []),
        ...opts.messages,
      ],
      max_tokens: opts.maxTokens ?? settings.max_tokens,
      temperature: opts.temperature ?? settings.temperature,
      stream: false,
    }),
    signal: AbortSignal.timeout(90_000),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.error?.message || body?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  const usage = body?.usage ?? {};
  return {
    text: body?.choices?.[0]?.message?.content?.trim() ?? "",
    model: body?.model ?? settings.model,
    usage: {
      prompt_tokens: usage.prompt_tokens ?? 0,
      completion_tokens: usage.completion_tokens ?? 0,
      cached_tokens: usage.prompt_cache_hit_tokens ?? usage.prompt_tokens_details?.cached_tokens ?? 0,
      total_tokens: usage.total_tokens ?? 0,
    },
    latency_ms: Date.now() - started,
  };
}

/** Append a row to the ai_usage ledger for a generative feature call. */
export async function recordAiUsage(opts: {
  uid: string;
  feature: string;
  usage: ModelUsage;
  latency_ms: number;
  success: boolean;
  error?: string;
}): Promise<void> {
  const settings = await loadAiSettings();
  if (!settings) return;
  const cost = computeCost(opts.usage, settings);
  const supabase = createServiceClient();
  await supabase.from("ai_usage").insert({
    user_id: opts.uid,
    feature: opts.feature,
    provider: settings.provider,
    model: settings.model,
    prompt_tokens: opts.usage.prompt_tokens,
    completion_tokens: opts.usage.completion_tokens,
    cached_tokens: opts.usage.cached_tokens,
    total_tokens: opts.usage.total_tokens,
    cost: cost.cost_total,
    price_input_per_mtok: settings.price_input_per_mtok,
    price_output_per_mtok: settings.price_output_per_mtok,
    price_input_cached_per_mtok: settings.price_input_cached_per_mtok,
    currency: settings.currency,
    latency_ms: opts.latency_ms,
    success: opts.success,
    error: opts.error ?? null,
  });
}
