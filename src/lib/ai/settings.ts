"use server";

// WS5: AI provider settings + cost model. The single-row ai_settings table is
// the source of truth for provider configuration; the API key lives in Vault
// (settings only keep its last-4). Cost is computed at write time from the
// price snapshot columns — cached tokens are billed at the cached rate.

import { createServiceClient } from "@/lib/supabase/service";
import { getVaultApiKey } from "./vault";
import { computeCost } from "./cost";
export type { TokenUsage, CostBreakdown, CostPrices } from "./cost";
export { computeCost };

export interface AiSettings {
  provider: string;
  base_url: string;
  model: string;
  temperature: number;
  max_tokens: number;
  enabled: boolean;
  price_input_per_mtok: number;
  price_output_per_mtok: number;
  price_input_cached_per_mtok: number;
  currency: string;
  api_key_last4: string | null;
  vault_key_name: string | null;
  updated_at: string;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function loadAiSettings(): Promise<AiSettings | null> {
  const supabase = createServiceClient();
  const { data, error } = await (supabase as any)
    .from("ai_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    provider: data.provider,
    base_url: data.base_url,
    model: data.model,
    temperature: num(data.temperature),
    max_tokens: data.max_tokens,
    enabled: !!data.enabled,
    price_input_per_mtok: num(data.price_input_per_mtok),
    price_output_per_mtok: num(data.price_output_per_mtok),
    price_input_cached_per_mtok: num(data.price_input_cached_per_mtok),
    currency: data.currency,
    api_key_last4: data.api_key_last4,
    vault_key_name: data.vault_key_name,
    updated_at: data.updated_at,
  };
}

/** Resolve the live provider key: Vault secret named by vault_key_name, else the DEEPSEEK_API_KEY env var. */
export async function resolveApiKey(settings: AiSettings): Promise<string | null> {
  if (settings.vault_key_name) {
    const key = await getVaultApiKey(settings.vault_key_name);
    if (key) return key;
  }
  return process.env.DEEPSEEK_API_KEY ?? null;
}
