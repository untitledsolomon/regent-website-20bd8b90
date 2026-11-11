"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Send, Eye, ArrowLeft, Save, FolderOpen, Sparkles, Loader2, X, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { renderEmailTemplate } from "@/lib/ai/email-templates";

interface NewsletterTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
}

interface EmailShell {
  id: string;
  name: string;
  html: string;
}

interface AiForm {
  topic: string;
  audience: string;
  goal: string;
  tone: string;
}

export default function NewsletterCompose() {
  const supabase = createClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [shells, setShells] = useState<EmailShell[]>([]);
  const [selectedShellId, setSelectedShellId] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMode, setAiMode] = useState<"draft" | "improve">("draft");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiForm, setAiForm] = useState<AiForm>({ topic: "", audience: "", goal: "", tone: "professional" });
  const { toast } = useToast();

  const loadTemplates = async () => {
    const { data, error } = await (supabase as any)
      .from("newsletter_templates")
      .select("id, name, subject, html")
      .order("updated_at", { ascending: false });
    if (!error && data) setTemplates(data as NewsletterTemplate[]);
  };

  // Email shells (the layout wrappers from Emails > Templates) usable by the
  // newsletter. The body renders inside {{content}}; the {{unsubscribe}} token
  // is left for the edge function to fill per recipient.
  const loadShells = async () => {
    const { data, error } = await (supabase as any)
      .from("email_templates")
      .select("id, name, html")
      .in("kind", ["any", "newsletter"]);
    if (!error && data) setShells(data as EmailShell[]);
  };

  // Load templates and apply a draft shared from the Emails page.
  useEffect(() => {
    loadTemplates();
    loadShells();
    const draft = localStorage.getItem("regent-template-draft");
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (typeof d.subject === "string" && typeof d.html === "string") {
          setSubject(d.subject);
          setBody(d.html);
        }
      } catch {
        /* ignore malformed draft */
      }
      localStorage.removeItem("regent-template-draft");
    }
  }, []);

  const applyTemplate = (t: NewsletterTemplate) => {
    setSubject(t.subject || "");
    setBody(t.html || "");
    toast({ title: "Template loaded", description: `Draft updated from "${t.name}".` });
  };

  const activeShell = shells.find((s) => s.id === selectedShellId) ?? null;

  /** Render the chosen shell with the current body; {{unsubscribe}} stays for the edge. */
  const renderShell = () =>
    activeShell
      ? renderEmailTemplate(activeShell.html, {
          content: body,
          preheader: `${subject} — ${stripHtml(body).slice(0, 100)}`,
          subject,
        })
      : null;

  const saveTemplate = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Nothing to save", description: "Add a subject and body first.", variant: "destructive" });
      return;
    }
    const name = window.prompt("Name this template");
    if (!name || !name.trim()) return;
    const { error } = await (supabase as any).from("newsletter_templates").insert({
      name: name.trim(),
      subject: subject.trim(),
      html: body,
    });
    if (error) {
      toast({ title: "Failed to save template", variant: "destructive" });
    } else {
      toast({ title: "Template saved", description: `"${name.trim()}" is ready to reuse.` });
      loadTemplates();
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Missing content", description: "Please add a subject and body.", variant: "destructive" });
      return;
    }
    if (!confirm(`Send this newsletter to all subscribers?\n\nSubject: ${subject}`)) return;

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Use fetch directly — functions.invoke can silently drop auth headers
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-newsletter`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: subject.trim(),
            html: body,
            // The selected shell renders content inside the layout; the edge
            // fills {{unsubscribe}} per recipient. Absent => legacy wrapper.
            ...(renderShell() ? { template_html: renderShell() } : {}),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Send failed");
      }

      const data = await res.json();
      toast({
        title: "Newsletter sent!",
        description: `Delivered to ${data.sent} subscriber${data.sent !== 1 ? "s" : ""}${data.failed > 0 ? `. ${data.failed} failed.` : "."}`,
      });
      setSubject("");
      setBody("");
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to send", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const runAi = async (mode: "draft" | "improve") => {
    setAiBusy(true);
    try {
      const res = await fetch("/api/admin/ai/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "draft"
            ? { mode, ...aiForm }
            : { mode, tone: aiForm.tone, subject, body }
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "AI draft failed");
      setSubject(data.subject);
      setBody(data.html);
      setAiOpen(false);
      toast({ title: mode === "draft" ? "Draft ready" : "Draft improved", description: "Subject and body updated — review and send." });
    } catch (e) {
      toast({ title: "AI draft failed", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-[800px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/subscribers" className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text-primary transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            Compose Newsletter
          </h1>
          <p className="text-sm text-text-muted mt-0.5">Write and send to all subscribers</p>
        </div>
      </div>

      {/* Subject */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-2">Subject Line</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="e.g. Regent Insights — March 2026"
          className="w-full h-12 border border-border rounded-lg px-4 text-sm text-text-primary bg-card outline-none focus:border-primary focus:ring-[3px] focus:ring-accent-light transition-all"
        />
      </div>

      {/* Templates */}
      {templates.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-text-primary">Load template</label>
          <div className="relative">
            <FolderOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <select
              value={selectedTemplate}
              onChange={e => {
                const t = templates.find(t => t.id === e.target.value);
                if (t) applyTemplate(t);
                setSelectedTemplate("");
              }}
              className="h-10 pl-9 pr-8 rounded-lg bg-card border border-border text-sm text-text-primary outline-none focus:border-primary focus:ring-[3px] focus:ring-accent-light cursor-pointer"
            >
              <option value="">Choose a template…</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <span className="text-xs text-text-muted">Templates replace the subject and body above.</span>
        </div>
      )}

      {/* Email shell (layout from Emails > Templates) */}
      {shells.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-text-primary">Email shell</label>
          <div className="relative">
            <LayoutTemplate size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <select
              value={selectedShellId}
              onChange={e => {
                setSelectedShellId(e.target.value);
                const s = shells.find(x => x.id === e.target.value);
                if (s) toast({ title: "Shell selected", description: `"${s.name}" wraps the preview and the send. Manage shells in Emails → Templates.` });
              }}
              className="h-10 pl-9 pr-8 rounded-lg bg-card border border-border text-sm text-text-primary outline-none focus:border-primary focus:ring-[3px] focus:ring-accent-light cursor-pointer"
            >
              <option value="">No shell (legacy layout)</option>
              {shells.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <span className="text-xs text-text-muted">Wraps your content in the branded layout; each recipient gets their own unsubscribe link.</span>
        </div>
      )}

      {/* Body */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-text-primary mb-2">Email Body</label>
        <RichTextEditor content={body} onChange={setBody} />
      </div>

      {/* Preview */}
      {preview && (
        <div className="mb-8 border border-border rounded-2xl overflow-hidden">
          <div className="bg-surface px-6 py-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Preview</span>
            <button onClick={() => setPreview(false)} className="text-xs text-text-muted hover:text-text-primary">Close</button>
          </div>
          <div className="p-8 bg-card">
            {renderShell() ? (
              <iframe
                title="Newsletter shell preview"
                srcDoc={renderShell() ?? undefined}
                sandbox=""
                className="w-full h-[520px] bg-white rounded-xl border border-border"
              />
            ) : (
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div className="font-heading text-xl font-semibold tracking-[-0.03em] text-text-primary mb-6">
                  Regent<span className="text-primary">.</span>
                </div>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
                <div className="border-t border-border mt-8 pt-4">
                  <p className="text-xs text-text-muted">© {new Date().getFullYear()} Regent Technologies</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => { setAiMode("draft"); setAiOpen(true); }}
          className="inline-flex items-center gap-2 h-11 px-5 bg-primary/5 border border-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/10 transition-all"
        >
          <Sparkles size={16} />
          Draft with AI
        </button>
        <button
          onClick={() => { setAiMode("improve"); setAiOpen(true); }}
          disabled={!body.trim()}
          className="inline-flex items-center gap-2 h-11 px-5 bg-card border border-border text-text-secondary rounded-lg text-sm font-medium hover:border-primary/30 hover:text-text-primary transition-all disabled:opacity-40"
        >
          <Sparkles size={16} />
          Improve draft
        </button>
        <button
          onClick={saveTemplate}
          className="inline-flex items-center gap-2 h-11 px-5 bg-card border border-border text-text-secondary rounded-lg text-sm font-medium hover:border-primary/30 hover:text-text-primary transition-all"
        >
          <Save size={16} />
          Save as Template
        </button>
        <button
          onClick={() => setPreview(!preview)}
          className="inline-flex items-center gap-2 h-11 px-5 bg-card border border-border text-text-secondary rounded-lg text-sm font-medium hover:border-primary/30 hover:text-text-primary transition-all"
        >
          <Eye size={16} />
          {preview ? "Hide Preview" : "Preview"}
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !subject.trim() || !body.trim()}
          className="inline-flex items-center gap-2 h-11 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          <Send size={16} />
          {sending ? "Sending…" : "Send Newsletter"}
        </button>
      </div>

      {/* AI helper modal */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4" onClick={() => !aiBusy && setAiOpen(false)}>
          <div
            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                <h2 className="font-heading text-lg font-semibold text-text-primary">
                  {aiMode === "draft" ? "Draft with AI" : "Improve draft"}
                </h2>
              </div>
              <button onClick={() => setAiOpen(false)} className="text-text-muted hover:text-text-primary" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {aiMode === "draft" ? (
              <div className="space-y-4">
                <Field label="Topic">
                  <input value={aiForm.topic} onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })} placeholder="e.g. New case study: warehouse automation" className={inputCls} />
                </Field>
                <Field label="Audience">
                  <input value={aiForm.audience} onChange={(e) => setAiForm({ ...aiForm, audience: e.target.value })} placeholder="e.g. Supply chain leaders" className={inputCls} />
                </Field>
                <Field label="Goal">
                  <input value={aiForm.goal} onChange={(e) => setAiForm({ ...aiForm, goal: e.target.value })} placeholder="e.g. Drive a reply to book a call" className={inputCls} />
                </Field>
                <Field label="Tone">
                  <select value={aiForm.tone} onChange={(e) => setAiForm({ ...aiForm, tone: e.target.value })} className={inputCls}>
                    {["professional", "friendly", "energetic", "authoritative"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                The AI will tighten your current subject and body while keeping the core message. Tone:
                <select value={aiForm.tone} onChange={(e) => setAiForm({ ...aiForm, tone: e.target.value })} className="ml-2 h-8 px-2 rounded-lg bg-card border border-border text-sm text-text-primary outline-none focus:border-primary">
                  {["professional", "friendly", "energetic", "authoritative"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </p>
            )}

            <div className="flex items-center justify-end gap-2 mt-6">
              <button onClick={() => setAiOpen(false)} className="h-10 px-4 text-sm font-medium text-text-muted hover:text-text-primary">
                Cancel
              </button>
              <button
                onClick={() => runAi(aiMode)}
                disabled={aiBusy}
                className="inline-flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {aiBusy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {aiBusy ? "Writing…" : aiMode === "draft" ? "Generate draft" : "Improve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full h-10 border border-border rounded-lg px-3 text-sm text-text-primary bg-card outline-none focus:border-primary focus:ring-[3px] focus:ring-accent-light transition-all";

/** Crude HTML → text, for the shell preheader. */
const stripHtml = (s: string) =>
  s
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      {children}
    </div>
  );
}