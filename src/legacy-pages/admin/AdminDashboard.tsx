"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText, TrendingUp, TrendingDown, Activity, Eye,
  ArrowUpRight, Download, Filter, Calendar as CalendarIcon,
  Sparkles, AlertCircle, Lightbulb, Loader2, X, RefreshCw,
  Users, Globe, Monitor,
} from "lucide-react";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type {
  BlogPost,
  CaseStudy,
  Resource,
} from "@/types/admin";
import {
  useAnalytics, downloadCsv, defaultParams, CONTENT_TYPES, CHANNELS, DEVICES,
  type AnalyticsParams,
} from "./useAnalytics";

interface Stats {
  posts: { total: number; published: number };
  caseStudies: { total: number; published: number };
  resources: { total: number; published: number };
}

interface InsightUi {
  id: string;
  category: string;
  severity: "low" | "medium" | "high";
  title: string;
  body: string | null;
  target_url: string | null;
  generated_at: string;
}

interface RecentItem {
  id: string;
  title: string;
  type: "post" | "case_study" | "resource";
  updated_at: string;
}

const EMPTY_STATS: Stats = {
  posts: { total: 0, published: 0 },
  caseStudies: { total: 0, published: 0 },
  resources: { total: 0, published: 0 },
};

const CHANNEL_COLORS: Record<string, string> = {
  paid: "#4F46E5", email: "#0EA5E9", social: "#C084FC", organic_search: "#22C55E",
  internal: "#94A3B8", referral: "#F59E0B", direct: "#64748B",
};

function TrendBadge({ change, suffix = "%" }: { change: number | null; suffix?: string }) {
  if (change == null) return <Badge variant="outline" className="rounded-full border-none px-2 py-0.5 text-[11px] font-bold bg-muted text-muted-foreground">—</Badge>;
  const up = change >= 0;
  return (
    <Badge variant="outline" className={cn("rounded-full border-none px-2 py-0.5 text-[11px] font-bold", up ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
      {up ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
      {up ? "+" : ""}{change.toLocaleString()}{suffix}
    </Badge>
  );
}

function formatClock(s: number | null): string {
  if (s == null) return "—";
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

export default function AdminDashboard() {
  const supabase = createClient();
  const { user } = useAuth();

  // Date range + filters
  const [preset, setPreset] = useState<number | null>(30);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [contentType, setContentType] = useState("");
  const [source, setSource] = useState("");
  const [country, setCountry] = useState("");
  const [device, setDevice] = useState("");
  const [includeInternal, setIncludeInternal] = useState(false);

  const filters = useMemo(() => ({
    p_include_internal: includeInternal,
    ...(contentType ? { p_content_type: contentType } : {}),
    ...(source ? { p_source: source } : {}),
    ...(country ? { p_country: country } : {}),
    ...(device ? { p_device: device } : {}),
  }), [contentType, source, country, device, includeInternal]);

  const params = useMemo<AnalyticsParams>(() => {
    const base = preset != null ? defaultParams(preset) : {
      p_from: customFrom ? new Date(customFrom + "T00:00:00").toISOString() : defaultParams(30).p_from,
      p_to: customTo ? new Date(customTo + "T23:59:59.999").toISOString() : defaultParams(30).p_to,
    };
    return { ...base, ...filters };
  }, [preset, customFrom, customTo, filters]);

  const analytics = useAnalytics(params);
  const o = analytics.overview;

  // Cached content stats + recent activity; refetches only when the date
  // filter (p_from) changes, not on every return to the dashboard.
  const contentQuery = useQuery({
    queryKey: ["admin", "dashboard-content", params.p_from],
    staleTime: 60_000,
    queryFn: async (): Promise<{ stats: Stats; recent: RecentItem[]; newContent: number }> => {
      const [postsRes, csRes, resRes] = await Promise.all([
        supabase.from("blog_posts").select("id, title, published, updated_at, created_at"),
        supabase.from("case_studies").select("id, title, published, updated_at, created_at"),
        supabase.from("resources").select("id, title, published, updated_at, created_at"),
      ]);
      const posts = (postsRes.data as Partial<BlogPost>[]) || [];
      const cs = (csRes.data as Partial<CaseStudy>[]) || [];
      const res = (resRes.data as Partial<Resource>[]) || [];

      const stats = {
        posts: { total: posts.length, published: posts.filter((p) => p.published).length },
        caseStudies: { total: cs.length, published: cs.filter((c) => c.published).length },
        resources: { total: res.length, published: res.filter((r) => r.published).length },
      };

      const all: RecentItem[] = [
        ...posts.map((p) => ({ id: p.id!, title: p.title!, type: "post" as const, updated_at: p.updated_at! })),
        ...cs.map((c) => ({ id: c.id!, title: c.title!, type: "case_study" as const, updated_at: c.updated_at! })),
        ...res.map((r) => ({ id: r.id!, title: r.title!, type: "resource" as const, updated_at: r.updated_at! })),
      ];
      all.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      // "N new" content created inside the selected window (created_at, not view data)
      const from = params.p_from;
      const [bp, bcs, br] = await Promise.all([
        supabase.from("blog_posts").select("id", { count: "exact", head: true }).gte("created_at", from),
        supabase.from("case_studies").select("id", { count: "exact", head: true }).gte("created_at", from),
        supabase.from("resources").select("id", { count: "exact", head: true }).gte("created_at", from),
      ]);

      return {
        stats,
        recent: all.slice(0, 6),
        newContent: (bp.count || 0) + (bcs.count || 0) + (br.count || 0),
      };
    },
  });
  const stats = contentQuery.data?.stats ?? EMPTY_STATS;
  const recent = contentQuery.data?.recent ?? [];
  const newContent = contentQuery.data?.newContent ?? 0;

  // Intelligence Insights: model-generated rows + rule-based anomaly alerts.
  // Cached like the rest of the dashboard; refreshed on demand or auto-fired
  // once when the dashboard has none.
  const queryClient = useQueryClient();
  const insightsQuery = useQuery({
    queryKey: ["admin", "ai", "insights"],
    staleTime: 60_000,
    queryFn: async () => {
      const res = await fetch("/api/admin/ai/insights");
      if (!res.ok) throw new Error("Failed to load insights");
      return res.json();
    },
  });
  const insightRows = (insightsQuery.data?.insights ?? []) as InsightUi[];
  const insightsError = insightsQuery.isError ? "Insights unavailable" : null;
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const autoFiredRef = useRef(false);

  const refreshInsights = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/admin/ai/insights", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      if (data.model_error) setGenError("Model step failed — anomaly alerts still generated");
      queryClient.invalidateQueries({ queryKey: ["admin", "ai", "insights"] });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const dismissInsight = async (id: string) => {
    try {
      await fetch(`/api/admin/ai/insights/${id}`, { method: "PATCH" });
      queryClient.invalidateQueries({ queryKey: ["admin", "ai", "insights"] });
    } catch {
      /* ignore */
    }
  };

  // Insights never link to guessed URLs: the generator stamps only validated
  // /admin/ targets (real edit pages). Anything else falls back to the
  // category's admin section so a link never 404s.
  const insightAction = (ins: InsightUi): string => {
    if (ins.target_url && ins.target_url.startsWith("/admin/")) return ins.target_url;
    switch (ins.category) {
      case "content": return "/admin/posts";
      case "consultation": return "/admin/inquiries";
      case "anomaly": return "/admin/analytics";
      case "weekly_report": return "/admin/insights";
      default: return "/admin/insights";
    }
  };

  const toggleInsight = (id: string) => {
    setExpandedInsights((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Fire the first generation once when there are no rows (async, never
  // blocks rendering the dashboard).
  useEffect(() => {
    if (autoFiredRef.current) return;
    if (insightsQuery.isSuccess && (insightsQuery.data?.insights?.length ?? 0) === 0) {
      autoFiredRef.current = true;
      refreshInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insightsQuery.isSuccess]);

  const editLink = (item: RecentItem) =>
    item.type === "post" ? `/admin/posts/${item.id}`
    : item.type === "case_study" ? `/admin/case-studies/${item.id}`
    : `/admin/resources/${item.id}`;

  const rangeLabel = preset != null
    ? `Last ${preset} days`
    : `${customFrom && customTo ? `${customFrom} → ${customTo}` : "Custom range"}`;

  const kpis = [
    { label: "TOTAL VIEWS", value: o?.views ?? 0, trend: o?.views_change ?? null, sub: rangeLabel, color: "text-emerald-500", icon: Eye },
    { label: "UNIQUE VISITORS", value: o?.visitors ?? 0, trend: o?.visitors_change ?? null, sub: `${o?.sessions ?? 0} sessions`, color: "text-indigo-500", icon: Users },
    { label: "TOTAL CONTENT", value: (stats.posts.total + stats.caseStudies.total + stats.resources.total).toLocaleString(), trend: newContent, trendSuffix: " new", sub: "Blog, case studies, resources", color: "text-amber-500", icon: FileText },
  ];

  const funnel = analytics.funnel;
  const funnelStages = funnel ? [
    { label: "Visitors", value: funnel.visitors, pct: 100, drop: null, color: "bg-indigo-500" },
    { label: "Engaged", value: funnel.engaged_visitors, pct: funnel.visitors > 0 ? Math.round((funnel.engaged_visitors / funnel.visitors) * 100) : 0, drop: "drop", color: "bg-indigo-600" },
    { label: "Converted", value: funnel.converted_visitors, pct: funnel.visitors > 0 ? Math.round((funnel.converted_visitors / funnel.visitors) * 100) : 0, drop: "drop", color: "bg-pink-500" },
  ] : [];

  const empty = !analytics.loading && o != null && o.views === 0;

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Performance Analytics</h1>
          <p className="text-muted-foreground text-sm">Live insight into your growth engine velocity from Supabase.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-xl border-border bg-card font-medium text-xs h-10">
                <CalendarIcon size={14} className="mr-2" />
                {rangeLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 space-y-3">
              <div className="flex gap-1.5">
                {[7, 30, 90].map((d) => (
                  <Button key={d} size="sm" variant={preset === d ? "secondary" : "ghost"} className="rounded-lg text-xs h-8 flex-1" onClick={() => { setPreset(d); }}>
                    {d}d
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">From</label>
                  <input type="date" value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); setPreset(null); }} className="w-full h-9 px-2 text-xs bg-background border border-input rounded-lg" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">To</label>
                  <input type="date" value={customTo} onChange={(e) => { setCustomTo(e.target.value); setPreset(null); }} className="w-full h-9 px-2 text-xs bg-background border border-input rounded-lg" />
                </div>
              </div>
              {customFrom && customTo && preset === null && (
                <Button size="sm" className="w-full rounded-lg" onClick={() => { setCustomFrom(""); setCustomTo(""); setPreset(30); }}>Reset to 30d</Button>
              )}
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl border-border bg-card">
                <Filter size={14} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Content type</label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {CONTENT_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Channel</label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="All channels" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All channels</SelectItem>
                    {CHANNELS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Device</label>
                <Select value={device} onValueChange={setDevice}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="All devices" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All devices</SelectItem>
                    {DEVICES.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Country (ISO-2)</label>
                <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. US" className="w-full h-9 px-2 mt-1 text-xs bg-background border border-input rounded-lg" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Include internal traffic</label>
                <Switch checked={includeInternal} onCheckedChange={setIncludeInternal} />
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" className="rounded-xl border-border bg-card" onClick={() => downloadCsv(
            [...analytics.topContent.map((r) => ({ content_type: r.content_type, title: r.title, views: r.views, visitors: r.visitors, avg_time_on_page: r.avg_time_on_page, avg_scroll_depth: r.avg_scroll_depth, conversions: r.conversions, last_viewed_at: r.last_viewed_at }))],
            `dashboard-${rangeLabel.replace(/[^a-z0-9]+/gi, "-")}.csv`
          )}>
            <Download size={14} />
          </Button>
        </div>
      </div>

      {analytics.error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-4">Analytics error: {analytics.error}</div>
      )}

      {analytics.loading ? <div className="p-8 animate-pulse">Loading dashboard...</div> : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="border-none shadow-sm rounded-2xl bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{kpi.label}</span>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <kpi.icon size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-heading font-bold">{typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}</span>
                    <TrendBadge change={kpi.trend} suffix={(kpi as any).trendSuffix ?? "%"} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{kpi.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg font-heading font-bold">Views & Engaged Sessions Over Time</CardTitle>
                <CardDescription className="text-xs">Daily page views plus sessions with ≥30s on page or ≥50% scroll</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-6">
                {analytics.daily.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Activity size={28} className="opacity-40" />
                    <p className="text-sm">No data yet for this range.</p>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.daily.map((d) => ({ ...d, date: format(parseISO(d.day), "MMM dd") }))}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} interval={Math.max(3, Math.floor(analytics.daily.length / 8))} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="views" name="Views" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                    <Area type="monotone" dataKey="engaged_views" name="Engaged" stroke="#22C55E" strokeWidth={2} fillOpacity={0.15} fill="#22C55E" />
                  </AreaChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card className="border-none shadow-sm rounded-3xl bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold">Conversion Funnel</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Visitors → engaged → converted</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {empty ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">No data yet for this range.</div>
                ) : funnel ? (
                  <>
                    {funnelStages.map((stage) => (
                      <div key={stage.label} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-muted-foreground">{stage.label}</span>
                          <span className="font-bold text-foreground">{stage.value.toLocaleString()}</span>
                        </div>
                        <div className="h-6 w-full bg-muted rounded-lg overflow-hidden relative">
                          <div className={cn("h-full rounded-lg transition-all", stage.color)} style={{ width: `${stage.pct}%` }} />
                        </div>
                        {stage.label === "Engaged" && funnel.engaged_drop != null && (
                          <div className="flex justify-center">
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase">▾ {funnel.engaged_drop}% drop</span>
                          </div>
                        )}
                        {stage.label === "Converted" && funnel.converted_drop != null && (
                          <div className="flex justify-center">
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase">▾ {funnel.converted_drop}% of engaged</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="pt-4 mt-4 border-t border-border">
                      <div className="bg-muted/50 rounded-2xl p-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</span>
                        <div className="text-2xl font-bold mt-1 text-foreground">{funnel.conversion_rate != null ? `${funnel.conversion_rate}%` : "—"}</div>
                      </div>
                      {Object.keys(funnel.inquiry_statuses).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {Object.entries(funnel.inquiry_statuses).map(([k, v]) => (
                            <span key={k} className="text-[10px] font-bold bg-muted rounded-full px-2 py-0.5 text-foreground capitalize">{k}: {v}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">No data yet.</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sources, Geo, Devices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold">Traffic by Channel</CardTitle>
                <CardDescription className="text-xs">Views & conversions by attribution channel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.sources.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground text-sm">No data yet.</div>
                ) : (
                  analytics.sources.map((s) => (
                    <div key={s.channel + (s.source || "")} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium capitalize flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: CHANNEL_COLORS[s.channel] || "#94A3B8" }} />
                          {s.channel.replace("_", " ")}
                          {s.source && <span className="text-muted-foreground font-normal">· {s.source}</span>}
                        </span>
                        <span className="font-bold">{s.views.toLocaleString()}{s.conversions > 0 && <span className="text-emerald-600 font-bold ml-1.5">{s.conversions} conv</span>}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.max(2, Math.round((s.views / analytics.sources[0].views) * 100))}%`, background: CHANNEL_COLORS[s.channel] || "#4F46E5" }} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold">Geography</CardTitle>
                <CardDescription className="text-xs">Sessions by country code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-2"><Globe size={14} /> <span className="text-xs">{analytics.geo.length} countries</span></div>
                {analytics.geo.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground text-sm">No data yet.</div>
                ) : (
                  analytics.geo.slice(0, 8).map((g) => (
                    <div key={g.country_code} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl">
                      <span className="text-sm font-bold">{g.country_code}</span>
                      <span className="text-xs text-muted-foreground">{g.views.toLocaleString()} views · {g.share}%</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold">Devices</CardTitle>
                <CardDescription className="text-xs">Views by device type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-2"><Monitor size={14} /> <span className="text-xs">Share of tracked views</span></div>
                {analytics.devices.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground text-sm">No data yet.</div>
                ) : (
                  analytics.devices.map((d) => (
                    <div key={d.device_type} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium capitalize">{d.device_type}</span>
                        <span className="font-bold">{d.views.toLocaleString()} · {d.share}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.share}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Content Table */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading font-bold">Top Performing Content</CardTitle>
                <CardDescription className="text-xs">Based on views and engagement depth</CardDescription>
              </div>
              <Link href="/admin/analytics">
                <Button variant="link" className="text-primary text-xs font-bold">Full Analytics</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {analytics.topContent.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <FileText size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No views yet. Traffic will appear here as visitors engage with your content.</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left border-b border-border">
                      <th className="pb-4 font-bold">CONTENT TITLE</th>
                      <th className="pb-4 font-bold">VIEWS</th>
                      <th className="pb-4 font-bold">AVG. TIME</th>
                      <th className="pb-4 font-bold">SCROLL</th>
                      <th className="pb-4 font-bold">ENGAGEMENT</th>
                      <th className="pb-4 font-bold text-right">CONVERSIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {analytics.topContent.slice(0, 8).map((item, idx) => {
                      const engagement = item.avg_time_on_page != null && item.avg_time_on_page > 30 && (item.avg_scroll_depth ?? 0) > 50 ? 'High'
                                      : item.avg_time_on_page != null && item.avg_time_on_page > 15 ? 'Medium' : 'Low';
                      return (
                        <tr key={idx} className="group hover:bg-muted/30 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", idx % 2 === 0 ? "bg-indigo-50" : "bg-emerald-50")}>
                                <FileText size={18} className={idx % 2 === 0 ? "text-indigo-600" : "text-emerald-600"} />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-foreground line-clamp-1">{item.title || item.slug || "Untitled"}</div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold">{item.content_type.replace('_', ' ')}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-bold text-sm">{item.views.toLocaleString()}</td>
                          <td className="py-4 font-medium text-sm text-slate-600">{formatClock(item.avg_time_on_page)}</td>
                          <td className="py-4 font-medium text-sm text-slate-600">{item.avg_scroll_depth != null ? `${Math.round(item.avg_scroll_depth)}%` : "—"}</td>
                          <td className="py-4">
                            <Badge variant="outline" className={cn(
                              "rounded-full border-none px-2 py-0.5 text-[10px] font-bold uppercase",
                              engagement === 'High' ? "bg-emerald-500/10 text-emerald-600" :
                              engagement === 'Medium' ? "bg-amber-500/10 text-amber-600" :
                              "bg-slate-500/10 text-slate-600"
                            )}>{engagement}</Badge>
                          </td>
                          <td className="py-4 text-right text-[11px] font-bold">{item.conversions > 0 ? item.conversions : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </CardContent>
          </Card>

          {/* Insights & Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
            <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary" size={20} />
                  <CardTitle className="text-lg font-heading font-bold">Intelligence Insights</CardTitle>
                  {insightRows.length > 0 && !insightsQuery.data?.stale && (
                    <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-none text-[10px] font-bold uppercase">fresh</Badge>
                  )}
                </div>
                <CardDescription className="text-muted-foreground text-xs">AI performance analysis, lead signals and anomaly alerts — last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insightsQuery.isLoading ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Loader2 size={32} className="mx-auto mb-2 animate-spin opacity-70" />
                    <p className="text-sm">Loading insights…</p>
                  </div>
                ) : insightsError ? (
                  <div className="py-6 text-center text-muted-foreground">
                    <AlertCircle size={28} className="mx-auto mb-2 opacity-70" />
                    <p className="text-sm mb-3">{insightsError}</p>
                    <Button size="sm" variant="secondary" onClick={refreshInsights} disabled={generating}>
                      <RefreshCw size={12} className={generating ? "animate-spin mr-1.5" : "mr-1.5"} /> Retry
                    </Button>
                  </div>
                ) : insightRows.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Lightbulb size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No insights yet — generating the first analysis.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insightRows.slice(0, 8).map((ins) => {
                      const isOpen = expandedInsights.has(ins.id);
                      const longBody = (ins.body?.length ?? 0) > 180;
                      const actionHref = insightAction(ins);
                      return (
                        <div key={ins.id} className="bg-muted/50 p-4 rounded-2xl border border-border/60 hover:bg-muted transition-colors group">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <Badge className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                              ins.severity === "high" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                              ins.severity === "medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            )}>{ins.category}</Badge>
                            <button type="button" onClick={() => dismissInsight(ins.id)} className="text-muted-foreground/70 hover:text-foreground" aria-label="Dismiss insight">
                              <X size={14} />
                            </button>
                          </div>
                          <div className="font-bold text-sm mb-1 text-foreground">{ins.title}</div>
                          {ins.body && (
                            <>
                              <p className={cn("text-[11px] text-muted-foreground leading-relaxed", !isOpen && longBody && "line-clamp-3")}>{ins.body}</p>
                              {longBody && (
                                <button type="button" onClick={() => toggleInsight(ins.id)} className="text-[11px] font-semibold text-primary hover:underline mt-0.5">
                                  {isOpen ? "Show less" : "Read more"}
                                </button>
                              )}
                            </>
                          )}
                          <div className="flex items-center justify-between gap-3 mt-2.5 pt-2.5 border-t border-border/50">
                            <span className="text-[10px] text-muted-foreground/70">{formatDistanceToNow(new Date(ins.generated_at), { addSuffix: true })}</span>
                            {actionHref && (
                              <Link href={actionHref} className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0">
                                {ins.category === "consultation" ? "Open lead" : ins.category === "anomaly" ? "View analytics" : ins.category === "weekly_report" ? "Read report" : "View topic"} <ArrowUpRight size={12} />
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {(genError || insightsQuery.data?.stale) && (
                  <p className="text-[11px] text-muted-foreground/70">{genError ?? "Insights are over 12h old — refresh for a fresh analysis."}</p>
                )}
                <div className="pt-1 flex items-center justify-end">
                  <Button size="sm" variant="secondary" onClick={refreshInsights} disabled={generating}>
                    <RefreshCw size={12} className={generating ? "animate-spin mr-1.5" : "mr-1.5"} />
                    {generating ? "Analyzing…" : "Refresh insights"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {recent.map(item => (
                  <Link key={item.id} href={editLink(item)} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Activity size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}</div>
                    </div>
                    <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
