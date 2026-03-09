import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import {
  Eye, Users, Globe, Monitor, Smartphone, Tablet, Clock, ExternalLink,
  TrendingUp, BarChart3,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
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
}

interface AudienceItem {
  dimension: string;
  value: string;
  count: number;
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

export default function AdminAnalytics() {
  const [views, setViews] = useState<AnalyticsView[]>([]);
  const [audience, setAudience] = useState<AudienceItem[]>([]);
  const [topContent, setTopContent] = useState<{ content_type: string; title: string; view_count: number }[]>([]);
  const [dailyViews, setDailyViews] = useState<{ date: string; views: number }[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueSessions, setUniqueSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [detailRes, audienceRes, analyticsRes, dailyRes, totalRes] = await Promise.all([
        supabase.rpc("get_analytics_detail", { p_limit: 200, p_offset: 0 }),
        supabase.rpc("get_audience_breakdown"),
        supabase.rpc("get_content_analytics"),
        supabase.rpc("get_daily_views", { days_back: 30 }),
        supabase.from("content_views").select("id", { count: "exact", head: true }),
      ]);

      const viewsData = (detailRes.data || []) as AnalyticsView[];
      setViews(viewsData);

      const audienceData = (audienceRes.data || []).map((a: any) => ({
        dimension: a.dimension,
        value: a.value,
        count: Number(a.count),
      }));
      setAudience(audienceData);

      setTopContent(
        (analyticsRes.data || []).map((item: any) => ({
          content_type: item.content_type,
          title: item.title,
          view_count: Number(item.view_count),
        }))
      );

      const daily = Array.from({ length: 30 }, (_, i) => {
        const d = subDays(new Date(), 29 - i);
        const dateStr = format(d, "yyyy-MM-dd");
        const displayDate = format(d, "MMM dd");
        const found = (dailyRes.data || []).find((v: any) => v.view_date === dateStr);
        return { date: displayDate, views: found ? Number(found.view_count) : 0 };
      });
      setDailyViews(daily);

      setTotalViews(totalRes.count || 0);

      // Unique sessions
      const sessions = new Set(viewsData.filter(v => v.session_id).map(v => v.session_id));
      setUniqueSessions(sessions.size);

      setLoading(false);
    };
    load();
  }, []);

  const getBreakdown = (dim: string) =>
    audience.filter(a => a.dimension === dim).sort((a, b) => b.count - a.count);

  const avgViewsPerDay = dailyViews.length > 0
    ? (dailyViews.reduce((s, d) => s + d.views, 0) / 30).toFixed(1)
    : "0";

  const topCountry = getBreakdown("country").filter(c => c.value !== "Unknown")[0]?.value || "—";

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-[120px] bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          Content Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Audience insights and content performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: "Total Views", value: totalViews, sub: "all time", icon: Eye },
          { label: "Unique Sessions", value: uniqueSessions, sub: "tracked", icon: Users },
          { label: "Avg Views/Day", value: avgViewsPerDay, sub: "last 30 days", icon: TrendingUp },
          { label: "Top Region", value: topCountry, sub: "by views", icon: Globe },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon size={18} className="text-primary" />
                </div>
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
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyViews}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(243, 76%, 59%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(243, 76%, 59%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="views" stroke="hsl(243, 76%, 59%)" fill="url(#analyticsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Tabs defaultValue="audience" className="mb-8">
        <TabsList>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Top Content</TabsTrigger>
          <TabsTrigger value="recent">Recent Views</TabsTrigger>
        </TabsList>

        {/* Audience Tab */}
        <TabsContent value="audience">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Device Type */}
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

            {/* Browser */}
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

            {/* OS */}
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

            {/* Top Countries */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-heading text-sm font-semibold text-foreground mb-4">Top Regions</h4>
              <div className="space-y-2">
                {getBreakdown("country").slice(0, 8).map((item, i) => (
                  <div key={item.value} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm text-foreground">{item.value}</span>
                    <span className="text-sm font-heading font-bold text-foreground">{item.count}</span>
                  </div>
                ))}
                {getBreakdown("country").length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No data yet</div>}
              </div>
            </div>

            {/* Top Referrers */}
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
                  <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted transition-colors">
                    <span className="text-xs font-mono text-muted-foreground w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
                      <Badge variant="secondary" className="text-[10px] mt-0.5">
                        {contentTypeLabel[item.content_type] || item.content_type}
                      </Badge>
                    </div>
                    <div className="text-sm font-heading font-bold text-foreground">{item.view_count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">No content views recorded yet</div>
            )}
          </div>
        </TabsContent>

        {/* Recent Views Tab */}
        <TabsContent value="recent">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Time", "Content", "Type", "Device", "Browser", "Region"].map(h => (
                      <th key={h} className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-3">{h}</th>
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
                      <td className="px-4 py-3 text-sm text-foreground max-w-[200px] truncate">{view.title}</td>
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
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {[view.city, view.country].filter(Boolean).join(", ") || "—"}
                      </td>
                    </tr>
                  ))}
                  {views.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No views recorded yet</td>
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
