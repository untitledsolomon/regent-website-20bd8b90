"use client";

// Insights hub: every AI insight has a home here instead of being spread
// across the dashboard. The page shows the full history (active + dismissed)
// with category/severity filters, dismiss/restore, and a link to the relevant
// admin section for each insight. Reads the same generator API as the
// dashboard card and invalidates the same query keys.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  Lightbulb, RefreshCw, EyeOff, RotateCcw, ArrowUpRight, Loader2, CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface InsightRow {
  id: string;
  category: "content" | "anomaly" | "consultation" | "weekly_report";
  severity: "low" | "medium" | "high";
  title: string;
  body: string | null;
  target_url: string | null;
  generated_by: string;
  generated_at: string;
  dismissed_at: string | null;
}

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "content", label: "Content" },
  { key: "consultation", label: "Consultation" },
  { key: "anomaly", label: "Anomaly" },
  { key: "weekly_report", label: "Weekly report" },
] as const;

const SEVERITY_COLOR: Record<InsightRow["severity"], string> = {
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export default function InsightsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "ai", "insights"] });

  const query = useQuery({
    queryKey: ["admin", "ai", "insights", "all"],
    staleTime: 60_000,
    queryFn: async () => {
      const res = await fetch("/api/admin/ai/insights?include_dismissed=1");
      if (!res.ok) throw new Error("Failed to load insights");
      return res.json();
    },
  });

  const rows = (query.data?.insights ?? []) as InsightRow[];

  const stats = useMemo(() => {
    const active = rows.filter((r) => !r.dismissed_at).length;
    const high = rows.filter((r) => !r.dismissed_at && r.severity === "high").length;
    return { total: rows.length, active, high };
  }, [rows]);

  const visible = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter === "all" || r.category === filter) &&
          (!showOnlyActive || !r.dismissed_at)
      ),
    [rows, filter, showOnlyActive]
  );

  const run = async (body?: Record<string, unknown>, label = "Insights refreshed") => {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/admin/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      if (data.model_error) setGenError("Model step failed — anomaly alerts still generated");
      toast({ title: label });
      invalidate();
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Generation failed");
      toast({ title: "Failed", description: "Try again", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const toggleDismissed = async (ins: InsightRow) => {
    try {
      await fetch(`/api/admin/ai/insights/${ins.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: !!ins.dismissed_at }),
      });
      invalidate();
    } catch {
      /* ignore */
    }
  };

  // Same routing as the dashboard: only validated /admin/ targets are trusted;
  // otherwise the insight links to its category's admin section.
  const actionHref = (ins: InsightRow): string => {
    if (ins.target_url?.startsWith("/admin/")) return ins.target_url;
    switch (ins.category) {
      case "content": return "/admin/posts";
      case "consultation": return "/admin/inquiries";
      case "anomaly": return "/admin/analytics";
      default: return "/admin";
    }
  };

  const actionLabel = (ins: InsightRow): string => {
    if (ins.category === "consultation") return "Open lead";
    if (ins.category === "anomaly") return "View analytics";
    if (ins.category === "weekly_report") return "Overview";
    return "View topic";
  };

  return (
    <div className="p-8 lg:p-10 space-y-8 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">Insights</h1>
            <p className="text-muted-foreground text-sm">Every AI finding in one place — review, dismiss, restore.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => run({ mode: "weekly_report" }, "Weekly report generated")}
            disabled={generating}
          >
            <CalendarDays size={15} className="mr-1.5" /> Weekly report
          </Button>
          <Button size="sm" onClick={() => run(undefined)} disabled={generating}>
            <RefreshCw size={15} className={generating ? "animate-spin mr-1.5" : "mr-1.5"} />
            {generating ? "Analyzing…" : "Refresh insights"}
          </Button>
        </div>
      </div>

      {genError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-4">{genError}</div>
      )}
      {query.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-4">Failed to load insights.</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-heading font-semibold tracking-tight">{stats.active}</CardTitle>
            <CardDescription className="text-sm font-medium">Active insights</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-heading font-semibold tracking-tight">{stats.high}</CardTitle>
            <CardDescription className="text-sm font-medium">High severity</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-heading font-semibold tracking-tight">{stats.total}</CardTitle>
            <CardDescription className="text-sm font-medium">All time (incl. dismissed)</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={cn(
              "text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all",
              filter === c.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {c.label}
          </button>
        ))}
        <label className="flex items-center gap-2 ml-2 text-xs font-medium text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyActive}
            onChange={(e) => setShowOnlyActive(e.target.checked)}
            className="rounded"
          />
          Active only
        </label>
      </div>

      {/* List */}
      {query.isLoading && !rows.length ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 size={18} className="animate-spin mr-2" /> Loading…
        </div>
      ) : visible.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Lightbulb size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No insights here. Refresh to generate a new analysis.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((ins) => (
            <Card key={ins.id} className={cn("border rounded-2xl shadow-sm", ins.dismissed_at && "opacity-60")}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", SEVERITY_COLOR[ins.severity])}>
                        {ins.severity}
                      </Badge>
                      <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase capitalize">
                        {ins.category.replace("_", " ")}
                      </Badge>
                      {ins.dismissed_at && (
                        <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                          Dismissed
                        </Badge>
                      )}
                      <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">
                        {ins.generated_by === "rule" ? "Auto alert" : "AI"}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-foreground">{ins.title}</div>
                    {ins.body && (
                      <p className="text-[12px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{ins.body}</p>
                    )}
                    <div className="text-[10px] text-muted-foreground/60">
                      {format(new Date(ins.generated_at), "MMM d, yyyy 'at' h:mm a")} ·{" "}
                      {formatDistanceToNow(new Date(ins.generated_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Link
                      href={actionHref(ins)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      {actionLabel(ins)} <ArrowUpRight size={12} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleDismissed(ins)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                    >
                      {ins.dismissed_at ? (
                        <><RotateCcw size={12} /> Restore</>
                      ) : (
                        <><EyeOff size={12} /> Dismiss</>
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
