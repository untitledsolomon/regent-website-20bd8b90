"use client";

// WS5: AI provider configuration + usage view for the admin settings page.
// Reads/writes /api/admin/ai/settings, tests the connection, and shows the
// token/cost ledger from /api/admin/ai/usage. The API key never leaves the
// route boundary (settings only exposes last-4 / has_key).

import { useEffect, useState } from "react";
import { Sparkles, Loader2, TestTube2, KeyRound, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AiSettings {
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
  has_key: boolean;
}

interface UsageResponse {
  totals: { tokens: number; cost: number; calls: number; failed: number };
  currency: string;
  byFeature: Array<{ feature: string; tokens: number; cost: number; calls: number }>;
  byModel: Array<{ model: string; tokens: number; cost: number; calls: number }>;
}

const inputCls =
  "w-full h-10 px-4 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{children}</label>;
}

export default function AISettingsSection() {
  const { toast } = useToast();
  const [s, setS] = useState<AiSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const load = async () => {
    try {
      const [settingsRes, usageRes] = await Promise.all([
        fetch("/api/admin/ai/settings"),
        fetch("/api/admin/ai/usage"),
      ]);
      if (settingsRes.ok) setS(await settingsRes.json());
      if (usageRes.ok) setUsage(await usageRes.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (patch: Partial<AiSettings>) => setS((prev) => (prev ? { ...prev, ...patch } : prev));

  const save = async () => {
    if (!s) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        provider: s.provider,
        base_url: s.base_url,
        model: s.model,
        temperature: s.temperature,
        max_tokens: s.max_tokens,
        enabled: s.enabled,
        price_input_per_mtok: s.price_input_per_mtok,
        price_output_per_mtok: s.price_output_per_mtok,
        price_input_cached_per_mtok: s.price_input_cached_per_mtok,
      };
      if (apiKey.trim()) body.api_key = apiKey.trim();
      const res = await fetch("/api/admin/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setApiKey("");
      setS((prev) => (prev ? { ...prev, ...data } : prev));
      toast({ title: "AI settings saved", description: "New provider/model config takes effect immediately." });
    } catch (e) {
      toast({ title: "Save failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/ai/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Test failed");
      setTestResult(`Connected to ${data.model} in ${data.latency_ms}ms — "${data.reply}"`);
      toast({ title: "Connection works", description: data.reply });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setTestResult(`Failed: ${msg}`);
      toast({ title: "Connection failed", description: msg, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
        <Loader2 size={16} className="animate-spin" /> Loading AI settings…
      </div>
    );
  }
  if (!s) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        AI settings are not configured. Run the migrations and the seed row.
      </div>
    );
  }

  const fmtCost = (v: number) => `$${Number(v).toFixed(4)}`;

  return (
    <div className="space-y-5">
      {/* Provider + model */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Provider</Label>
          <input className={`${inputCls} mt-1.5`} value={s.provider} onChange={(e) => set({ provider: e.target.value })} />
        </div>
        <div>
          <Label>Model</Label>
          <input className={`${inputCls} mt-1.5`} value={s.model} onChange={(e) => set({ model: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Base URL</Label>
        <input className={`${inputCls} mt-1.5`} value={s.base_url} onChange={(e) => set({ base_url: e.target.value })} />
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Temperature</Label>
          <input
            type="number" step="0.05" min="0" max="2"
            className={`${inputCls} mt-1.5`}
            value={s.temperature}
            onChange={(e) => set({ temperature: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Max tokens</Label>
          <input
            type="number" step="1" min="1" max="100000"
            className={`${inputCls} mt-1.5`}
            value={s.max_tokens}
            onChange={(e) => set({ max_tokens: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Enabled</Label>
          <button
            role="switch"
            aria-checked={s.enabled}
            onClick={() => set({ enabled: !s.enabled })}
            className={`relative w-11 h-6 rounded-full transition-colors mt-4 ${s.enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${s.enabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Input $/MTok</Label>
          <input type="number" step="0.001" min="0" className={`${inputCls} mt-1.5`} value={s.price_input_per_mtok} onChange={(e) => set({ price_input_per_mtok: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Cached input $/MTok</Label>
          <input type="number" step="0.001" min="0" className={`${inputCls} mt-1.5`} value={s.price_input_cached_per_mtok} onChange={(e) => set({ price_input_cached_per_mtok: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Output $/MTok</Label>
          <input type="number" step="0.001" min="0" className={`${inputCls} mt-1.5`} value={s.price_output_per_mtok} onChange={(e) => set({ price_output_per_mtok: Number(e.target.value) })} />
        </div>
      </div>

      {/* Key */}
      <div>
        <Label>API Key</Label>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 flex items-center gap-2 px-4 h-10 bg-background border border-input rounded-xl text-sm">
            <KeyRound size={14} className="text-muted-foreground shrink-0" />
            {s.has_key ? (
              <span className="text-muted-foreground font-mono">{s.api_key_last4 ? `•••• •••• ${s.api_key_last4}` : "key configured (env var)"}</span>
            ) : (
              <span className="text-muted-foreground">none</span>
            )}
          </div>
          <input
            type="password"
            placeholder="New key (replaces stored)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className={`${inputCls} flex-1`}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="h-10 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm shadow-primary/20 inline-flex items-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Save settings
        </button>
        <button
          onClick={test}
          disabled={testing || !s.has_key}
          className="h-10 px-4 text-sm font-medium border border-input rounded-xl hover:bg-muted/50 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {testing ? <Loader2 size={14} className="animate-spin" /> : <TestTube2 size={14} />} Test connection
        </button>
      </div>
      {testResult && <p className="text-xs text-muted-foreground">{testResult}</p>}

      {/* Usage */}
      <div className="pt-2 border-t">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <Sparkles size={14} className="text-primary" /> Usage (all-time)
        </div>
        {usage ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 bg-muted/50 rounded-xl">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Calls</div>
              <div className="text-xl font-semibold">{usage.totals.calls}</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Tokens</div>
              <div className="text-xl font-semibold">{usage.totals.tokens.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Cost</div>
              <div className="text-xl font-semibold">{usage.currency === "USD" ? "$" : ""}{fmtCost(usage.totals.cost)}</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Failed</div>
              <div className="text-xl font-semibold">{usage.totals.failed}</div>
            </div>
            <div className="col-span-2 sm:col-span-4 space-y-1">
              {usage.byFeature.map((f) => (
                <div key={f.feature} className="flex justify-between text-xs text-muted-foreground">
                  <span>{f.feature}</span>
                  <span>{f.calls} calls · {f.tokens.toLocaleString()} tokens</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No usage recorded yet.</p>
        )}
      </div>
    </div>
  );
}
