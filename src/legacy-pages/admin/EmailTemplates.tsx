"use client";

// Emails > Templates: the gallery of reusable email shells (weekly report,
// daily report, newsletter). Each card shows a live iframe of the rendered
// shell (with sample content), tells you which use it is currently assigned
// to, and lets you assign, duplicate, edit, delete — or build a new one with
// the AI template builder (separate from the newsletter content writer).

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  LayoutTemplate, Plus, Trash2, Copy, Pencil, Sparkles, Loader2, Save, X, Check, Send, Mail, CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { renderEmailTemplate } from "@/lib/ai/email-templates";

type TemplateKind = "weekly" | "daily" | "newsletter";
const KINDS: TemplateKind[] = ["weekly", "daily", "newsletter"];

interface EmailTemplateRow {
  id: string;
  name: string;
  kind: string;
  html: string;
  subject?: string | null;
  is_preset: boolean;
  created_at: string;
  updated_at: string;
}

interface SettingsRow {
  weekly_template_id: string | null;
  daily_template_id: string | null;
  newsletter_template_id: string | null;
}

/** Sample content so previews show a realistic shell without sending anything. */
const SAMPLE_CONTENT =
  '<p style="font-size:15px;line-height:23px;color:#1C2431;">This is where the report body renders. Here is a short paragraph with the key numbers, followed by a couple of takeaways.</p>' +
  '<ul style="font-size:14px;line-height:22px;color:#1C2431;padding-left:20px;"><li>Signups up across the week</li><li>Top page: home</li><li>One action to focus on</li></ul>';

const KIND_LABEL: Record<TemplateKind, string> = {
  weekly: "Weekly report",
  daily: "Daily report",
  newsletter: "Newsletter",
};

export default function EmailTemplates() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<EmailTemplateRow | null>(null);
  const [building, setBuilding] = useState(false);

  const templatesQuery = useQuery({
    queryKey: ["admin", "email-templates"],
    staleTime: 30_000,
    queryFn: async (): Promise<EmailTemplateRow[]> => {
      const { data, error } = await (supabase as any)
        .from("email_templates")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data || []) as EmailTemplateRow[];
    },
  });

  const settingsQuery = useQuery({
    queryKey: ["admin", "digest-settings", "templates"],
    staleTime: 30_000,
    queryFn: async (): Promise<SettingsRow> => {
      const { data, error } = await (supabase as any)
        .from("email_settings")
        .select("weekly_template_id, daily_template_id, newsletter_template_id")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return (data || {}) as SettingsRow;
    },
  });

  const templates = templatesQuery.data ?? [];
  const settings = settingsQuery.data ?? { weekly_template_id: null, daily_template_id: null, newsletter_template_id: null };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "email-templates"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "digest-settings"] });
  };

  /** Render a shell through the shared renderer with sample content. */
  const previewOf = (t: EmailTemplateRow, kindHint: TemplateKind) => {
    try {
      return renderEmailTemplate(t.html, {
        content: SAMPLE_CONTENT,
        subject: t.subject && t.subject.includes("{{") ? `Sample ${KIND_LABEL[kindHint]}` : t.subject || "Sample output",
        unsubscribe: '<a href="#" style="color:#657081;text-decoration:underline;">Unsubscribe</a>',
      });
    } catch {
      return t.html;
    }
  };

  const assign = async (t: EmailTemplateRow, kind: TemplateKind) => {
    try {
      const res = await fetch("/api/admin/ai/digests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [`${kind}_template_id`]: t.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Assign failed");
      invalidate();
      toast({ title: "Assigned", description: `"${t.name}" is now used for the ${KIND_LABEL[kind]}.` });
    } catch (e) {
      toast({ title: "Assign failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    }
  };

  const duplicate = async (t: EmailTemplateRow) => {
    const name = `${t.name} (copy)`;
    const { error } = await (supabase as any).from("email_templates").insert({
      name,
      kind: t.kind,
      html: t.html,
      subject: t.subject,
      is_preset: false,
    });
    if (error) {
      toast({ title: "Duplicate failed", variant: "destructive" });
    } else {
      invalidate();
      toast({ title: "Duplicated", description: `"${name}" created.` });
    }
  };

  const remove = async (t: EmailTemplateRow) => {
    if (!confirm(`Delete template "${t.name}"? Email settings that use it fall back to the default shell.`)) return;
    const { error } = await (supabase as any).from("email_templates").delete().eq("id", t.id);
    if (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    } else {
      invalidate();
      toast({ title: "Template deleted" });
    }
  };

  const usedBy = (id: string): TemplateKind[] => KINDS.filter((k) => settings[`${k}_template_id`] === id);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <LayoutTemplate size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">Email templates</h1>
              <p className="text-muted-foreground text-sm">
                The shells behind the weekly/daily reports and the newsletter. Assign one per use, or build a new one with AI.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setBuilding(true)}
          className="inline-flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
        >
          <Sparkles size={16} /> Build template
        </button>
      </div>

      {(templatesQuery.isError || settingsQuery.isError) && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-4">
          Failed to load templates: {templatesQuery.error instanceof Error ? templatesQuery.error.message : settingsQuery.error instanceof Error ? settingsQuery.error.message : "unknown error"}
        </div>
      )}

      {templates.length === 0 && !templatesQuery.isLoading ? (
        <div className="bg-card border border-border rounded-2xl py-16 text-center text-muted-foreground">
          <LayoutTemplate size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No templates yet. Built-in presets are seeded on first deploy; or build one with AI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((t) => {
            const active = usedBy(t.id);
            return (
              <div key={t.id} className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col">
                <div className="relative bg-muted/40 p-3 flex-1">
                  <iframe
                    title={`Preview of ${t.name}`}
                    srcDoc={previewOf(t, t.kind === "newsletter" ? "newsletter" : t.kind === "daily" ? "daily" : "weekly")}
                    sandbox=""
                    className="w-full h-[340px] bg-white rounded-xl border border-border"
                  />
                </div>
                <div className="px-5 py-4 border-t border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">{t.name}</span>
                        {t.is_preset && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">Preset</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {KIND_LABEL[t.kind as TemplateKind] ?? t.kind} · updated {format(new Date(t.updated_at), "MMM d")}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditing(t)}
                      className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-all shrink-0"
                      aria-label="Edit template"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>

                  {active.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {active.map((k) => (
                        <span key={k} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">
                          <Check size={10} /> In use · {KIND_LABEL[k]}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1.5 mt-3">
                    {KINDS.map((k) => (
                      <button
                        key={k}
                        onClick={() => assign(t, k)}
                        disabled={settings[`${k}_template_id`] === t.id}
                        className={cn(
                          "inline-flex items-center justify-center gap-1 h-8 rounded-lg text-[11px] font-bold border transition-all",
                          settings[`${k}_template_id`] === t.id
                            ? "bg-primary/10 border-primary/30 text-primary cursor-default"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                        )}
                        title={`Use for ${KIND_LABEL[k]}`}
                      >
                        {k === "weekly" ? <CalendarClock size={12} /> : k === "daily" ? <Send size={12} /> : <Mail size={12} />}
                        <span className="hidden sm:inline">{k === "weekly" ? "Weekly" : k === "daily" ? "Daily" : "News"}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
                    <button
                      onClick={() => duplicate(t)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
                    >
                      <Copy size={12} /> Duplicate
                    </button>
                    <button
                      onClick={() => setEditing(t)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => remove(t)}
                      className="ml-auto p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                      aria-label="Delete template"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && <EditModal template={editing} onClose={() => setEditing(null)} onSaved={invalidate} />}
      {building && <BuildModal onClose={() => setBuilding(false)} onSaved={invalidate} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit modal: rename + edit the shell HTML directly, with a live preview.
// ---------------------------------------------------------------------------

function EditModal({ template, onClose, onSaved }: { template: EmailTemplateRow; onClose: () => void; onSaved: () => void }) {
  const supabase = createClient();
  const [name, setName] = useState(template.name);
  const [html, setHtml] = useState(template.html);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any)
      .from("email_templates")
      .update({ name: name.trim(), html, updated_at: new Date().toISOString() })
      .eq("id", template.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", variant: "destructive" });
    } else {
      onSaved();
      onClose();
      toast({ title: "Template saved" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-card">
          <div>
            <h3 className="font-heading font-bold text-lg text-foreground">Edit template</h3>
            <p className="text-xs text-muted-foreground">Rename it or edit the HTML shell. Placeholders: {"{{content}}, {{logo}}, {{preheader}}, {{subject}}, {{year}}, {{unsubscribe}}"}.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl bg-background border border-border px-3 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">HTML shell</label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                rows={18}
                className="mt-1 w-full rounded-xl bg-background border border-border px-3 py-2.5 text-[11px] leading-relaxed font-mono outline-none focus:border-primary/50 resize-y"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Preview (sample content)</label>
            <iframe
              title="Template preview"
              srcDoc={renderEmailTemplate(html, {
                content: SAMPLE_CONTENT,
                subject: "Sample output",
                unsubscribe: '<a href="#" style="color:#657081;text-decoration:underline;">Unsubscribe</a>',
              })}
              sandbox=""
              className="mt-1 w-full h-[480px] bg-white rounded-xl border border-border"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-card">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-all">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Build modal: brief → AI shell → live preview → save. Separate from "Draft
// with AI" in the composer, which writes newsletter copy.
// ---------------------------------------------------------------------------

function BuildModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const supabase = createClient();
  const [brief, setBrief] = useState("");
  const [kind, setKind] = useState("any");
  const [tone, setTone] = useState("professional");
  const [generated, setGenerated] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<"building" | "saving" | null>(null);

  const build = async () => {
    if (!brief.trim()) {
      toast({ title: "Describe the template first", variant: "destructive" });
      return;
    }
    setBusy("building");
    try {
      const res = await fetch("/api/admin/ai/email-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, kind, tone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Build failed");
      setGenerated(data.html);
      setName(brief.trim().slice(0, 40) || "AI template");
      toast({ title: "Template built", description: "Preview it, tweak the name, then save." });
    } catch (e) {
      toast({ title: "Build failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (!generated) return;
    setBusy("saving");
    const { error } = await (supabase as any).from("email_templates").insert({
      name: name.trim() || "AI template",
      kind,
      html: generated,
      is_preset: false,
    });
    setBusy(null);
    if (error) {
      toast({ title: "Save failed", variant: "destructive" });
    } else {
      onSaved();
      onClose();
      toast({ title: "Template saved", description: "Assign it from the gallery or in Emails." });
    }
  };

  const selectCls =
    "h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold outline-none focus:border-primary/50 cursor-pointer";

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-card">
          <div>
            <h3 className="font-heading font-bold text-lg text-foreground">Build an email template</h3>
            <p className="text-xs text-muted-foreground">AI designs the shell (layout, colors, placeholders) — not the content. That stays separate from the newsletter writer.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Design brief</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={3}
              placeholder="e.g. A clean executive summary layout — navy header card, one-column body, a subtle CTA band and a quiet footer."
              className="mt-1 w-full rounded-xl bg-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary/50 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Usable for</label>
              <select value={kind} onChange={(e) => setKind(e.target.value)} className={cn(selectCls, "mt-1 w-full")}>
                <option value="any">Any use (reports + newsletter)</option>
                <option value="weekly">Weekly report</option>
                <option value="daily">Daily report</option>
                <option value="newsletter">Newsletter</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className={cn(selectCls, "mt-1 w-full")}>
                <option value="professional">Professional</option>
                <option value="bold">Bold &amp; modern</option>
                <option value="warm">Warm &amp; friendly</option>
              </select>
            </div>
          </div>

          {!generated ? (
            <button
              onClick={build}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 transition-all disabled:opacity-60"
            >
              {busy === "building" ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Build with AI
            </button>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Template name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full h-10 rounded-xl bg-background border border-border px-3 text-sm outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={build}
                    disabled={busy !== null}
                    className="h-10 px-4 rounded-xl border border-border text-xs font-bold hover:border-primary/40 hover:text-primary transition-all disabled:opacity-60"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Preview</label>
                <iframe
                  title="AI template preview"
                  srcDoc={renderEmailTemplate(generated, {
                    content: SAMPLE_CONTENT,
                    subject: "Sample output",
                    unsubscribe: '<a href="#" style="color:#657081;text-decoration:underline;">Unsubscribe</a>',
                  })}
                  sandbox=""
                  className="mt-1 w-full h-[420px] bg-white rounded-xl border border-border"
                />
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-card">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-all">
            Cancel
          </button>
          {generated && (
            <button
              onClick={save}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              {busy === "saving" ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save template
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
