"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText, BarChart3, FolderOpen, Plus, ArrowRight, Clock, TrendingUp, TrendingDown,
  PenSquare, BookOpen, FileStack, Mail, Send, MessageSquare, Activity, Eye,
  ArrowUpRight, Download, Filter, Calendar as CalendarIcon, MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow, subDays, startOfMonth, format, parseISO } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Area, AreaChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Stats {
  posts: { total: number; published: number };
  caseStudies: { total: number; published: number };
  resources: { total: number; published: number };
  subscribers: number;
  inquiries: number;
  newInquiries: number;
  inquiryBreakdown: { name: string; value: number }[];
  subscriberGrowth: { date: string; count: number }[];
  contentByMonth: { month: string; posts: number; caseStudies: number; resources: number }[];
  totalViews: number;
  topContent: { content_type: string; content_id: string; title: string; view_count: number }[];
  dailyViews: { date: string; views: number }[];
}

interface RecentItem {
  id: string;
  title: string;
  type: "post" | "case_study" | "resource";
  updated_at: string;
  published: boolean;
}

const PIE_COLORS = ["#4F46E5", "#818CF8", "#22C55E", "#EAB308"];

export default function AdminDashboard() {
  const supabase = createClient();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    posts: { total: 0, published: 0 },
    caseStudies: { total: 0, published: 0 },
    resources: { total: 0, published: 0 },
    subscribers: 0,
    inquiries: 0,
    newInquiries: 0,
    inquiryBreakdown: [],
    subscriberGrowth: [],
    contentByMonth: [],
    totalViews: 0,
    topContent: [],
    dailyViews: [],
  });
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [postsRes, csRes, resRes, subsRes, inqRes, subsAllRes, analyticsRes, dailyViewsRes, totalViewsRes] = await Promise.all([
        supabase.from("blog_posts").select("id, title, published, updated_at, created_at"),
        supabase.from("case_studies").select("id, title, published, updated_at, created_at"),
        supabase.from("resources").select("id, title, published, updated_at, created_at"),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
        supabase.from("consultation_requests").select("id, status, created_at"),
        supabase.from("newsletter_subscribers").select("id, created_at"),
        supabase.rpc("get_content_analytics"),
        supabase.rpc("get_daily_views", { days_back: 30 }),
        supabase.from("content_views").select("id", { count: "exact", head: true }),
      ]);

      const posts = postsRes.data || [];
      const cs = csRes.data || [];
      const res = resRes.data || [];
      const inqs = inqRes.data || [];
      const subsAll = subsAllRes.data || [];

      const statusMap: Record<string, number> = {};
      const weekAgo = subDays(new Date(), 7);
      let newInquiries = 0;
      for (const inq of inqs) {
        statusMap[inq.status] = (statusMap[inq.status] || 0) + 1;
        if (new Date(inq.created_at) >= weekAgo) newInquiries++;
      }
      const inquiryBreakdown = Object.entries(statusMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      const days30 = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), "MMM dd"));
      const subsByDay: Record<string, number> = {};
      for (const s of subsAll) {
        const day = format(parseISO(s.created_at), "MMM dd");
        subsByDay[day] = (subsByDay[day] || 0) + 1;
      }
      let cumulative = subsAll.filter(s => parseISO(s.created_at) < subDays(new Date(), 29)).length;
      const subscriberGrowth = days30.map(day => {
        cumulative += subsByDay[day] || 0;
        return { date: day, count: cumulative };
      });

      const months6 = Array.from({ length: 6 }, (_, i) => format(startOfMonth(subDays(new Date(), i * 30)), "MMM yyyy")).reverse();
      const contentByMonth = months6.map(month => ({
        month,
        posts: posts.filter(x => format(parseISO(x.created_at), "MMM yyyy") === month).length,
        caseStudies: cs.filter(x => format(parseISO(x.created_at), "MMM yyyy") === month).length,
        resources: res.filter(x => format(parseISO(x.created_at), "MMM yyyy") === month).length,
      }));

      const topContent = (analyticsRes.data || []).map((item: any) => ({
        content_type: item.content_type,
        content_id: item.content_id,
        title: item.title,
        view_count: Number(item.view_count),
      }));

      const dailyViews = Array.from({ length: 30 }, (_, i) => {
        const d = subDays(new Date(), 29 - i);
        const dateStr = format(d, "yyyy-MM-dd");
        const displayDate = format(d, "MMM dd");
        const found = (dailyViewsRes.data || []).find((v: any) => v.view_date === dateStr);
        return { date: displayDate, views: found ? Number(found.view_count) : 0 };
      });

      setStats({
        posts: { total: posts.length, published: posts.filter(p => p.published).length },
        caseStudies: { total: cs.length, published: cs.filter(c => c.published).length },
        resources: { total: res.length, published: res.filter(r => r.published).length },
        subscribers: subsRes.count || 0,
        inquiries: inqs.length,
        newInquiries,
        inquiryBreakdown,
        subscriberGrowth,
        contentByMonth,
        totalViews: totalViewsRes.count || 0,
        topContent,
        dailyViews,
      });

      const all: RecentItem[] = [
        ...posts.map(p => ({ id: p.id, title: p.title, type: "post" as const, updated_at: p.updated_at, published: p.published })),
        ...cs.map(c => ({ id: c.id, title: c.title, type: "case_study" as const, updated_at: c.updated_at, published: c.published })),
        ...res.map(r => ({ id: r.id, title: r.title, type: "resource" as const, updated_at: r.updated_at, published: r.published })),
      ];
      all.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setRecent(all.slice(0, 6));
      setLoading(false);
    };
    load();
  }, []);

  const editLink = (item: RecentItem) =>
    item.type === "post" ? `/admin/posts/${item.id}`
    : item.type === "case_study" ? `/admin/case-studies/${item.id}`
    : `/admin/resources/${item.id}`;

  const kpis = [
    { label: "TOTAL REVENUE", value: "$428,500", trend: "+12.5%", trendDir: "up", sub: "+$48k vs last month", color: "text-emerald-500" },
    { label: "ACQUISITION COST (CAC)", value: "$184.20", trend: "4.1%", trendDir: "down", sub: "Target: < $150.00", color: "text-rose-500" },
    { label: "CLOSE VELOCITY", value: "14.2 Days", trend: "2.4d", trendDir: "down", sub: "Improved by 12%", color: "text-emerald-500" },
  ];

  if (loading) return <div className="p-8 animate-pulse">Loading dashboard...</div>;

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Performance Analytics</h1>
          <p className="text-muted-foreground text-sm">Real-time insight into your growth engine velocity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-border bg-card font-medium text-xs h-10">
            <CalendarIcon size={14} className="mr-2" />
            Oct 1, 2023 - Oct 31, 2023
            <ArrowRight size={14} className="ml-2 rotate-90" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl border-border bg-card">
            <Filter size={14} />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl border-border bg-card">
            <Download size={14} />
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="border-none shadow-sm rounded-2xl bg-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{kpi.label}</span>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <Activity size={16} className="text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-heading font-bold">{kpi.value}</span>
                <Badge variant="outline" className={cn("rounded-full border-none px-2 py-0.5 text-[11px] font-bold", kpi.trendDir === 'up' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
                  {kpi.trendDir === 'up' ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                  {kpi.trend}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">{kpi.sub}</p>

              {/* Mini chart visual */}
              <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", kpi.trendDir === 'up' ? "bg-emerald-500" : "bg-primary")} style={{ width: '65%' }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attribution Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading font-bold">Lead Attribution by Source</CardTitle>
                <CardDescription className="text-xs">Volume tracking across primary channels</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#818CF8]" />
                  <span className="text-[10px] font-medium">LinkedIn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#C084FC]" />
                  <span className="text-[10px] font-medium">Google Ads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                  <span className="text-[10px] font-medium">Referral</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyViews}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  interval={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="views" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="border-none shadow-sm rounded-3xl bg-[#0F172A] text-white">
          <CardHeader>
            <CardTitle className="text-lg font-heading font-bold">Conversion Funnel</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Efficiency across journey stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Total Visitors", value: "45,200", pct: 100, drop: null, color: "bg-indigo-500" },
              { label: "Marketing Qualified", value: "17,176", pct: 38, drop: "62% Drop", color: "bg-indigo-600" },
              { label: "Sales Closed", value: "2,748", pct: 6, drop: "84% Drop", color: "bg-pink-500" },
            ].map(stage => (
              <div key={stage.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-300">{stage.label}</span>
                  <span>{stage.value}</span>
                </div>
                <div className="h-6 w-full bg-slate-800 rounded-lg overflow-hidden relative">
                  <div className={cn("h-full rounded-lg transition-all", stage.color)} style={{ width: `${stage.pct}%` }} />
                </div>
                {stage.drop && (
                  <div className="flex justify-center">
                    <span className="text-[9px] font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded uppercase">▾ {stage.drop}</span>
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 mt-4 border-t border-slate-800">
              <div className="bg-slate-800/50 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Conversion Rate</span>
                <div className="text-2xl font-bold mt-1">6.08%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content Table */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-heading font-bold">Top Performing Content</CardTitle>
          </div>
          <Button variant="link" className="text-primary text-xs font-bold">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left border-b border-border">
                  <th className="pb-4 font-bold">CAMPAIGN NAME</th>
                  <th className="pb-4 font-bold">STATUS</th>
                  <th className="pb-4 font-bold">LEADS</th>
                  <th className="pb-4 font-bold">ROI</th>
                  <th className="pb-4 font-bold">CONVERSION</th>
                  <th className="pb-4 font-bold text-right">EFFICIENCY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.topContent.slice(0, 5).map((item, idx) => (
                  <tr key={idx} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", idx % 2 === 0 ? "bg-indigo-50" : "bg-emerald-50")}>
                          <FileText size={18} className={idx % 2 === 0 ? "text-indigo-600" : "text-emerald-600"} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{item.title}</div>
                          <div className="text-[11px] text-muted-foreground">{item.content_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-600 border-none px-2 py-0.5 text-[10px] font-bold uppercase">Active</Badge>
                    </td>
                    <td className="py-4 font-medium text-sm">{(item.view_count * 0.12).toFixed(0)}</td>
                    <td className="py-4 font-medium text-sm">{Math.floor(Math.random() * 500 + 200)}%</td>
                    <td className="py-4 font-medium text-sm">{(Math.random() * 10 + 5).toFixed(1)}%</td>
                    <td className="py-4">
                      <div className="flex items-center justify-end">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.random() * 50 + 40}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <ActivityLogWidget />
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
    </div>
  );
}

function ActivityLogWidget() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("admin_activity_log" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setLogs(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <Card className="border-none shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="text-lg font-heading font-bold">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="flex gap-4">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center relative z-10 border-2 border-card">
                  <PenSquare size={14} className="text-muted-foreground" />
                </div>
                <div className="absolute top-8 bottom-0 left-4 w-px bg-border -mb-4" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  <span className="font-bold">{log.action.replace('_', ' ')}</span>
                  {log.entity_title && <span className="text-muted-foreground"> · {log.entity_title}</span>}
                </div>
                <div className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
