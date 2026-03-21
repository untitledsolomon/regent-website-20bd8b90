"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { logActivity } from "@/hooks/useActivityLog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Trash2, Eye, EyeOff, X } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  updated_at: string;
  publish_at: string | null;
}

export default function PostList() {
  const supabase = createClient();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    const { data } = await supabase.from("blog_posts").select("id, title, slug, category, published, updated_at, publish_at").order("created_at", { ascending: false });
    setItems((data as any) || []);
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

  const StatusBadge = ({ item }: { item: Post }) => {
    if (isScheduled(item)) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Scheduled {format(new Date(item.publish_at!), "MMM d")}
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
        item.published
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${item.published ? "bg-emerald-500" : "bg-amber-500"}`} />
        {item.published ? "Published" : "Draft"}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-foreground">Blog Posts</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{items.length} posts total</p>
        </div>
        <Link href="/admin/posts/new" className="h-10 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all w-full sm:w-auto shadow-sm shadow-primary/20">
          <Plus size={16} /> New Post
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full h-10 border border-input rounded-xl pl-10 pr-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-1 border border-input rounded-xl p-1 self-start sm:self-auto bg-background">
          {(["all", "published", "draft"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${filter === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl px-5 py-3 mb-4 flex items-center justify-between gap-4 shadow-lg shadow-primary/5">
          <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={() => bulkAction("publish")} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"><Eye size={12} /> Publish</button>
            <button onClick={() => bulkAction("unpublish")} className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"><EyeOff size={12} /> Unpublish</button>
            <button onClick={() => bulkAction("delete")} className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-1.5"><Trash2 size={12} /> Delete</button>
            <button onClick={() => setSelected(new Set())} className="text-xs px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors"><X size={14} /></button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">{search || filter !== "all" ? "No matching posts." : "No posts yet."}</div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3 border-b border-border bg-muted/30">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Title</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-24">Status</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28">Updated</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-36 text-right">Actions</span>
          </div>
          {filtered.map((item, idx) => (
            <div key={item.id} className={`grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto_auto] gap-3 sm:gap-4 items-center px-5 py-3 hover:bg-muted/30 transition-colors ${idx < filtered.length - 1 ? "border-b border-border" : ""}`}>
              <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleOne(item.id)} />
              <div className="min-w-0">
                <div className="font-medium text-sm text-foreground truncate">{item.title}</div>
                {item.category && <span className="text-[11px] text-muted-foreground font-mono">{item.category}</span>}
              </div>
              <div className="w-24"><StatusBadge item={item} /></div>
              <span className="text-[11px] text-muted-foreground w-28 hidden sm:block">
                {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
              </span>
              <div className="flex items-center gap-1.5 w-36 justify-end">
                <button onClick={() => toggle(item.id, item.published)} className="text-[11px] px-2.5 py-1.5 rounded-lg border border-input hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  {item.published ? "Unpublish" : "Publish"}
                </button>
                <Link href={`/admin/posts/${item.id}/edit`} prefetch={false} className="text-[11px] px-2.5 py-1.5 rounded-lg border border-input hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  Edit
                </Link>
                <button onClick={() => remove(item.id)} className="text-[11px] px-2 py-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
