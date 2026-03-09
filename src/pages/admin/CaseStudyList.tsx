import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Icons } from "@/components/Icons";
import { format } from "date-fns";
import { logActivity } from "@/hooks/useActivityLog";
import { Checkbox } from "@/components/ui/checkbox";

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  industry: string;
  published: boolean;
  publish_at: string | null;
}

export default function CaseStudyList() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    const { data } = await supabase.from("case_studies").select("id, slug, title, industry, published, publish_at").order("created_at", { ascending: false });
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggle = async (id: string, published: boolean) => {
    await supabase.from("case_studies").update({ published: !published }).eq("id", id);
    const item = items.find(i => i.id === id);
    if (item) await logActivity(published ? "unpublished_case_study" : "published_case_study", "case_study", item.title, id);
    fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this case study?")) return;
    const item = items.find(i => i.id === id);
    await supabase.from("case_studies").delete().eq("id", id);
    if (item) await logActivity("deleted_case_study", "case_study", item.title, id);
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
    if (action === "delete" && !confirm(`Delete ${ids.length} case studies?`)) return;
    if (action === "publish") await supabase.from("case_studies").update({ published: true }).in("id", ids);
    else if (action === "unpublish") await supabase.from("case_studies").update({ published: false }).in("id", ids);
    else await supabase.from("case_studies").delete().in("id", ids);
    await logActivity(`bulk_${action}_case_studies`, "case_study", `${ids.length} case studies`);
    setSelected(new Set());
    fetchData();
  };

  const isScheduled = (item: CaseStudy) => item.published && item.publish_at && new Date(item.publish_at) > new Date();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-text-primary">Case Studies</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">{items.length} case studies total</p>
        </div>
        <Link to="/admin/case-studies/new" className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all w-full sm:w-auto">
          New Case Study <Icons.ArrowRight />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search case studies..." className="flex-1 h-9 border border-border rounded-lg px-3 text-sm bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 self-start sm:self-auto">
          {(["all", "published", "draft"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-md transition-colors capitalize ${filter === f ? "bg-primary text-primary-foreground" : "text-text-secondary hover:bg-surface"}`}>{f}</button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="bg-card border border-primary/20 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-4 shadow-sm">
          <span className="text-sm font-medium text-text-primary">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={() => bulkAction("publish")} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">Publish</button>
            <button onClick={() => bulkAction("unpublish")} className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors">Unpublish</button>
            <button onClick={() => bulkAction("delete")} className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors">Delete</button>
            <button onClick={() => setSelected(new Set())} className="text-xs px-3 py-1.5 text-text-muted hover:text-text-primary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-card border border-border rounded-lg animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">{search || filter !== "all" ? "No matching case studies." : "No case studies yet."}</div>
      ) : (
        <div className="space-y-2">
          <div className="px-4 py-2 flex items-center gap-3">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            <span className="text-xs text-text-muted">Select all</span>
          </div>
          {filtered.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-lg px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleOne(item.id)} />
                <div className="min-w-0">
                  <div className="font-medium text-sm text-text-primary truncate">{item.title}</div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-text-muted font-mono">{item.industry}</span>
                    {isScheduled(item) ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        Scheduled {format(new Date(item.publish_at!), "MMM d")}
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {item.published ? "Published" : "Draft"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(item.id, item.published)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors">{item.published ? "Unpublish" : "Publish"}</button>
                <Link to={`/admin/case-studies/${item.id}/edit`} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors">Edit</Link>
                <button onClick={() => remove(item.id)} className="text-xs px-3 py-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
