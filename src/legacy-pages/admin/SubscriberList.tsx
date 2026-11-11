"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Mail, Download, Trash2, Users, Search, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
}

export default function SubscriberList() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin", "subscribers"],
    staleTime: 60_000,
    queryFn: async (): Promise<Subscriber[]> => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Subscriber[];
    },
  });
  useEffect(() => {
    if (query.isError) toast({ title: "Error loading subscribers", variant: "destructive" });
  }, [query.isError, toast]);
  const subscribers = query.data ?? [];
  const loading = query.isLoading;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "subscribers"] });

  const sources = useMemo(
    () => Array.from(new Set(subscribers.map((s) => s.source ?? "direct"))).sort(),
    [subscribers]
  );

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      const matchSearch = !search.trim() || s.email.toLowerCase().includes(search.trim().toLowerCase());
      const matchSource = sourceFilter === "all" || (s.source ?? "direct") === sourceFilter;
      return matchSearch && matchSource;
    });
  }, [subscribers, search, sourceFilter]);

  const newThisWeek = subscribers.filter(
    (s) => Date.now() - new Date(s.created_at).getTime() < 7 * 86_400_000
  ).length;

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) {
      toast({ title: "Error removing subscriber", variant: "destructive" });
    } else {
      refresh();
      toast({ title: "Subscriber removed" });
    }
  };

  const exportCSV = () => {
    const header = "Email,Source,Subscribed Date\n";
    const rows = filtered.map(s =>
      `"${s.email}","${s.source || ""}","${format(new Date(s.created_at), "yyyy-MM-dd HH:mm")}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-10">
        <div className="h-10 w-48 bg-card border border-border rounded-lg animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-card border border-border rounded-xl animate-pulse" />)}
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
            <Mail size={24} className="text-primary" />
            Subscribers
          </h1>
          <p className="text-sm text-text-muted mt-1">Manage your newsletter audience</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 h-10 px-5 bg-card border border-border text-text-secondary rounded-lg text-sm font-medium hover:border-primary/30 hover:text-text-primary transition-all disabled:opacity-50"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Users size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-3xl font-heading font-semibold text-text-primary tracking-tight">{subscribers.length}</div>
            <div className="text-sm text-text-secondary font-medium">Total subscribers</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Users size={20} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-3xl font-heading font-semibold text-text-primary tracking-tight">{newThisWeek}</div>
            <div className="text-sm text-text-secondary font-medium">New this week</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-3xl font-heading font-semibold text-text-primary tracking-tight">{sources.length}</div>
            <div className="text-sm text-text-secondary font-medium">Signup sources</div>
          </div>
        </div>
      </div>

      {/* Dedupe note */}
      <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 mb-8">
        <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-sm text-emerald-800 dark:text-emerald-300">
          <span className="font-semibold">No duplicate emails.</span> Subscriber addresses are deduplicated —
          the same email used on another device or page updates the existing entry instead of creating a new row.
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-card border border-border text-sm text-text-primary outline-none focus:border-primary/50 focus:ring-[3px] focus:ring-accent-light transition-all"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          className="h-11 px-3 rounded-xl bg-card border border-border text-sm text-text-secondary outline-none focus:border-primary/50 cursor-pointer"
        >
          <option value="all">All sources</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {subscribers.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-primary" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-text-primary mb-1">No subscribers yet</h3>
          <p className="text-sm text-text-muted">Subscribers will appear here when people sign up via the site.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <h3 className="font-heading text-lg font-semibold text-text-primary mb-1">No matches</h3>
          <p className="text-sm text-text-muted">Try a different search or source filter.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 font-medium text-text-muted text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 font-medium text-text-muted text-xs uppercase tracking-wider">Source</th>
                <th className="text-left px-6 py-4 font-medium text-text-muted text-xs uppercase tracking-wider">Date</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(sub => {
                const isOpen = expanded === sub.id;
                return (
                  <FragmentRow key={sub.id} sub={sub} isOpen={isOpen} onToggle={() => setExpanded(isOpen ? null : sub.id)} onDelete={() => handleDelete(sub.id)} />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FragmentRow({ sub, isOpen, onToggle, onDelete }: {
  sub: Subscriber;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <tr className="hover:bg-surface/50 transition-colors">
        <td className="px-6 py-4">
          <button onClick={onToggle} className="text-text-primary font-medium hover:text-primary transition-colors text-left">
            {sub.email}
          </button>
        </td>
        <td className="px-6 py-4">
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {sub.source || "direct"}
          </span>
        </td>
        <td className="px-6 py-4 text-text-muted">{format(new Date(sub.created_at), "MMM d, yyyy")}</td>
        <td className="px-4 py-4">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-text-muted hover:bg-surface hover:text-text-primary transition-all"
              aria-label={isOpen ? "Hide details" : "Show details"}
            >
              {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-text-muted hover:bg-destructive/10 hover:text-destructive transition-all"
              aria-label="Remove subscriber"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-surface/40">
          <td colSpan={4} className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Email</div>
                <a href={`mailto:${sub.email}`} className="text-primary hover:underline">{sub.email}</a>
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Source</div>
                <span className="text-text-secondary">{sub.source || "direct"}</span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Subscribed</div>
                <span className="text-text-secondary">{format(new Date(sub.created_at), "MMMM d, yyyy 'at' h:mm a")}</span>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3">
              This address is unique in the list. Re-subscribing on another page or device updates this entry; it does not create a duplicate.
            </p>
          </td>
        </tr>
      )}
    </>
  );
}
