"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Icons } from "@/components/Icons";
import { formatDistanceToNow } from "date-fns";

interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  published: boolean;
  updated_at: string;
}

export default function CareerList() {
  const supabase = createClient();
  const [items, setItems] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const fetchData = async () => {
    const { data } = await supabase
      .from("careers")
      .select("id, title, department, location, type, published, updated_at")
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggle = async (id: string, published: boolean) => {
    await supabase.from("careers").update({ published: !published }).eq("id", id);
    fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this position?")) return;
    await supabase.from("careers").delete().eq("id", id);
    fetchData();
  };

  const filtered = items.filter(item => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.department.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "published" && !item.published) return false;
    if (filter === "draft" && item.published) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-text-primary">Careers</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">{items.length} positions total</p>
        </div>
        <Link href="/admin/careers/new" className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all w-full sm:w-auto">
          New Position <Icons.ArrowRight />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search positions..."
          className="flex-1 h-9 border border-border rounded-lg px-3 text-sm bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 self-start sm:self-auto">
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
        <div className="text-center py-20 text-text-muted">{search || filter !== "all" ? "No matching positions." : "No positions yet."}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-lg px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <div className="font-medium text-sm text-text-primary truncate">{item.title}</div>
                <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-text-muted font-mono">{item.department}</span>
                  <span className="text-xs text-text-muted hidden sm:inline">{item.location}</span>
                  <span className="text-xs text-text-muted hidden sm:inline">{item.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.published ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                    {item.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(item.id, item.published)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors">
                  {item.published ? "Unpublish" : "Publish"}
                </button>
                <Link href={`/admin/careers/${item.id}/edit`} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors">
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
