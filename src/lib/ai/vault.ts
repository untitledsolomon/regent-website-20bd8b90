"use server";

// WS5: minimal access layer for Supabase Vault secrets. The vault extension may
// not be provisioned in every environment, so all reads/writes are defensive:
// try the "vault"/"supabase_vault" schemas first, degrade gracefully, and
// return null/false instead of throwing when the extension is absent.

import { createServiceClient } from "@/lib/supabase/service";

/** Raw fetch of a single secret by name, or null if the vault is unavailable. */
export async function getVaultApiKey(name: string): Promise<string | null> {
  try {
    const supabase = createServiceClient() as any;
    for (const schema of ["vault", "supabase_vault"]) {
      const { data, error } = await supabase
        .from(`${schema}.decrypted_secrets`)
        .select("name, decrypted_secret")
        .eq("name", name)
        .maybeSingle();
      if (!error && data?.decrypted_secret) return data.decrypted_secret;
    }
  } catch {
    /* vault unavailable */
  }
  return null;
}

/** Insert or update a secret in Vault. Returns false when the vault is unavailable. */
export async function upsertVaultSecret(name: string, secret: string): Promise<boolean> {
  try {
    const supabase = createServiceClient() as any;
    const exists = await getVaultApiKey(name);
    if (exists !== null) {
      const { error } = await supabase
        .from("vault.updated_secrets")
        .update({ decrypted_secret: secret, secret: secret })
        .eq("name", name);
      return !error;
    }
    const { error } = await supabase.rpc("vault_create_secret", { secret_name: name, secret_value: secret });
    return !error;
  } catch {
    return false;
  }
}

/** Delete a secret from Vault by name. */
export async function deleteVaultSecret(name: string): Promise<boolean> {
  try {
    const supabase = createServiceClient() as any;
    const { error } = await supabase.rpc("vault_delete_secret", { secret_name: name });
    return !error;
  } catch {
    return false;
  }
}
