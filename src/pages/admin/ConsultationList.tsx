import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare, Trash2, Download, Search, Building2, Mail, Phone,
  ChevronDown, ChevronUp, X, Send, Pencil, Check, User, DollarSign,
  Briefcase, Users, Clock, TrendingUp, Filter
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "@/hooks/use-toast";

type ConsultationStatus = "new" | "viewed" | "replied" | "closed";

interface Consultation {
  id: string;
  name: string;
  company: string;
  email: string;
  industry: string | null;
  size: string | null;
  budget: string | null;
  message: string | null;
  status: ConsultationStatus;
  created_at: string;
}

interface Note {
  id: string;
  inquiry_id: string;
  message: string;
  author_email: string;
  created_at: string;
}

const STATUS_CONFIG: Record<ConsultationStatus, { label: string; classes: string }> = {
  new:     { label: "New",     classes: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  viewed:  { label: "Viewed",  classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  replied: { label: "Replied", classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  closed:  { label: "Closed",  classes: "bg-muted text-muted-foreground border-border" },
};

const STATUSES = Object.keys(STATUS_CONFIG) as ConsultationStatus[];

export default function ConsultationList() {
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Notes state
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [noteText, setNoteText] = useState<Record<string, string>>({});
  const [sendingNote, setSendingNote] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deletingNote, setDeletingNote] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("Admin");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserEmail(data.user?.email || "Admin");
    });
    supabase
      .from("consultation_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setItems(data as Consultation[]);
        setLoading(false);
      });
  }, []);

  // KPIs
  const kpis = useMemo(() => {
    const total = items.length;
    const byStatus = STATUSES.reduce((acc, s) => {
      acc[s] = items.filter(i => i.status === s).length;
      return acc;
    }, {} as Record<string, number>);
    const thisWeek = items.filter(i =>
      new Date(i.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const withBudget = items.filter(i => i.budget).length;
    return { total, byStatus, thisWeek, withBudget };
  }, [items]);

  const industries = useMemo(() => {
    const vals = items.map(i => i.industry).filter(Boolean) as string[];
    return Array.from(new Set(vals));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchSearch = !search ||
        [i.name, i.company, i.email, i.industry].some(f =>
          f?.toLowerCase().includes(search.toLowerCase())
        );
      const matchStatus = filterStatus === "all" || i.status === filterStatus;
      const matchIndustry = filterIndustry === "all" || i.industry === filterIndustry;
      return matchSearch && matchStatus && matchIndustry;
    });
  }, [items, search, filterStatus, filterIndustry]);

  const loadNotes = async (inquiryId: string) => {
    const { data } = await (supabase as any)
      .from("inquiry_notes")
      .select("*")
      .eq("inquiry_id", inquiryId)
      .order("created_at", { ascending: true });
    setNotes(n => ({ ...n, [inquiryId]: (data || []) as Note[] }));
  };

  const handleExpand = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    loadNotes(id);
    // Mark as viewed
    const item = items.find(i => i.id === id);
    if (item?.status === "new") {
      await supabase.from("consultation_requests").update({ status: "viewed" }).eq("id", id);
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: "viewed" } : i));
    }
  };

  const handleStatusChange = async (id: string, status: ConsultationStatus) => {
    setUpdatingStatus(id);
    await supabase.from("consultation_requests").update({ status }).eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    setUpdatingStatus(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
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

  const handleSendNote = async (inquiryId: string) => {
    const message = noteText[inquiryId]?.trim();
    if (!message) return;
    setSendingNote(inquiryId);
    const { data, error } = await (supabase as any)
      .from("inquiry_notes")
      .insert({ inquiry_id: inquiryId, message, author_email: currentUserEmail })
      .select()
      .single();
    if (!error && data) {
      setNotes(n => ({ ...n, [inquiryId]: [...(n[inquiryId] || []), data as Note] }));
      setNoteText(t => ({ ...t, [inquiryId]: "" }));
    }
    setSendingNote(null);
  };

  const handleEditNote = async (noteId: string, inquiryId: string) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    await (supabase as any).from("inquiry_notes").update({ message: trimmed }).eq("id", noteId);
    setNotes(n => ({
      ...n,
      [inquiryId]: n[inquiryId].map(note => note.id === noteId ? { ...note, message: trimmed } : note),
    }));
    setEditingNote(null);
    setEditText("");
  };

  const handleDeleteNote = async (noteId: string, inquiryId: string) => {
    setDeletingNote(noteId);
    await (supabase as any).from("inquiry_notes").delete().eq("id", noteId);
    setNotes(n => ({ ...n, [inquiryId]: n[inquiryId].filter(note => note.id !== noteId) }));
    setDeletingNote(null);
  };

  const exportCSV = () => {
    const headers = ["Name", "Company", "Email", "Industry", "Size", "Budget", "Message", "Status", "Date"];
    const rows = filtered.map(i => [
      i.name, i.company, i.email, i.industry || "", i.size || "",
      i.budget || "", (i.message || "").replace(/"/g, '""'),
      i.status, format(new Date(i.created_at), "yyyy-MM-dd"),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} consultation request{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 h-9 px-4 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-50"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Total</div>
          <div className="text-2xl font-heading font-bold text-foreground">{kpis.total}</div>
          <div className="text-xs text-muted-foreground mt-1">{kpis.thisWeek} this week</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">New</div>
          <div className="text-2xl font-heading font-bold text-blue-600 dark:text-blue-400">{kpis.byStatus.new || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">awaiting response</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Replied</div>
          <div className="text-2xl font-heading font-bold text-emerald-600 dark:text-emerald-400">{kpis.byStatus.replied || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {kpis.total > 0 ? Math.round(((kpis.byStatus.replied || 0) / kpis.total) * 100) : 0}% response rate
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">With Budget</div>
          <div className="text-2xl font-heading font-bold text-amber-600 dark:text-amber-400">{kpis.withBudget}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {kpis.total > 0 ? Math.round((kpis.withBudget / kpis.total) * 100) : 0}% of total
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, company, email..."
            className="w-full h-10 pl-9 pr-9 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-10 px-3 border border-border rounded-lg text-sm bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
        <select
          value={filterIndustry}
          onChange={e => setFilterIndustry(e.target.value)}
          className="h-10 px-3 border border-border rounded-lg text-sm bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <option value="all">All Industries</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {(search || filterStatus !== "all" || filterIndustry !== "all") && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filtered.length} of {items.length} inquiries
        </p>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-border rounded-2xl bg-card">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <MessageSquare size={24} />
          </div>
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
            {items.length === 0 ? "No inquiries yet" : "No results found"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {items.length === 0
              ? "Consultation requests from your demo form will appear here."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const status = STATUS_CONFIG[item.status];
            const isExpanded = expanded === item.id;
            const itemNotes = notes[item.id] || [];

            return (
              <div key={item.id} className="border border-border rounded-xl bg-card overflow-hidden hover:border-primary/30 transition-colors">

                {/* Summary row */}
                <button
                  onClick={() => handleExpand(item.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 text-sm font-bold">
                      {item.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Building2 size={12} />
                        <span className="truncate">{item.company}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {item.industry && (
                      <span className="hidden sm:inline text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        {item.industry}
                      </span>
                    )}
                    {item.budget && (
                      <span className="hidden md:inline text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                        {item.budget}
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.classes}`}>
                      {status.label}
                    </span>
                    <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                    {isExpanded
                      ? <ChevronUp size={16} className="text-muted-foreground" />
                      : <ChevronDown size={16} className="text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-border">

                    {/* Details */}
                    <div className="p-5 space-y-4 bg-muted/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-muted-foreground shrink-0" />
                          <a href={`mailto:${item.email}`} className="text-primary hover:underline">{item.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 size={14} className="text-muted-foreground shrink-0" />
                          <span className="text-foreground">{item.company}</span>
                        </div>
                        {item.industry && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase size={14} className="text-muted-foreground shrink-0" />
                            <span className="text-foreground">{item.industry}</span>
                          </div>
                        )}
                        {item.size && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users size={14} className="text-muted-foreground shrink-0" />
                            <span className="text-foreground">{item.size} employees</span>
                          </div>
                        )}
                        {item.budget && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign size={14} className="text-muted-foreground shrink-0" />
                            <span className="text-foreground">{item.budget}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={14} className="text-muted-foreground shrink-0" />
                          <span className="text-foreground">{format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                      </div>

                      {/* Message */}
                      {item.message && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Message</div>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-card border border-border rounded-lg p-4">
                            {item.message}
                          </p>
                        </div>
                      )}

                      {/* Status + Actions */}
                      <div className="flex items-center gap-3 flex-wrap pt-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                        <div className="flex flex-wrap gap-2">
                          {STATUSES.map(s => {
                            const cfg = STATUS_CONFIG[s];
                            const isActive = item.status === s;
                            return (
                              <button
                                key={s}
                                disabled={updatingStatus === item.id}
                                onClick={() => handleStatusChange(item.id, s)}
                                className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                                  isActive
                                    ? cfg.classes + " ring-2 ring-offset-1 ring-current"
                                    : "bg-muted text-muted-foreground border-border hover:border-border-strong"
                                }`}
                              >
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <a
                            href={`mailto:${item.email}?subject=Re: Your inquiry at Regent&body=Hi ${item.name.split(" ")[0]},%0A%0AThank you for reaching out.%0A%0A`}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Mail size={12} /> Reply via Email
                          </a>
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            disabled={deleting === item.id}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notes thread */}
                    <div className="border-t border-border p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Internal Notes {itemNotes.length > 0 && `(${itemNotes.length})`}
                        </span>
                      </div>

                      {itemNotes.length > 0 && (
                        <div className="space-y-3">
                          {itemNotes.map(note => (
                            <div key={note.id} className="flex gap-3 group">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5 text-xs font-bold">
                                {(note.author_email || "A")[0].toUpperCase()}
                              </div>
                              <div className="flex-1 bg-muted/40 rounded-xl px-4 py-3">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-xs font-medium text-foreground">
                                    {note.author_email || "Admin"}
                                  </span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => { setEditingNote(note.id); setEditText(note.message); }}
                                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNote(note.id, item.id)}
                                      disabled={deletingNote === note.id}
                                      className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                {editingNote === note.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editText}
                                      onChange={e => setEditText(e.target.value)}
                                      rows={2}
                                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditNote(note.id, item.id)}
                                        className="flex items-center gap-1 text-xs px-2.5 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                      >
                                        <Check size={11} /> Save
                                      </button>
                                      <button
                                        onClick={() => { setEditingNote(null); setEditText(""); }}
                                        className="text-xs px-2.5 py-1 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-foreground leading-relaxed">{note.message}</p>
                                )}
                                <p className="text-[11px] text-muted-foreground mt-1.5">
                                  {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3 items-end">
                        <textarea
                          value={noteText[item.id] || ""}
                          onChange={e => setNoteText(t => ({ ...t, [item.id]: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSendNote(item.id);
                          }}
                          rows={2}
                          placeholder="Add an internal note... (⌘↵ to send)"
                          className="flex-1 border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        />
                        <button
                          onClick={() => handleSendNote(item.id)}
                          disabled={sendingNote === item.id || !noteText[item.id]?.trim()}
                          className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-40 shrink-0"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}