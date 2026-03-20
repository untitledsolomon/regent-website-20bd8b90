"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, subDays } from "date-fns";
import {
  Eye, Users, Globe, Monitor, Smartphone, Tablet, Clock, ExternalLink,
  TrendingUp, BarChart3, Repeat, MousePointerClick, ArrowUpRight, ArrowDownRight, Download,
} from "lucide-react";

function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsView {
  id: string;
  content_type: string;
  content_id: string;
  title: string;
  created_at: string;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  session_id: string | null;
  time_on_page: number | null;
  scroll_depth: number | null;
  is_returning: boolean | null;
  converted_to: string | null;
}

interface TopContent {
  content_type: string;
  title: string;
  view_count: number;
  avg_time_on_page: number;
  avg_scroll_depth: number;
}

interface DailyView {
  date: string;
  views: number;
  unique_sessions: number;
}

interface AudienceItem {
  dimension: string;
  value: string;
  count: number;
}

interface ConversionStat {
  converted_to: string;
  count: number;
  conversion_rate: number;
}

const PIE_COLORS = [
  "hsl(243, 76%, 59%)",
  "hsl(232, 85%, 74%)",
  "hsl(142, 71%, 45%)",
  "hsl(42, 87%, 55%)",
  "hsl(0, 72%, 51%)",
  "hsl(280, 65%, 60%)",
];

const contentTypeLabel: Record<string, string> = {
  blog_post: "Blog Post",
  case_study: "Case Study",
  resource_download: "Download",
};

const deviceIcons: Record<string, React.ReactNode> = {
  desktop: <Monitor size={14} />,
  mobile: <Smartphone size={14} />,
  tablet: <Tablet size={14} />,
};

const DATE_RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

function formatSeconds(s: number | null): string {
  if (!s) return "—";
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function TrendBadge({ value, suffix = "" }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
      positive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
    }`}>
      {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {Math.abs(value)}{suffix}
    </span>
  );
}

export default function AdminAnalytics() {
  const supabase = createClient();
  const [views, setViews] = useState<AnalyticsView[]>([]);
  const [audience, setAudience] = useState<AudienceItem[]>([]);
  const [topContent, setTopContent] = useState<TopContent[]>([]);
  const [dailyViews, setDailyViews] = useState<DailyView[]>([]);
  const [conversions, setConversions] = useState<ConversionStat[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [prevTotalViews, setPrevTotalViews] = useState(0);
  const [uniqueSessions, setUniqueSessions] = useState(0);
  const [returningCount, setReturningCount] = useState(0);
  const [avgTimeOnPage, setAvgTimeOnPage] = useState(0);
  const [avgScrollDepth, setAvgScrollDepth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    const [detailRes, audienceRes, analyticsRes, dailyRes, totalRes, prevTotalRes, convRes] = await Promise.all([
      supabase.rpc("get_analytics_detail", { p_limit: 200, p_offset: 0 }),
      supabase.rpc("get_audience_breakdown"),
      supabase.rpc("get_content_analytics"),
      supabase.rpc("get_daily_views", { days_back: daysBack }),
      supabase
        .from("content_views")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from("content_views")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - daysBack * 2 * 24 * 60 * 60 * 1000).toISOString())
        .lt("created_at", new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString()),
      (supabase as any).rpc("get_conversion_stats"),
    ]);

    const viewsData = (detailRes.data || []) as AnalyticsView[];
    setViews(viewsData);

    // Engagement metrics from current period views
    const periodViews = viewsData.filter(v =>
      new Date(v.created_at) >= new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
    );
    const timesOnPage = periodViews.map(v => v.time_on_page).filter((t): t is number => t !== null && t > 0);
    const scrollDepths = periodViews.map(v => v.scroll_depth).filter((s): s is number => s !== null && s > 0);
    setAvgTimeOnPage(timesOnPage.length > 0 ? Math.round(timesOnPage.reduce((a, b) => a + b, 0) / timesOnPage.length) : 0);
    setAvgScrollDepth(scrollDepths.length > 0 ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length) : 0);

    setAudience(
      (audienceRes.data || []).map((a: any) => ({
        dimension: a.dimension,
        value: a.value,
        count: Number(a.count),
      }))
    );

    setTopContent(
      (analyticsRes.data || []).map((item: any) => ({
        content_type: item.content_type,
        title: item.title,
        view_count: Number(item.view_count),
        avg_time_on_page: Number(item.avg_time_on_page) || 0,
        avg_scroll_depth: Number(item.avg_scroll_depth) || 0,
      }))
    );

    const daily = Array.from({ length: daysBack }, (_, i) => {
      const d = subDays(new Date(), daysBack - 1 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const displayDate = format(d, daysBack <= 30 ? "MMM dd" : "MMM dd");
      const found = (dailyRes.data || []).find((v: any) => v.view_date === dateStr);
      return {
        date: displayDate,
        views: found ? Number(found.view_count) : 0,
        unique_sessions: found ? Number(found.unique_sessions) : 0,
      };
    });
    setDailyViews(daily);

    setTotalViews(totalRes.count || 0);
    setPrevTotalViews(prevTotalRes.count || 0);

    const sessions = new Set(viewsData.filter(v => v.session_id).map(v => v.session_id));
    setUniqueSessions(sessions.size);
    setReturningCount(viewsData.filter(v => v.is_returning).length);

    setConversions(
      (convRes.data || []).map((c: any) => ({
        converted_to: c.converted_to,
        count: Number(c.count),
        conversion_rate: Number(c.conversion_rate),
      }))
    );

    setLoading(false);
  }, [daysBack, supabase]);

  useEffect(() => { load(); }, [load]);

  const getBreakdown = (dim: string) =>
    audience.filter(a => a.dimension === dim).sort((a, b) => b.count - a.count);

  const viewsTrend = prevTotalViews > 0
    ? Math.round(((totalViews - prevTotalViews) / prevTotalViews) * 100)
    : 0;

  const returningRate = uniqueSessions > 0
    ? Math.round((returningCount / uniqueSessions) * 100)
    : 0;

  const topCountry = getBreakdown("country").filter(c => c.value !== "Unknown")[0]?.value || "—";

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-[120px] bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
        <div className="h-[280px] bg-card border border-border rounded-xl animate-pulse mb-8" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Content Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Audience insights and content performance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {DATE_RANGES.map(r => (
              <button
                key={r.label}
                onClick={() => setDaysBack(r.days)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  daysBack === r.days
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => exportToCSV(
              views.map(v => ({
                date: format(new Date(v.created_at), "yyyy-MM-dd HH:mm"),
                title: v.title,
                content_type: v.content_type,
                device: v.device_type || "",
                browser: v.browser || "",
                os: v.os || "",
                country: v.country || "",
                city: v.city || "",
                referrer: v.referrer || "",
                time_on_page_seconds: v.time_on_page || "",
                scroll_depth_pct: v.scroll_depth || "",
                is_returning: v.is_returning ? "yes" : "no",
                converted_to: v.converted_to || "",
                session_id: v.session_id || "",
              })),
              `analytics-views-${daysBack}d-${format(new Date(), "yyyy-MM-dd")}.csv`
            )}
            className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Download size={14} /> Export Views
          </button>
          <button
            onClick={() => exportToCSV(
              topContent.map((c, i) => ({
                rank: i + 1,
                title: c.title,
                content_type: c.content_type,
                view_count: c.view_count,
                avg_time_on_page_seconds: c.avg_time_on_page,
                avg_scroll_depth_pct: c.avg_scroll_depth,
              })),
              `analytics-top-content-${format(new Date(), "yyyy-MM-dd")}.csv`
            )}
            className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Download size={14} /> Export Content
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          {
            label: "Total Views", value: totalViews, sub: `last ${daysBack}d`, icon: Eye,
            badge: <TrendBadge value={viewsTrend} suffix="%" />,
          },
          {
            label: "Unique Sessions", value: uniqueSessions, sub: "tracked", icon: Users,
            badge: null,
          },
          {
            label: "Returning Visitors", value: `${returningRate}%`, sub: `${returningCount} sessions`, icon: Repeat,
            badge: null,
          },
          {
            label: "Avg Time on Page", value: formatSeconds(avgTimeOnPage), sub: `${avgScrollDepth}% avg scroll`, icon: Clock,
            badge: null,
          },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon size={18} className="text-primary" />
                </div>
                {kpi.badge}
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{kpi.label} · {kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Views Over Time */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-sm font-semibold text-foreground">Views Over Time</h3>
          <span className="text-xs text-muted-foreground">Last {daysBack} days</span>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyViews}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(243, 76%, 59%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(243, 76%, 59%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={Math.floor(daysBack / 10)} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="views" name="Page Views" stroke="hsl(243, 76%, 59%)" fill="url(#analyticsGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="unique_sessions" name="Unique Sessions" stroke="hsl(142, 71%, 45%)" fill="url(#sessionsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel */}
      {conversions.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 mb-8">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <MousePointerClick size={14} className="text-primary" /> Conversion Funnel
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-xl">
              <div className="text-2xl font-heading font-bold text-foreground">{totalViews}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Views</div>
            </div>
            {conversions.map(c => (
              <div key={c.converted_to} className="text-center p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <div className="text-2xl font-heading font-bold text-primary">{c.count}</div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">{c.converted_to} Conversions</div>
                <div className="text-xs font-medium text-primary mt-1">{c.conversion_rate}% rate</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="audience" className="mb-8">
        <TabsList>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Top Content</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="recent">Recent Views</TabsTrigger>
        </TabsList>

        {/* Audience Tab */}
        <TabsContent value="audience">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-heading text-sm font-semibold text-foreground mb-4">Device Type</h4>
              {getBreakdown("device_type").length > 0 ? (
                <>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={getBreakdown("device_type")} dataKey="count" nameKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} stroke="none">
                          {getBreakdown("device_type").map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {getBreakdown("device_type").map((item, i) => (
                      <div key={item.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {deviceIcons[item.value]} {item.value} ({item.count})
                      </div>
                    ))}
                  </div>
                </>
              ) : <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">No data yet</div>}
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-heading text-sm font-semibold text-foreground mb-4">Browser</h4>
              {getBreakdown("browser").length > 0 ? (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBreakdown("browser").slice(0, 6)} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="value" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={70} />
                      <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Bar dataKey="count" fill="hsl(232, 85%, 74%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No data yet</div>}
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-heading text-sm font-semibold text-foreground mb-4">Operating System</h4>
              {getBreakdown("os").length > 0 ? (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBreakdown("os").slice(0, 6)} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="value" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={70} />
                      <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Bar dataKey="count" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No data yet</div>}
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-heading text-sm font-semibold text-foreground mb-4">Top Regions</h4>
              <div className="space-y-2">
                {getBreakdown("country").slice(0, 8).map((item) => (
                  <div key={item.value} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm text-foreground">{item.value}</span>
                    <span className="text-sm font-heading font-bold text-foreground">{item.count}</span>
                  </div>
                ))}
                {getBreakdown("country").length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No data yet</div>}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 md:col-span-2">
              <h4 className="font-heading text-sm font-semibold text-foreground mb-4">Top Referrers</h4>
              <div className="space-y-2">
                {getBreakdown("referrer").slice(0, 8).map((item) => (
                  <div key={item.value} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm text-foreground flex items-center gap-2 truncate">
                      <ExternalLink size={12} className="text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{item.value}</span>
                    </span>
                    <span className="text-sm font-heading font-bold text-foreground ml-2">{item.count}</span>
                  </div>
                ))}
                {getBreakdown("referrer").length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No data yet</div>}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Top Content Tab */}
        <TabsContent value="content">
          <div className="bg-card border border-border rounded-xl p-5">
            <h4 className="font-heading text-sm font-semibold text-foreground mb-4">Top Performing Content</h4>
            {topContent.length > 0 ? (
              <div className="space-y-1">
                {topContent.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-muted transition-colors">
                    <span className="text-xs font-mono text-muted-foreground w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
                      <Badge variant="secondary" className="text-[10px] mt-0.5">
                        {contentTypeLabel[item.content_type] || item.content_type}
                      </Badge>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <div className="text-sm font-heading font-bold text-foreground">{item.view_count} views</div>
                      <div className="text-xs text-muted-foreground">
                        {formatSeconds(item.avg_time_on_page)} · {item.avg_scroll_depth ? `${Math.round(item.avg_scroll_depth)}% scroll` : "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">No content views recorded yet</div>
            )}
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scroll depth distribution */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-heading text-sm font-semibold text-foreground mb-4">Scroll Depth Distribution</h4>
              {(() => {
                const buckets = [
                  { label: "0–25%", count: views.filter(v => (v.scroll_depth || 0) <= 25).length },
                  { label: "26–50%", count: views.filter(v => (v.scroll_depth || 0) > 25 && (v.scroll_depth || 0) <= 50).length },
                  { label: "51–75%", count: views.filter(v => (v.scroll_depth || 0) > 50 && (v.scroll_depth || 0) <= 75).length },
                  { label: "76–100%", count: views.filter(v => (v.scroll_depth || 0) > 75).length },
                ];
                return (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={buckets}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                        <Bar dataKey="count" name="Views" fill="hsl(243, 76%, 59%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>

            {/* Time on page distribution */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-heading text-sm font-semibold text-foreground mb-4">Time on Page Distribution</h4>
              {(() => {
                const buckets = [
                  { label: "<30s", count: views.filter(v => (v.time_on_page || 0) < 30).length },
                  { label: "30–60s", count: views.filter(v => (v.time_on_page || 0) >= 30 && (v.time_on_page || 0) < 60).length },
                  { label: "1–3m", count: views.filter(v => (v.time_on_page || 0) >= 60 && (v.time_on_page || 0) < 180).length },
                  { label: "3–5m", count: views.filter(v => (v.time_on_page || 0) >= 180 && (v.time_on_page || 0) < 300).length },
                  { label: "5m+", count: views.filter(v => (v.time_on_page || 0) >= 300).length },
                ];
                return (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={buckets}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                        <Bar dataKey="count" name="Views" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>

            {/* New vs Returning */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-heading text-sm font-semibold text-foreground mb-4">New vs Returning</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "New", value: uniqueSessions - returningCount },
                        { name: "Returning", value: returningCount },
                      ]}
                      dataKey="value"
                      cx="50%" cy="50%"
                      innerRadius={45} outerRadius={70}
                      paddingAngle={3} stroke="none"
                    >
                      <Cell fill="hsl(243, 76%, 59%)" />
                      <Cell fill="hsl(142, 71%, 45%)" />
                    </Pie>
                    <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Conversion summary */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-heading text-sm font-semibold text-foreground mb-4">Conversion Summary</h4>
              {conversions.length > 0 ? (
                <div className="space-y-4">
                  {conversions.map(c => (
                    <div key={c.converted_to}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-foreground capitalize">{c.converted_to}</span>
                        <span className="text-sm font-heading font-bold text-foreground">{c.count} ({c.conversion_rate}%)</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(c.conversion_rate * 5, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on views that led to a newsletter signup or inquiry in the same session.
                  </p>
                </div>
              ) : (
                <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground text-center">
                  No conversions tracked yet.<br />
                  <span className="text-xs mt-1 block">Call trackConversion() after signups and form submissions.</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Recent Views Tab */}
        <TabsContent value="recent">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Time", "Content", "Type", "Device", "Browser", "Region", "Time on Page", "Scroll", "Returning"].map(h => (
                      <th key={h} className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {views.slice(0, 50).map(view => (
                    <tr key={view.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {format(new Date(view.created_at), "MMM dd, HH:mm")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground max-w-[180px] truncate">{view.title}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {contentTypeLabel[view.content_type] || view.content_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          {deviceIcons[view.device_type || ""] || <Monitor size={14} />}
                          {view.device_type || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{view.browser || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {[view.city, view.country].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatSeconds(view.time_on_page)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{view.scroll_depth != null ? `${view.scroll_depth}%` : "—"}</td>
                      <td className="px-4 py-3">
                        {view.is_returning
                          ? <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Returning</Badge>
                          : <Badge variant="secondary" className="text-[10px]">New</Badge>}
                      </td>
                    </tr>
                  ))}
                  {views.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">No views recorded yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}