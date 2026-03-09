import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Icons } from "@/components/Icons";

interface Resource {
  id: string;
  title: string;
  type: string;
  published: boolean;
  featured: boolean;
}

export default function ResourceList() {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const fetchData = async () => {
    const { data } = await supabase.from("resources").select("id, title, type, published, featured").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggle = async (id: string, published: boolean) => {
    await supabase.from("resources").update({ published: !published }).eq("id", id);
    fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    await supabase.from("resources").delete().eq("id", id);
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
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary">Resources</h1>
          <p className="text-sm text-text-secondary mt-1">{items.length} resources total</p>
        </div>
        <Link to="/admin/resources/new" className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-all">
          New Resource <Icons.ArrowRight />
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search resources..."
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
        <div className="text-center py-20 text-text-muted">{search || filter !== "all" ? "No matching resources." : "No resources yet."}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium text-sm text-text-primary truncate">{item.title}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted font-mono">{item.type}</span>
                  {item.featured && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Featured</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {item.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(item.id, item.published)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors">
                  {item.published ? "Unpublish" : "Publish"}
                </button>
                <Link to={`/admin/resources/${item.id}/edit`} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors">
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
