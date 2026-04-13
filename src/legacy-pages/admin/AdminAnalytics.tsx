"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, subDays } from "date-fns";
import {
  Eye, Users, Globe, Monitor, Smartphone, Tablet, Clock, ExternalLink,
  TrendingUp, BarChart3, Repeat, MousePointerClick, ArrowUpRight, ArrowDownRight, Download,
  Filter, Calendar as CalendarIcon, Search, MoreHorizontal, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

const PIE_COLORS = ["#4F46E5", "#818CF8", "#C084FC", "#22C55E", "#EAB308", "#F43F5E"];

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
      (supabase as any).rpc("get_content_analytics"),
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
      const displayDate = format(d, "MMM dd");
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

  if (loading) return <div className="p-8 animate-pulse">Loading analytics...</div>;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Content Analytics</h1>
          <p className="text-muted-foreground text-sm">Deep dive into your audience and content performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted/50 p-1 rounded-xl flex mr-2">
            {DATE_RANGES.map(r => (
              <Button
                key={r.label}
                variant={daysBack === r.days ? 'secondary' : 'ghost'}
                size="sm"
                className={cn("rounded-lg text-xs h-8 px-4", daysBack === r.days && "bg-card shadow-sm")}
                onClick={() => setDaysBack(r.days)}
              >
                {r.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="rounded-xl h-10 bg-card">
            <Download size={16} className="mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Views</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <Badge variant="outline" className={cn("rounded-full border-none px-1.5 py-0 text-[10px] font-bold", viewsTrend >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
                {viewsTrend >= 0 ? '+' : ''}{viewsTrend}%
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Last {daysBack} days</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Unique Sessions</div>
            <div className="text-2xl font-bold">{uniqueSessions.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Tracked sessions</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Return Rate</div>
            <div className="text-2xl font-bold">{returningRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">{returningCount} returning users</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Avg Engagement</div>
            <div className="text-2xl font-bold">{formatSeconds(avgTimeOnPage)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">{avgScrollDepth}% average scroll</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-heading font-bold">Views & Sessions Over Time</CardTitle>
          <CardDescription className="text-xs">Daily performance metrics for the selected period</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyViews}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                interval={Math.floor(daysBack / 8)}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94A3B8' }}
              />
              <RechartsTooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="views" name="Page Views" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" dataKey="unique_sessions" name="Sessions" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="content" className="rounded-lg px-6">Top Content</TabsTrigger>
          <TabsTrigger value="audience" className="rounded-lg px-6">Audience</TabsTrigger>
          <TabsTrigger value="conversions" className="rounded-lg px-6">Conversions</TabsTrigger>
          <TabsTrigger value="realtime" className="rounded-lg px-6">Real-time Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-card">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left border-b border-border">
                    <th className="px-6 py-4">Article / Resource</th>
                    <th className="px-6 py-4">Views</th>
                    <th className="px-6 py-4">Avg. Time</th>
                    <th className="px-6 py-4">Scroll</th>
                    <th className="px-6 py-4 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topContent.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", idx % 2 === 0 ? "bg-indigo-50" : "bg-emerald-50")}>
                            <BarChart3 size={18} className={idx % 2 === 0 ? "text-indigo-600" : "text-emerald-600"} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground line-clamp-1">{item.title}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold">{contentTypeLabel[item.content_type] || item.content_type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">{item.view_count.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatSeconds(item.avg_time_on_page)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.avg_scroll_depth}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">{Math.round(item.avg_scroll_depth)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <TrendingUp size={16} className="text-emerald-500 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm rounded-3xl bg-card">
              <CardHeader pb-2>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={getBreakdown("device_type")} dataKey="count" nameKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} stroke="none">
                        {getBreakdown("device_type").map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {getBreakdown("device_type").map((item, i) => (
                    <div key={item.value} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="font-medium capitalize">{item.value}</span>
                      </div>
                      <span className="font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Regions & Browsers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Countries</h4>
                    {getBreakdown("country").slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📍</span>
                          <span className="text-sm font-bold">{item.value}</span>
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Browsers</h4>
                    {getBreakdown("browser").slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🌐</span>
                          <span className="text-sm font-bold">{item.value}</span>
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="border-none shadow-sm rounded-3xl bg-[#0F172A] text-white">
                <CardHeader>
                  <CardTitle className="text-lg font-heading font-bold">Newsletter Conversions</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Performance of the blog & footer capture</CardDescription>
                </CardHeader>
                <CardContent>
                  {conversions.filter(c => c.converted_to === 'newsletter').map(c => (
                    <div key={c.converted_to} className="space-y-6">
                       <div className="text-4xl font-bold">{c.count}</div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-400">
                             <span>Conversion Rate</span>
                             <span>{c.conversion_rate}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.conversion_rate * 5}%` }} />
                          </div>
                       </div>
                    </div>
                  ))}
                </CardContent>
             </Card>

             <Card className="border-none shadow-sm rounded-3xl bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-heading font-bold">Inquiry Conversions</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Leads generated via demo request form</CardDescription>
                </CardHeader>
                <CardContent>
                  {conversions.filter(c => c.converted_to === 'inquiry').map(c => (
                    <div key={c.converted_to} className="space-y-6">
                       <div className="text-4xl font-bold text-indigo-600">{c.count}</div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                             <span>Conversion Rate</span>
                             <span>{c.conversion_rate}%</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.conversion_rate * 5}%` }} />
                          </div>
                       </div>
                    </div>
                  ))}
                </CardContent>
             </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
