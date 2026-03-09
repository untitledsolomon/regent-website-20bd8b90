import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Trash2, Download, Search, Building2, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Consultation {
  id: string;
  name: string;
  company: string;
  email: string;
  industry: string | null;
  size: string | null;
  budget: string | null;
  message: string | null;
  created_at: string;
}

export default function ConsultationList() {
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("consultation_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    setDeleting(id);
    const { error } = await supabase.from("consultation_requests").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      setItems(prev => prev.filter(i => i.id !== id));
      toast({ title: "Deleted" });
    }
    setDeleting(null);
  };

  const exportCSV = () => {
    const headers = ["Name", "Company", "Email", "Industry", "Size", "Budget", "Message", "Date"];
    const rows = filtered.map(i => [
      i.name, i.company, i.email, i.industry || "", i.size || "", i.budget || "", (i.message || "").replace(/"/g, '""'), new Date(i.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = items.filter(i =>
    [i.name, i.company, i.email, i.industry].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-8 lg:p-10">
        <div className="h-10 w-64 bg-card border border-border rounded-lg animate-pulse mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <MessageSquare size={20} className="text-orange-600" />
            </div>
            Inquiries
          </h1>
          <p className="text-sm text-text-muted mt-1">{items.length} consultation request{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 h-9 px-4 bg-card border border-border text-text-secondary text-sm rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name, company, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="text-orange-400" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-text-primary mb-1">
            {search ? "No matching inquiries" : "No inquiries yet"}
          </h3>
          <p className="text-sm text-text-muted">
            {search ? "Try a different search term." : "Consultation requests from the demo form will appear here."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {filtered.map(item => (
            <div key={item.id} className="px-6 py-5 hover:bg-surface/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-sm font-semibold text-text-primary">{item.name}</span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Building2 size={12} /> {item.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted mb-2">
                    <span className="flex items-center gap-1"><Mail size={12} /> {item.email}</span>
                    {item.industry && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{item.industry}</span>
                    )}
                    {item.size && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{item.size}</span>
                    )}
                    {item.budget && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">{item.budget}</span>
                    )}
                  </div>
                  {item.message && (
                    <p className="text-sm text-text-secondary line-clamp-2">{item.message}</p>
                  )}
                  <p className="text-xs text-text-muted mt-2">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
