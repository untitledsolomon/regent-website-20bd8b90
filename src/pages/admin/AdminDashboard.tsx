import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText, BarChart3, FolderOpen, Plus, ArrowRight, Clock, TrendingUp, TrendingDown,
  PenSquare, BookOpen, FileStack, Mail, Send, MessageSquare, Activity, Eye,
} from "lucide-react";
import { formatDistanceToNow, subDays, startOfMonth, format, parseISO } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Area, AreaChart,
} from "recharts";

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

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent-mid))",
  "hsl(142, 71%, 45%)",
  "hsl(42, 87%, 55%)",
];

export default function AdminDashboard() {
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

  const typeConfig = {
    post: { label: "Blog Post", dot: "bg-primary" },
    case_study: { label: "Case Study", dot: "bg-accent-mid" },
    resource: { label: "Resource", dot: "bg-emerald-500" },
  };

  const editLink = (item: RecentItem) =>
    item.type === "post" ? `/admin/posts/${item.id}/edit`
    : item.type === "case_study" ? `/admin/case-studies/${item.id}/edit`
    : `/admin/resources/${item.id}/edit`;

  const totalContent = stats.posts.total + stats.caseStudies.total + stats.resources.total;
  const totalPublished = stats.posts.published + stats.caseStudies.published + stats.resources.published;
  const publishRate = totalContent > 0 ? Math.round((totalPublished / totalContent) * 100) : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const contentTypeLabel: Record<string, string> = {
    blog_post: "Blog Post",
    case_study: "Case Study",
    resource_download: "Download",
  };

  const kpis = [
    { label: "Total Content", value: totalContent, sub: `${totalPublished} published`, icon: FileText, trend: publishRate > 50 ? "up" : "neutral", trendValue: `${publishRate}% live`, color: "from-primary/20 to-primary/5" },
    { label: "Total Views", value: stats.totalViews, sub: "all time", icon: Eye, trend: stats.totalViews > 0 ? "up" : "neutral", trendValue: stats.topContent.length > 0 ? `${stats.topContent.length} tracked` : "no data", color: "from-accent-mid/20 to-accent-mid/5" },
    { label: "New Inquiries", value: stats.newInquiries, sub: "this week", icon: MessageSquare, trend: stats.newInquiries > 0 ? "up" : "neutral", trendValue: `${stats.inquiries} total`, color: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Subscribers", value: stats.subscribers, sub: "active", icon: Mail, trend: "up", trendValue: "growing", color: "from-amber-500/20 to-amber-500/5" },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[130px] bg-card border border-border rounded-2xl animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/50 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {[1, 2].map(i => <div key={i} className="h-[300px] bg-card border border-border rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          {greeting()} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    kpi.trend === "up" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : kpi.trend === "down" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                  }`}>
                    {kpi.trend === "up" ? <TrendingUp size={11} /> : kpi.trend === "down" ? <TrendingDown size={11} /> : null}
                    {kpi.trendValue}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-muted-foreground mt-1 font-medium">{kpi.label} · {kpi.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold text-foreground">Content Published</h3>
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-full">Last 6 months</span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.contentByMonth} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="posts" name="Posts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="caseStudies" name="Case Studies" fill="hsl(var(--accent-mid))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resources" name="Resources" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Inquiry Status</h3>
          {stats.inquiryBreakdown.length > 0 ? (
            <div className="h-[220px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.inquiryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                    {stats.inquiryBreakdown.map((_, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No inquiries yet</div>
          )}
          {stats.inquiryBreakdown.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {stats.inquiryBreakdown.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Views + Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold text-foreground">Content Views</h3>
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-full">Last 30 days</span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyViews}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="views" stroke="hsl(142, 71%, 45%)" fill="url(#viewsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Top Content</h3>
          {stats.topContent.length > 0 ? (
            <div className="space-y-1">
              {stats.topContent.slice(0, 8).map((item, i) => (
                <div key={item.content_id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted transition-colors">
                  <span className="text-xs font-mono text-muted-foreground w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
                    <div className="text-[10px] text-muted-foreground">{contentTypeLabel[item.content_type] || item.content_type}</div>
                  </div>
                  <div className="text-sm font-heading font-bold text-foreground">{item.view_count}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No views tracked yet</div>
          )}
        </div>
      </div>

      {/* Subscriber Growth + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold text-foreground">Subscriber Growth</h3>
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-full">Last 30 days</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.subscriberGrowth}>
                <defs>
                  <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#subGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus size={14} className="text-primary" /> Quick Actions
          </h3>
          <div className="space-y-1">
            {[
              { label: "New Blog Post", icon: PenSquare, link: "/admin/posts/new" },
              { label: "New Case Study", icon: BookOpen, link: "/admin/case-studies/new" },
              { label: "New Resource", icon: FileStack, link: "/admin/resources/new" },
              { label: "Send Newsletter", icon: Send, link: "/admin/newsletter/compose" },
              { label: "View Inquiries", icon: Eye, link: "/admin/inquiries" },
              { label: "View Applications", icon: FileText, link: "/admin/applications" },
            ].map(action => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.link} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.label}</span>
                  <ArrowRight size={14} className="text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Overview + Recent + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Content Overview</h3>
          <div className="space-y-2">
            {[
              { label: "Blog Posts", ...stats.posts, link: "/admin/posts", icon: FileText },
              { label: "Case Studies", ...stats.caseStudies, link: "/admin/case-studies", icon: BarChart3 },
              { label: "Resources", ...stats.resources, link: "/admin/resources", icon: FolderOpen },
            ].map(card => {
              const Icon = card.icon;
              const pct = card.total > 0 ? Math.round((card.published / card.total) * 100) : 0;
              return (
                <Link key={card.label} to={card.link} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{card.label}</div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-heading font-bold text-foreground">{card.total}</div>
                    <div className="text-[10px] text-muted-foreground">{card.published} live</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock size={14} className="text-primary" /> Recent Activity
          </h3>
          {recent.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <FileText size={20} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">No content yet</p>
              <Link to="/admin/posts/new" className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all">
                <Plus size={14} /> Create Post
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recent.map(item => {
                const config = typeConfig[item.type];
                return (
                  <Link key={`${item.type}-${item.id}`} to={editLink(item)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {config.label} · {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      item.published ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {item.published ? "Live" : "Draft"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <ActivityLogWidget />
      </div>
    </div>
  );
}

function ActivityLogWidget() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("admin_activity_log" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setLogs(data || []);
        setLoading(false);
      });
  }, []);

  const actionLabels: Record<string, string> = {
    created_post: "Created post",
    updated_post: "Updated post",
    published_post: "Published post",
    unpublished_post: "Unpublished post",
    deleted_post: "Deleted post",
    created_case_study: "Created case study",
    updated_case_study: "Updated case study",
    published_case_study: "Published case study",
    unpublished_case_study: "Unpublished case study",
    deleted_case_study: "Deleted case study",
    published_resource: "Published resource",
    unpublished_resource: "Unpublished resource",
    deleted_resource: "Deleted resource",
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-heading text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Activity size={14} className="text-primary" /> Activity Log
      </h3>
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-8 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No activity recorded yet</p>
      ) : (
        <div className="space-y-1 max-h-[320px] overflow-y-auto">
          {logs.map((log: any) => (
            <div key={log.id} className="px-2 py-2 rounded-xl hover:bg-muted transition-colors">
              <div className="text-sm text-foreground">
                <span className="font-medium">{actionLabels[log.action] || log.action}</span>
                {log.entity_title && <span className="text-muted-foreground"> · {log.entity_title}</span>}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
