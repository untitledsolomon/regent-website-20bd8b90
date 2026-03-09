import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText, BarChart3, FolderOpen, Plus, ArrowRight, Clock, TrendingUp,
  PenSquare, BookOpen, FileStack, Mail, Send, MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Stats {
  posts: { total: number; published: number };
  caseStudies: { total: number; published: number };
  resources: { total: number; published: number };
  subscribers: number;
  inquiries: number;
}

interface RecentItem {
  id: string;
  title: string;
  type: "post" | "case_study" | "resource";
  updated_at: string;
  published: boolean;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    posts: { total: 0, published: 0 },
    caseStudies: { total: 0, published: 0 },
    resources: { total: 0, published: 0 },
    subscribers: 0,
    inquiries: 0,
  });
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [postsRes, csRes, resRes, subsRes, inqRes] = await Promise.all([
        supabase.from("blog_posts").select("id, title, published, updated_at"),
        supabase.from("case_studies").select("id, title, published, updated_at"),
        supabase.from("resources").select("id, title, published, updated_at"),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
        supabase.from("consultation_requests").select("id", { count: "exact", head: true }),
      ]);

      const posts = postsRes.data || [];
      const cs = csRes.data || [];
      const res = resRes.data || [];

      setStats({
        posts: { total: posts.length, published: posts.filter(p => p.published).length },
        caseStudies: { total: cs.length, published: cs.filter(c => c.published).length },
        resources: { total: res.length, published: res.filter(r => r.published).length },
        subscribers: subsRes.count || 0,
        inquiries: inqRes.count || 0,
      });

      const all: RecentItem[] = [
        ...posts.map(p => ({ id: p.id, title: p.title, type: "post" as const, updated_at: p.updated_at, published: p.published })),
        ...cs.map(c => ({ id: c.id, title: c.title, type: "case_study" as const, updated_at: c.updated_at, published: c.published })),
        ...res.map(r => ({ id: r.id, title: r.title, type: "resource" as const, updated_at: r.updated_at, published: r.published })),
      ];
      all.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setRecent(all.slice(0, 8));
      setLoading(false);
    };
    load();
  }, []);

  const typeConfig = {
    post: { label: "Blog Post", color: "bg-primary/10 text-primary", dot: "bg-primary" },
    case_study: { label: "Case Study", color: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
    resource: { label: "Resource", color: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
  };

  const editLink = (item: RecentItem) =>
    item.type === "post" ? `/admin/posts/${item.id}/edit`
    : item.type === "case_study" ? `/admin/case-studies/${item.id}/edit`
    : `/admin/resources/${item.id}/edit`;

  const statCards = [
    {
      label: "Blog Posts", ...stats.posts, link: "/admin/posts", icon: FileText,
      gradient: "from-primary/10 to-accent-mid/10", iconBg: "bg-primary/15", iconColor: "text-primary",
    },
    {
      label: "Case Studies", ...stats.caseStudies, link: "/admin/case-studies", icon: BarChart3,
      gradient: "from-blue-50 to-blue-100/50", iconBg: "bg-blue-100", iconColor: "text-blue-600",
    },
    {
      label: "Resources", ...stats.resources, link: "/admin/resources", icon: FolderOpen,
      gradient: "from-emerald-50 to-emerald-100/50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600",
    },
    {
      label: "Subscribers", total: stats.subscribers, published: stats.subscribers, link: "/admin/subscribers", icon: Mail,
      gradient: "from-violet-50 to-violet-100/50", iconBg: "bg-violet-100", iconColor: "text-violet-600",
    },
    {
      label: "Inquiries", total: stats.inquiries, published: stats.inquiries, link: "/admin/inquiries", icon: MessageSquare,
      gradient: "from-orange-50 to-orange-100/50", iconBg: "bg-orange-100", iconColor: "text-orange-600",
    },
  ];

  const quickActions = [
    { label: "New Blog Post", description: "Write and publish articles", icon: PenSquare, link: "/admin/posts/new", color: "text-primary" },
    { label: "New Case Study", description: "Showcase client results", icon: BookOpen, link: "/admin/case-studies/new", color: "text-blue-600" },
    { label: "New Resource", description: "Upload docs & whitepapers", icon: FileStack, link: "/admin/resources/new", color: "text-emerald-600" },
    { label: "Send Newsletter", description: "Compose and send to subscribers", icon: Send, link: "/admin/newsletter/compose", color: "text-violet-600" },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-10">
        <div className="h-10 w-64 bg-card border border-border rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[1, 2, 3].map(i => <div key={i} className="h-36 bg-card border border-border rounded-2xl animate-pulse" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const totalContent = stats.posts.total + stats.caseStudies.total + stats.resources.total;
  const totalPublished = stats.posts.published + stats.caseStudies.published + stats.resources.published;

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-[-0.03em] text-text-primary">
          {greeting()}{user?.email ? ` 👋` : ""}
        </h1>
        <p className="text-sm text-text-muted mt-1.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          {totalContent > 0 && (
            <span className="ml-3 inline-flex items-center gap-1.5">
              <TrendingUp size={13} className="text-primary" />
              <span className="text-text-secondary">{totalPublished} of {totalContent} items published</span>
            </span>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <Icon size={20} className={card.iconColor} />
                  </div>
                  <ArrowRight size={16} className="text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 mt-1" />
                </div>
                <div className="text-3xl font-heading font-semibold text-text-primary tracking-tight">{card.total}</div>
                <div className="text-sm text-text-secondary mt-0.5 font-medium">{card.label}</div>
                {card.label !== "Subscribers" && card.label !== "Inquiries" ? (
                <div className="flex items-center gap-2.5 mt-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {card.published} live
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                    {card.total - card.published} draft
                  </span>
                </div>
                ) : (
                <div className="mt-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                    active
                  </span>
                </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="font-heading text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Plus size={16} className="text-primary" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.link}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group"
              >
                <Icon size={22} className={`${action.color} mb-3`} />
                <div className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{action.label}</div>
                <div className="text-xs text-text-muted mt-1">{action.description}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-heading text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Clock size={16} className="text-primary" />
          Recent Activity
        </h2>
        {recent.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-text-primary mb-1">No content yet</h3>
            <p className="text-sm text-text-muted mb-5">Create your first piece of content to get started.</p>
            <Link to="/admin/posts/new" className="inline-flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all">
              <Plus size={16} /> Create Post
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {recent.map((item, i) => {
              const config = typeConfig[item.type];
              return (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={editLink(item)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-surface/50 transition-colors duration-200 group"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2.5 mt-1">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                    item.published 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}>
                    {item.published ? "Live" : "Draft"}
                  </span>
                  <ArrowRight size={14} className="text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
