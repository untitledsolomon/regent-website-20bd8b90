import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Icons } from "@/components/Icons";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  updated_at: string;
}

export default function PostList() {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const fetchData = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, category, published, updated_at")
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggle = async (id: string, published: boolean) => {
    await supabase.from("blog_posts").update({ published: !published }).eq("id", id);
    fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    fetchData();
  };

  const filtered = items.filter(item => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "published" && !item.published) return false;
    if (filter === "draft" && item.published) return false;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary">Blog Posts</h1>
          <p className="text-sm text-text-secondary mt-1">{items.length} posts total</p>
        </div>
        <Link to="/admin/posts/new" className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-all">
          New Post <Icons.ArrowRight />
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="flex-1 h-9 border border-border rounded-lg px-3 text-sm bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
          {(["all", "published", "draft"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors capitalize ${filter === f ? "bg-primary text-primary-foreground" : "text-text-secondary hover:bg-surface"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-card border border-border rounded-lg animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">{search || filter !== "all" ? "No matching posts." : "No posts yet."}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium text-sm text-text-primary truncate">{item.title}</div>
                <div className="flex items-center gap-3 mt-1">
                  {item.category && <span className="text-xs text-text-muted font-mono">{item.category}</span>}
                  <span className="text-xs text-text-muted">
                    {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.published ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                    {item.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(item.id, item.published)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors">
                  {item.published ? "Unpublish" : "Publish"}
                </button>
                <Link to={`/admin/posts/${item.id}/edit`} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors">
                  Edit
                </Link>
                <button onClick={() => remove(item.id)} className="text-xs px-3 py-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
