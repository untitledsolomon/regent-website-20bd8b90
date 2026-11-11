import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { upsertVaultSecret } from "@/lib/ai/vault";
import { loadAiSettings, invalidateAiSettingsCache } from "@/lib/ai/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  provider: z.string().min(1).max(40).optional(),
  base_url: z.string().url().max(200).optional(),
  model: z.string().min(1).max(80).optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(1).max(100_000).optional(),
  enabled: z.boolean().optional(),
  price_input_per_mtok: z.number().min(0).max(1000).optional(),
  price_output_per_mtok: z.number().min(0).max(1000).optional(),
  price_input_cached_per_mtok: z.number().min(0).max(1000).optional(),
  currency: z.string().length(3).optional(),
  api_key: z.string().min(1).max(500).optional(),
});

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "AI settings unavailable: Supabase credentials not configured" }, { status: 503 });
  }
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const settings = await loadAiSettings();
  if (!settings) return NextResponse.json({ error: "AI settings not initialized" }, { status: 404 });

  // Never send the key or vault name back; mask as last-4.
  return NextResponse.json({
    provider: settings.provider,
    base_url: settings.base_url,
    model: settings.model,
    temperature: settings.temperature,
    max_tokens: settings.max_tokens,
    enabled: settings.enabled,
    price_input_per_mtok: settings.price_input_per_mtok,
    price_output_per_mtok: settings.price_output_per_mtok,
    price_input_cached_per_mtok: settings.price_input_cached_per_mtok,
    currency: settings.currency,
    api_key_last4: settings.api_key_last4,
    has_key: !!(settings.vault_key_name || process.env.DEEPSEEK_API_KEY),
  });
}

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "AI settings unavailable: Supabase credentials not configured" }, { status: 503 });
  }
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;
  const supabase = createServiceClient();

  const patch: Record<string, unknown> = { ...input };
  delete patch.api_key;

  const current = await loadAiSettings();
  if (!current) return NextResponse.json({ error: "AI settings not initialized" }, { status: 404 });

  // Rotate key into Vault under a fresh name; keep last-4 in settings.
  if (input.api_key) {
    const name = `ai_api_key_${crypto.randomUUID().slice(0, 8)}`;
    const rotated = await upsertVaultSecret(name, input.api_key);
    if (!rotated) {
      return NextResponse.json({ error: "Vault unavailable — cannot store API key. Enable the Vault extension or set DEEPSEEK_API_KEY." }, { status: 503 });
    }
    patch.vault_key_name = name;
    patch.api_key_last4 = input.api_key.slice(-4);
    // Rotating the key makes any older vault secret stale.
    if (current.vault_key_name && current.vault_key_name !== name) {
      try {
        await supabase.from("vault.deleted_secrets").delete().eq("name", current.vault_key_name);
      } catch {
        // Old secret removal is best-effort; the new key is authoritative.
      }
    }
  }

  const { error } = await supabase
    .from("ai_settings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) {
    console.error("Error updating ai_settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // The update is committed — make the next reader see it immediately.
  invalidateAiSettingsCache();

  const fresh = await loadAiSettings();
  return NextResponse.json({
    provider: fresh?.provider,
    base_url: fresh?.base_url,
    model: fresh?.model,
    temperature: fresh?.temperature,
    max_tokens: fresh?.max_tokens,
    enabled: fresh?.enabled,
    api_key_last4: fresh?.api_key_last4,
    has_key: !!(fresh?.vault_key_name || process.env.DEEPSEEK_API_KEY),
  });
}
