"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { logActivity } from "@/hooks/useActivityLog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Search, Trash2, Eye, EyeOff, X, MoreHorizontal,
  Pencil, Filter, Download, LayoutGrid, List as ListIcon,
  ChevronRight, Calendar, User as UserIcon, Tag, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  updated_at: string;
  publish_at: string | null;
  author: string;
  view_count?: number;
  avg_time_on_page?: number;
  avg_scroll_depth?: number;
}

export default function PostList() {
  const supabase = createClient();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const fetchData = async () => {
    const [postsRes, analyticsRes] = await Promise.all([
      supabase.from("blog_posts").select("id, title, slug, category, published, updated_at, publish_at, author").order("created_at", { ascending: false }),
      supabase.rpc("get_content_analytics")
    ]);

    const posts = (postsRes.data as any[]) || [];
    const analytics = (analyticsRes.data as any[]) || [];

    const enriched = posts.map(post => {
      const stats = analytics.find(a => a.content_id === post.id);
      return {
        ...post,
        view_count: stats?.view_count || 0,
        avg_time_on_page: stats?.avg_time_on_page || 0,
        avg_scroll_depth: stats?.avg_scroll_depth || 0
      };
    });

    setItems(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggle = async (id: string, published: boolean) => {
    await supabase.from("blog_posts").update({ published: !published }).eq("id", id);
    const item = items.find(i => i.id === id);
    if (item) await logActivity(published ? "unpublished_post" : "published_post", "blog_post", item.title, id);
    fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const item = items.find(i => i.id === id);
    await supabase.from("blog_posts").delete().eq("id", id);
    if (item) await logActivity("deleted_post", "blog_post", item.title, id);
    fetchData();
  };

  const filtered = items.filter(item => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "published" && !item.published) return false;
    if (filter === "draft" && item.published) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every(i => selected.has(i.id));
  const toggleAll = () => { allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(i => i.id))); };
  const toggleOne = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };

  const bulkAction = async (action: "publish" | "unpublish" | "delete") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === "delete" && !confirm(`Delete ${ids.length} posts?`)) return;
    if (action === "publish") await supabase.from("blog_posts").update({ published: true }).in("id", ids);
    else if (action === "unpublish") await supabase.from("blog_posts").update({ published: false }).in("id", ids);
    else await supabase.from("blog_posts").delete().in("id", ids);
    await logActivity(`bulk_${action}_posts`, "blog_post", `${ids.length} posts`);
    setSelected(new Set());
    fetchData();
  };

  const isScheduled = (item: Post) => item.published && item.publish_at && new Date(item.publish_at) > new Date();

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">Blog Posts</h1>
          <p className="text-muted-foreground text-sm">Create, edit and manage your published articles.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/posts/new">
            <Button className="rounded-xl bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" /> New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="border-none shadow-sm rounded-2xl bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="pl-10 bg-muted/50 border-none h-11 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-muted/50 p-1 rounded-xl flex">
                <Button
                  variant={filter === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn("rounded-lg text-xs h-9 px-4", filter === 'all' && "bg-card shadow-sm")}
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'published' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn("rounded-lg text-xs h-9 px-4", filter === 'published' && "bg-card shadow-sm")}
                  onClick={() => setFilter('published')}
                >
                  Published
                </Button>
                <Button
                  variant={filter === 'draft' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn("rounded-lg text-xs h-9 px-4", filter === 'draft' && "bg-card shadow-sm")}
                  onClick={() => setFilter('draft')}
                >
                  Drafts
                </Button>
              </div>

              <div className="h-10 w-px bg-border mx-1" />

              <div className="bg-muted/50 p-1 rounded-xl flex">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn("rounded-lg h-9 w-9", viewMode === 'list' && "bg-card shadow-sm")}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon size={16} />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn("rounded-lg h-9 w-9", viewMode === 'grid' && "bg-card shadow-sm")}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid size={16} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-lg shadow-primary/20"
        >
          <div className="flex items-center gap-4 text-sm font-medium">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAll}
              className="border-primary-foreground data-[state=checked]:bg-white data-[state=checked]:text-primary"
            />
            <span>{selected.size} posts selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => bulkAction('publish')} className="text-white hover:bg-white/10 text-xs">Publish</Button>
            <Button variant="ghost" size="sm" onClick={() => bulkAction('unpublish')} className="text-white hover:bg-white/10 text-xs">Draft</Button>
            <Button variant="ghost" size="sm" onClick={() => bulkAction('delete')} className="text-white hover:bg-red-500 hover:text-white text-xs">Delete</Button>
            <div className="w-px h-4 bg-white/20 mx-2" />
            <Button variant="ghost" size="icon" onClick={() => setSelected(new Set())} className="text-white hover:bg-white/10 h-8 w-8">
              <X size={16} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card border border-border rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-heading font-bold">No posts found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or create a new post.</p>
        </div>
      ) : viewMode === 'list' ? (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left border-b border-border">
                    <th className="px-6 py-4 w-12">
                      <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                    </th>
                    <th className="px-6 py-4">Article</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Performance</th>
                    <th className="px-6 py-4">Last Updated</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((item) => (
                    <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selected.has(item.id)}
                          onCheckedChange={() => toggleOne(item.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="min-w-[200px]">
                          <Link href={`/admin/posts/${item.id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                            {item.title}
                          </Link>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1">
                            <UserIcon size={10} /> {item.author}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full border-none px-2.5 py-0.5 text-[10px] font-bold uppercase",
                            item.published
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-slate-500/10 text-slate-600"
                          )}
                        >
                          {item.published ? (isScheduled(item) ? "Scheduled" : "Published") : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Tag size={12} className="text-muted-foreground" />
                          <span className="text-xs font-medium">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{item.view_count?.toLocaleString()} views</span>
                            {item.avg_time_on_page && item.avg_time_on_page > 0 && (
                              <Badge variant="outline" className={cn(
                                "rounded-full border-none px-1.5 py-0 text-[9px] font-bold uppercase",
                                item.avg_time_on_page > 60 ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-600"
                              )}>
                                {item.avg_time_on_page > 60 ? 'High' : 'Low'} Eng.
                              </Badge>
                            )}
                          </div>
                          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${Math.min((item.avg_scroll_depth || 0), 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Calendar size={12} />
                          {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/posts/${item.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <Pencil size={14} className="text-muted-foreground" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <MoreHorizontal size={14} className="text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl w-40">
                              <DropdownMenuItem onClick={() => toggle(item.id, item.published)}>
                                {item.published ? <EyeOff size={14} className="mr-2" /> : <Eye size={14} className="mr-2" />}
                                {item.published ? "Unpublish" : "Publish"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => remove(item.id)} className="text-destructive focus:text-destructive">
                                <Trash2 size={14} className="mr-2" />
                                Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Card key={item.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-card group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full border-none px-2.5 py-0.5 text-[10px] font-bold uppercase",
                      item.published ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-600"
                    )}
                  >
                    {item.published ? "Live" : "Draft"}
                  </Badge>
                  <Checkbox
                    checked={selected.has(item.id)}
                    onCheckedChange={() => toggleOne(item.id)}
                  />
                </div>
                <Link href={`/admin/posts/${item.id}`} className="block group-hover:text-primary transition-colors">
                  <h3 className="font-heading font-bold text-base mb-2 line-clamp-2">{item.title}</h3>
                </Link>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                  <div className="flex-1 text-[11px] text-muted-foreground">
                    <span className="font-bold text-foreground">{item.category}</span> · {format(new Date(item.updated_at), "MMM d")}
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/admin/posts/${item.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => remove(item.id)} className="h-8 w-8 rounded-lg hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
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
