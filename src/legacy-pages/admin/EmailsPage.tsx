"use client";

// Emails section: the newsletter send log (every campaign that went out, with
// its template preview) plus reusable templates. Links into the Composer so a
// template can be loaded and sent. Reads live from Supabase via React Query.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Send, Mail, Users, AlertTriangle, ChevronDown, ChevronUp, Plus, Trash2, FileText, Clock,
} from "lucide-react";

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
