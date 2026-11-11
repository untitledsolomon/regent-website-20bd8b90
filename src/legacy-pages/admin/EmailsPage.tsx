"use client";

// Emails section: the newsletter send log (every campaign that went out, with
// its template preview) plus reusable templates. Links into the Composer so a
// template can be loaded and sent. Reads live from Supabase via React Query.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Send, Mail, Users, AlertTriangle, ChevronDown, ChevronUp, Plus, Trash2, FileText, Clock,
  CalendarClock, Sparkles, Loader2, Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SendRow {
  id: string;
  subject: string;
  html_preview: string | null;
  sent_count: number;
  failed_count: number;
  sent_at: string;
}

interface TemplateRow {
  id: string;
  name: string;
  subject: string;
  html: string;
  updated_at: string;
}

export default function EmailsPage() {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const sendsQuery = useQuery({
    queryKey: ["admin", "newsletter-sends"],
    staleTime: 60_000,
    queryFn: async (): Promise<SendRow[]> => {
      const { data, error } = await (supabase as any)
        .from("newsletter_sends")
        .select("*")
        .order("sent_at", { ascending: false });
      if (error) throw error;
      return (data || []) as SendRow[];
    },
  });

  const templatesQuery = useQuery({
    queryKey: ["admin", "newsletter-templates"],
    staleTime: 60_000,
    queryFn: async (): Promise<TemplateRow[]> => {
      const { data, error } = await (supabase as any)
        .from("newsletter_templates")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as TemplateRow[];
    },
  });

  const sends = sendsQuery.data ?? [];
  const templates = templatesQuery.data ?? [];
  const totalBounced = sends.reduce((s, r) => s + (r.failed_count || 0), 0);
  const totalRecipients = sends.reduce((s, r) => s + (r.sent_count || 0), 0);

  const loadTemplate = (t: TemplateRow) => {
    localStorage.setItem("regent-template-draft", JSON.stringify({ subject: t.subject, html: t.html }));
    router.push("/admin/newsletter/compose");
    toast({ title: "Template loaded", description: "Draft ready in the Composer." });
  };

  const deleteTemplate = async (t: TemplateRow) => {
    if (!confirm(`Delete template "${t.name}"?`)) return;
    const { error } = await (supabase as any).from("newsletter_templates").delete().eq("id", t.id);
    if (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin", "newsletter-templates"] });
      toast({ title: "Template deleted" });
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">Emails</h1>
              <p className="text-muted-foreground text-sm">Campaign history, deliverability and reusable templates.</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push("/admin/newsletter/compose")}
          className="inline-flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {(sendsQuery.isError || templatesQuery.isError) && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-4">
          Failed to load email data: {sendsQuery.error instanceof Error ? sendsQuery.error.message : templatesQuery.error instanceof Error ? templatesQuery.error.message : "unknown error"}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Send size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-3xl font-heading font-semibold text-foreground tracking-tight">{sends.length}</div>
            <div className="text-sm text-muted-foreground font-medium">Campaigns sent</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Users size={20} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-3xl font-heading font-semibold text-foreground tracking-tight">{totalRecipients.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground font-medium">Recipients reached</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-rose-600" />
          </div>
          <div>
            <div className="text-3xl font-heading font-semibold text-foreground tracking-tight">{totalBounced.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground font-medium">Failed deliveries</div>
          </div>
        </div>
      </div>

      {/* AI scheduled reports */}
      <DigestControlPanel />

      {/* Send log */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-foreground">Campaign history</h2>
          <Clock size={16} className="text-muted-foreground" />
        </div>
        {sends.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Mail size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No campaigns sent yet. Compose the first one when you are ready.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sends.map((s) => {
              const isOpen = expanded === s.id;
              return (
                <div key={s.id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail size={16} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground truncate">{s.subject}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(s.sent_at), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {s.failed_count > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 inline-flex items-center gap-1">
                          <AlertTriangle size={11} /> {s.failed_count} failed
                        </span>
                      )}
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">
                        {s.sent_count.toLocaleString()} sent
                      </span>
                      {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Template preview</div>
                      {s.html_preview ? (
                        <iframe
                          title={`Preview of ${s.subject}`}
                          srcDoc={s.html_preview}
                          sandbox=""
                          className="w-full h-96 bg-white rounded-xl border border-border"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">No preview stored for this campaign.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Templates */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-foreground">Templates</h2>
          <button
            onClick={() => router.push("/admin/newsletter/compose")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <FileText size={13} /> Manage in Composer
          </button>
        </div>
        {templates.length === 0 ? (
          <div className="py-14 text-center text-muted-foreground">
            <FileText size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No saved templates. In the Composer you can save a draft as a template to reuse it.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-foreground truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {t.subject || "No subject"} · updated {format(new Date(t.updated_at), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => loadTemplate(t)}
                    className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-bold rounded-xl border border-border text-foreground hover:border-primary/40 hover:text-primary transition-all"
                  >
                    <Send size={13} /> Load &amp; edit
                  </button>
                  <button
                    onClick={() => deleteTemplate(t)}
                    className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    aria-label="Delete template"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Scheduled reports — control center for the weekly + daily digests.
// Reads/writes the email_settings row via /api/admin/ai/digests, generates
// editable previews via .../generate and delivers via .../send.
// ---------------------------------------------------------------------------

interface DigestSettings {
  weekly_enabled: boolean;
  weekly_recipients: string[];
  weekly_hour: number;
  daily_enabled: boolean;
  daily_recipients: string[];
  daily_hour: number;
  weekly_last_sent_at: string | null;
  daily_last_sent_at: string | null;
  weekly_template_id: string | null;
  daily_template_id: string | null;
}

interface EmailTemplateRow {
  id: string;
  name: string;
  html: string;
}

type DigestKind = "weekly" | "daily";

const KIND_META: Record<DigestKind, { label: string; blurb: string }> = {
  weekly: { label: "Weekly", blurb: "Monday morning — full founder report" },
  daily: { label: "Daily", blurb: "Every morning — numbers-first summary" },
};

const splitCsv = (csv: string) =>
  [...new Set(csv.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))];

function DigestControlPanel() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [kind, setKind] = useState<DigestKind>("weekly");
  const [csv, setCsv] = useState("");
  const [hour, setHour] = useState(9);
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState<{ subject: string; markdown: string; html: string } | null>(null);
  const [busy, setBusy] = useState<"saving" | "generating" | "sending" | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["admin", "digest-settings"],
    staleTime: 30_000,
    queryFn: async (): Promise<DigestSettings> => {
      const res = await fetch("/api/admin/ai/digests");
      if (!res.ok) throw new Error("Failed to load digest settings");
      return (await res.json()).settings;
    },
  });

  // Shells usable by the current kind (kind = any or this exact use).
  const templatesQuery = useQuery({
    queryKey: ["admin", "email-templates", kind],
    staleTime: 30_000,
    queryFn: async (): Promise<EmailTemplateRow[]> => {
      const { data, error } = await (supabase as any)
        .from("email_templates")
        .select("id, name, html")
        .in("kind", ["any", kind])
        .order("name");
      if (error) throw error;
      return (data || []) as EmailTemplateRow[];
    },
  });

  const settings = settingsQuery.data;
  const kindSettings = settings
    ? {
        enabled: kind === "weekly" ? settings.weekly_enabled : settings.daily_enabled,
        recipients: kind === "weekly" ? settings.weekly_recipients : settings.daily_recipients,
        sentAt: kind === "weekly" ? settings.weekly_last_sent_at : settings.daily_last_sent_at,
        defaultHour: kind === "weekly" ? settings.weekly_hour : settings.daily_hour,
        templateId: kind === "weekly" ? settings.weekly_template_id : settings.daily_template_id,
      }
    : { enabled: false, recipients: [], sentAt: null, defaultHour: 9, templateId: null };

  // Keep the local editor in sync when settings load or the kind tab changes.
  const initCsv = kindSettings.recipients.join(", ");
  useEffect(() => {
    setDirty(false);
    setCsv("");
    setHour(kindSettings.defaultHour);
    setPreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const csvValue = dirty ? csv : initCsv;
  const hourValue = dirty ? hour : kindSettings.defaultHour;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "digest-settings"] });

  const save = async () => {
    const recipients = splitCsv(csvValue);
    if (!recipients.length) {
      toast({ title: "Add at least one recipient", variant: "destructive" });
      return;
    }
    setBusy("saving");
    try {
      const res = await fetch("/api/admin/ai/digests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [`${kind}_recipients`]: recipients,
          [`${kind}_hour`]: Number(hourValue) || kindSettings.defaultHour,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setDirty(false);
      invalidate();
      toast({ title: "Saved", description: `${KIND_META[kind].label} digest settings updated.` });
    } catch (e) {
      toast({ title: "Save failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const toggle = async (on: boolean) => {
    setBusy("saving");
    try {
      const res = await fetch("/api/admin/ai/digests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [`${kind}_enabled`]: on }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to toggle");
      invalidate();
      toast({ title: on ? "Enabled" : "Disabled", description: `${KIND_META[kind].label} digest ${on ? "turned on" : "turned off"}.` });
    } catch (e) {
      toast({ title: "Toggle failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const generate = async () => {
    setBusy("generating");
    try {
      const res = await fetch("/api/admin/ai/digests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setPreview({ subject: data.subject, markdown: data.markdown, html: data.html ?? "" });
      toast({ title: "Preview generated", description: "Edit it, then Send now." });
    } catch (e) {
      toast({ title: "Generation failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const setTemplate = async (id: string) => {
    setBusy("saving");
    try {
      const res = await fetch("/api/admin/ai/digests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [`${kind}_template_id`]: id || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to set template");
      invalidate();
      const name = templatesQuery.data?.find((t) => t.id === id)?.name;
      toast({ title: "Template set", description: name ? `"${name}" wraps the ${KIND_META[kind].label.toLowerCase()} digest.` : "Default shell used." });
    } catch (e) {
      toast({ title: "Update failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    if (!preview) return;
    const recipients = splitCsv(csvValue);
    if (!recipients.length) {
      toast({ title: "Add at least one recipient", variant: "destructive" });
      return;
    }
    setBusy("sending");
    try {
      const res = await fetch("/api/admin/ai/digests/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, subject: preview.subject, markdown: preview.markdown, to: recipients }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      if (data.email !== "sent") throw new Error(`Delivery failed (${data.email})`);
      invalidate();
      toast({ title: "Sent", description: `${KIND_META[kind].label} digest delivered to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}.` });
    } catch (e) {
      toast({ title: "Send failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock size={16} className="text-muted-foreground" />
          <h2 className="font-heading font-bold text-lg text-foreground">AI Scheduled reports</h2>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5" role="tablist" aria-label="Digest type">
          {(Object.keys(KIND_META) as DigestKind[]).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={kind === k}
              onClick={() => setKind(k)}
              className={cn(
                "px-3 h-7 rounded-md text-xs font-semibold transition-all",
                kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {KIND_META[k].label}
            </button>
          ))}
        </div>
      </div>

      {settingsQuery.isLoading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Loading settings…</div>
      ) : settingsQuery.isError ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Settings unavailable.</div>
      ) : (
        <div className="px-6 py-5 space-y-5">
          {/* Schedule row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{KIND_META[kind].label} digest</span>
                  <button
                    role="switch"
                    aria-checked={kindSettings.enabled}
                    onClick={() => toggle(!kindSettings.enabled)}
                    disabled={busy !== null}
                    className={cn(
                      "relative w-9 h-5 rounded-full transition-colors",
                      kindSettings.enabled ? "bg-primary" : "bg-muted border border-border",
                      busy !== null && "opacity-60"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                      kindSettings.enabled && "translate-x-4"
                    )} />
                  </button>
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {kindSettings.enabled ? "Scheduled" : "Off"}
                </span>
              </div>
              {kindSettings.enabled && (
                <p className="text-xs text-muted-foreground mt-1">
                  {KIND_META[kind].blurb} at {hourValue || kindSettings.defaultHour}:00 UTC
                  {kind === "weekly" ? " on Mondays" : ""}.
                  {kindSettings.sentAt && <> Last sent {format(new Date(kindSettings.sentAt), "MMM d, yyyy")}.</>}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground">Send hour (UTC)</label>
              <select
                value={hourValue}
                onChange={(e) => { setHour(Number(e.target.value)); setDirty(true); }}
                className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold outline-none focus:border-primary/50 cursor-pointer"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
                ))}
              </select>
            </div>
          </div>

          {/* Template */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-muted-foreground shrink-0" />
              <span className="text-xs font-semibold text-muted-foreground">Template</span>
              <select
                value={kindSettings.templateId ?? ""}
                onChange={(e) => setTemplate(e.target.value)}
                disabled={busy !== null || templatesQuery.isLoading}
                className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold outline-none focus:border-primary/50 cursor-pointer disabled:opacity-60 max-w-[280px]"
                title="The shell this digest is wrapped in. Built and managed on the Templates page."
              >
                <option value="">Default shell</option>
                {(templatesQuery.data ?? []).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <Link
              href="/admin/emails/templates"
              className="text-xs font-semibold text-primary hover:underline shrink-0"
            >
              Manage templates
            </Link>
          </div>

          {/* Recipients */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Recipients</label>
            <div className="flex items-start gap-2 mt-1.5">
              <input
                value={csvValue}
                onChange={(e) => { setCsv(e.target.value); setDirty(true); }}
                placeholder="admin@regentplatform.com, another@example.com"
                className="flex-1 h-10 rounded-xl bg-background border border-border px-3 text-sm outline-none focus:border-primary/50"
              />
              <button
                onClick={save}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border text-xs font-bold hover:border-primary/40 hover:text-primary transition-all disabled:opacity-60"
              >
                {busy === "saving" ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
              </button>
            </div>
          </div>

          <div className="border-t border-border/60 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-foreground">Preview &amp; send</div>
                <p className="text-xs text-muted-foreground">Generate a draft, edit it here, then deliver it now.</p>
              </div>
              <button
                onClick={generate}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 transition-all disabled:opacity-60"
              >
                {busy === "generating" ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Generate preview
              </button>
            </div>

            {preview ? (
              <div className="mt-4 space-y-3">
                <input
                  value={preview.subject}
                  onChange={(e) => setPreview((p) => (p ? { ...p, subject: e.target.value } : p))}
                  className="w-full h-10 rounded-xl bg-background border border-border px-3 text-sm font-semibold outline-none focus:border-primary/50"
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <textarea
                    value={preview.markdown}
                    onChange={(e) => setPreview((p) => (p ? { ...p, markdown: e.target.value } : p))}
                    rows={14}
                    className="w-full rounded-xl bg-background border border-border px-3 py-2.5 text-xs leading-relaxed font-mono outline-none focus:border-primary/50 resize-y"
                  />
                  {preview.html ? (
                    <iframe
                      title="Digest email preview"
                      srcDoc={preview.html}
                      sandbox=""
                      className="w-full h-72 lg:h-full lg:min-h-[280px] bg-white rounded-xl border border-border"
                    />
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                      Rendered preview appears here.
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    Will send to {splitCsv(csvValue).length || "0"} recipient{(splitCsv(csvValue).length) === 1 ? "" : "s"}
                  </span>
                  <button
                    onClick={send}
                    disabled={busy !== null}
                    className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
                  >
                    {busy === "sending" ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Send now
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-3">
                No preview yet — click &ldquo;Generate preview&rdquo; to draft the {KIND_META[kind].label.toLowerCase()} digest.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
