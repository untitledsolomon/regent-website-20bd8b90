"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Sparkles, RefreshCw, X, Loader2, AlertCircle, Lightbulb, ArrowUpRight,
  FilePlus2, MessageSquare, Save, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  category: string;
  severity: "low" | "medium" | "high";
  title: string;
  body: string | null;
  target_type: string | null;
  target_slug: string | null;
  target_url: string | null;
  action: string | null;
  actionable?: boolean;
  note?: string | null;
  generated_at: string;
}

interface Comment {
  id: string;
  body: string;
  created_at: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  content: "Content",
  consultation: "Leads",
  anomaly: "Anomaly",
  weekly_report: "Weekly report",
};

const severityBadge = (s: Insight["severity"]) =>
  cn(
    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
    s === "high" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
    s === "medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  );

export default function InsightsHub() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ["admin", "ai", "insights"],
    staleTime: 60_000,
    queryFn: async () => {
      const res = await fetch("/api/admin/ai/insights");
      if (!res.ok) throw new Error("Failed to load insights");
      return res.json();
    },
  });
  const rows = (query.data?.insights ?? []) as Insight[];
  const stale = query.data?.stale === true;

  const filtered = useMemo(
    () =>
      rows.filter(
        (i) =>
          (category === "all" || i.category === category) &&
          (severity === "all" || i.severity === severity)
      ),
    [rows, category, severity]
  );

  const refresh = async (regenerate: boolean) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/ai/insights", { method: "POST", body: regenerate ? "{}" : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      if (data.model_error) toast({ title: "Model step failed", description: "Anomaly alerts were still generated.", variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["admin", "ai", "insights"] });
    } catch (e) {
      toast({ title: "Refresh failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const dismiss = async (id: string) => {
    await fetch(`/api/admin/ai/insights/${id}`, { method: "PATCH", body: JSON.stringify({ dismiss: true }) });
    queryClient.invalidateQueries({ queryKey: ["admin", "ai", "insights"] });
  };

  const saveNote = async (id: string) => {
    const note = (noteDrafts[id] ?? "").trim();
    const res = await fetch(`/api/admin/ai/insights/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (res.ok) {
      toast({ title: "Note saved" });
      queryClient.invalidateQueries({ queryKey: ["admin", "ai", "insights"] });
    } else {
      toast({ title: "Failed to save note", variant: "destructive" });
    }
  };

  const takeAction = async (ins: Insight) => {
    if (!ins.action) return;
    setActionBusy(true);
    try {
      const res = await fetch(`/api/admin/ai/insights/${ins.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: ins.action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      if (ins.action === "create_post_draft" && data.id) {
        toast({ title: "Draft created", description: "Opening the new post…" });
        router.push(`/admin/posts/${data.id}`);
      } else if (data.url) {
        router.push(data.url);
      }
    } catch (e) {
      toast({ title: "Action failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setActionBusy(false);
    }
  };

  // Category filter pills.
  const categories = ["all", "content", "anomaly", "consultation", "weekly_report"];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">Intelligence Insights</h1>
              <p className="text-muted-foreground text-sm">AI performance analysis, lead signals and anomaly alerts — discuss and act.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stale && rows.length > 0 && (
            <span className="text-[11px] text-muted-foreground">Insights are over 12h old.</span>
          )}
          <Button size="sm" variant="secondary" onClick={() => refresh(true)} disabled={generating}>
            <RefreshCw size={13} className={generating ? "animate-spin mr-1.5" : "mr-1.5"} />
            {generating ? "Analyzing…" : "Refresh insights"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-3 h-8 rounded-lg text-xs font-medium transition-all",
                category === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              {c === "all" ? "All" : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="h-8 px-3 rounded-lg bg-card border border-border text-xs text-muted-foreground outline-none focus:border-primary/50 cursor-pointer"
        >
          <option value="all">All severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Body */}
      {query.isLoading ? (
        <div className="py-16 text-center text-muted-foreground">
          <Loader2 size={32} className="mx-auto mb-3 animate-spin opacity-70" />
          <p className="text-sm">Loading insights…</p>
        </div>
      ) : query.isError ? (
        <div className="py-16 text-center text-muted-foreground">
          <AlertCircle size={28} className="mx-auto mb-2 opacity-70" />
          <p className="text-sm mb-3">Insights unavailable.</p>
          <Button size="sm" variant="secondary" onClick={() => refresh(false)} disabled={generating}>
            <RefreshCw size={12} className={generating ? "animate-spin mr-1.5" : "mr-1.5"} /> Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Lightbulb size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm mb-3">
            {rows.length === 0 ? "No insights yet — run the first analysis." : "No insights match these filters."}
          </p>
          {rows.length === 0 && (
            <Button size="sm" onClick={() => refresh(true)} disabled={generating}>
              <Sparkles size={13} className="mr-1.5" /> Generate insights
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((ins) => {
            const isOpen = expanded === ins.id;
            const noteDraft = noteDrafts[ins.id];
            const commentDraft = commentDrafts[ins.id];
            const longBody = (ins.body?.length ?? 0) > 180;
            return (
              <div key={ins.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 p-4 pb-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={severityBadge(ins.severity)}>{ins.severity}</Badge>
                    <Badge className="rounded-full bg-primary/10 text-primary border-none text-[10px] font-bold uppercase">
                      {CATEGORY_LABEL[ins.category] ?? ins.category}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(ins.id)}
                    className="text-muted-foreground/70 hover:text-foreground"
                    aria-label="Dismiss insight"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 pt-3">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : ins.id)}
                    className="text-left w-full"
                  >
                    <div className="font-bold text-sm mb-1 text-foreground">{ins.title}</div>
                    {ins.body && (
                      <>
                        <p className={cn("text-[11px] text-muted-foreground leading-relaxed", !isOpen && longBody && "line-clamp-3")}>
                          {ins.body}
                        </p>
                        {longBody && (
                          <span className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1 mt-0.5">
                            {isOpen ? <>Show less <ChevronUp size={11} /></> : <>Read more <ChevronDown size={11} /></>}
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {/* Footer: time + actions */}
                  <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border/60">
                    <span className="text-[10px] text-muted-foreground/70">
                      {formatDistanceToNow(new Date(ins.generated_at), { addSuffix: true })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : ins.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground"
                      >
                        <MessageSquare size={12} /> Discuss
                      </button>
                      {ins.action === "create_post_draft" ? (
                        <Button size="sm" className="h-7 px-3 text-[11px]" onClick={() => takeAction(ins)} disabled={actionBusy}>
                          <FilePlus2 size={12} className="mr-1" /> Create draft post
                        </Button>
                      ) : ins.target_url ? (
                        <Link
                          href={ins.target_url}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0"
                        >
                          {ins.target_url === "/admin/analytics" ? "View analytics" : "Open"} <ArrowUpRight size={12} />
                        </Link>
                      ) : ins.category === "consultation" ? (
                        <Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0">
                          Open lead <ArrowUpRight size={12} />
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  {/* Expanded: note + discussion */}
                  {isOpen && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Note</div>
                        <textarea
                          value={noteDraft !== undefined ? noteDraft : (ins.note ?? "")}
                          onChange={(e) => setNoteDrafts((d) => ({ ...d, [ins.id]: e.target.value }))}
                          placeholder="Private note on this insight…"
                          rows={2}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50"
                        />
                        <div className="flex justify-end mt-1.5">
                          <Button size="sm" variant="ghost" className="h-7 px-3 text-[11px]" onClick={() => saveNote(ins.id)}>
                            <Save size={12} className="mr-1" /> Save note
                          </Button>
                        </div>
                      </div>
                      <CommentThread insightId={ins.id} draft={commentDraft ?? ""} onDraftChange={(v) => setCommentDrafts((d) => ({ ...d, [ins.id]: v }))} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Comment thread for one insight; loads lazily when the panel is open. */
function CommentThread({ insightId, draft, onDraftChange }: { insightId: string; draft: string; onDraftChange: (v: string) => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const comments = useQuery({
    queryKey: ["admin", "ai", "insights", insightId, "comments"],
    staleTime: 30_000,
    queryFn: async (): Promise<Comment[]> => {
      const res = await fetch(`/api/admin/ai/insights/${insightId}/comments`);
      if (!res.ok) throw new Error("Failed to load comments");
      return (await res.json()).comments ?? [];
    },
  });

  const addComment = async () => {
    const body = draft.trim();
    if (!body) return;
    const res = await fetch(`/api/admin/ai/insights/${insightId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      onDraftChange("");
      queryClient.invalidateQueries({ queryKey: ["admin", "ai", "insights", insightId, "comments"] });
    } else {
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Discussion</div>
      <div className="space-y-2">
        {comments.isLoading ? (
          <p className="text-[11px] text-muted-foreground">Loading comments…</p>
        ) : (comments.data ?? []).length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No comments yet.</p>
        ) : (
          (comments.data ?? []).map((c) => (
            <div key={c.id} className="bg-muted/50 rounded-lg px-3 py-2">
              <div className="text-[11px] text-foreground">{c.body}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</div>
            </div>
          ))
        )}
      </div>
      <div className="flex items-start gap-2 mt-2">
        <textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="Add a comment…"
          rows={1}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50"
        />
        <Button size="sm" className="h-9 px-3 text-[11px]" onClick={addComment} disabled={!draft.trim()}>
          Post
        </Button>
      </div>
    </div>
  );
}
