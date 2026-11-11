"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, Download, Trash2, Users, Search, ChevronDown, ChevronUp, ShieldCheck, Plus, X, Tag, Check,
} from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  tags: string[];
  note: string | null;
  created_at: string;
  updated_at: string;
}

export default function SubscriberList() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTag, setBulkTag] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

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
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "subscribers"] });
    setSelected(new Set());
  };

  const sources = useMemo(
    () => Array.from(new Set(subscribers.map((s) => s.source ?? "direct"))).sort(),
    [subscribers]
  );
  const allTags = useMemo(
    () => Array.from(new Set(subscribers.flatMap((s) => s.tags ?? []))).sort(),
    [subscribers]
  );

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      const matchSearch = !search.trim() || s.email.toLowerCase().includes(search.trim().toLowerCase());
      const matchSource = sourceFilter === "all" || (s.source ?? "direct") === sourceFilter;
      const matchTag = !tagFilter || (s.tags ?? []).includes(tagFilter);
      return matchSearch && matchSource && matchTag;
    });
  }, [subscribers, search, sourceFilter, tagFilter]);

  const newThisWeek = subscribers.filter(
    (s) => Date.now() - new Date(s.created_at).getTime() < 7 * 86_400_000
  ).length;

  /** PATCH one subscriber; returns true on success and toasts failures. */
  const patchSubscriber = async (id: string, patch: Record<string, unknown>): Promise<boolean> => {
    const res = await fetch(`/api/admin/subscribers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast({ title: "Update failed", description: data.error ?? "Please try again", variant: "destructive" });
      return false;
    }
    refresh();
    return true;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    const res = await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
    if (res.ok) {
      refresh();
      toast({ title: "Subscriber removed" });
    } else {
      toast({ title: "Error removing subscriber", variant: "destructive" });
    }
  };

  const bulkDelete = async () => {
    if (!selected.size || !confirm(`Remove ${selected.size} subscriber${selected.size === 1 ? "" : "s"}?`)) return;
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/subscribers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids: [...selected] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Bulk delete failed");
      toast({ title: "Subscribers removed", description: `${data.count ?? selected.size} removed.` });
      refresh();
    } catch (e) {
      toast({ title: "Bulk delete failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setBulkBusy(false);
    }
  };

  const applyBulkTag = async (tag: string) => {
    const name = tag.trim().toLowerCase();
    if (!name || name.includes(",")) {
      toast({ title: "Add one tag name", variant: "destructive" });
      return;
    }
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/subscribers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_tag", ids: [...selected], tag: name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Tagging failed");
      toast({ title: "Tag added", description: `${data.count ?? selected.size} subscribers tagged "${name}".` });
      setBulkTag("");
      refresh();
    } catch (e) {
      toast({ title: "Tagging failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setBulkBusy(false);
    }
  };

  const exportCSV = (rows: Subscriber[]) => {
    const header = "Email,Source,Tags,Subscribed Date,Last Updated\n";
    const body = rows.map(s =>
      `"${s.email}","${s.source || ""}","${(s.tags ?? []).join("; ")}","${format(new Date(s.created_at), "yyyy-MM-dd HH:mm")}","${s.updated_at ? format(new Date(s.updated_at), "yyyy-MM-dd HH:mm") : ""}"`
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const allVisibleSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));
  const toggleSelectAll = () => {
    setSelected(allVisibleSelected ? new Set() : new Set(filtered.map((s) => s.id)));
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
          onClick={() => exportCSV(filtered)}
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
            <Tag size={20} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-3xl font-heading font-semibold text-text-primary tracking-tight">{allTags.length}</div>
            <div className="text-sm text-text-secondary font-medium">Tags in use</div>
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

      {/* Search + source filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
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

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          <span className="text-xs font-medium text-text-muted mr-1">Filter by tag:</span>
          <button
            onClick={() => setTagFilter(null)}
            className={`px-2.5 h-7 rounded-full text-xs font-medium transition-all ${tagFilter === null ? "bg-primary text-primary-foreground" : "bg-card border border-border text-text-secondary hover:border-primary/30"}`}
          >
            All
          </button>
          {allTags.map(t => (
            <button
              key={t}
              onClick={() => setTagFilter(tagFilter === t ? null : t)}
              className={`px-2.5 h-7 rounded-full text-xs font-medium transition-all ${tagFilter === t ? "bg-primary text-primary-foreground" : "bg-card border border-border text-text-secondary hover:border-primary/30"}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-3 mb-4">
          <span className="text-sm font-semibold text-text-primary">{selected.size} selected</span>
          <div className="flex items-center gap-1.5">
            <input
              value={bulkTag}
              onChange={e => setBulkTag(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyBulkTag(bulkTag)}
              placeholder="tag name"
              className="h-9 w-36 px-3 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary/50"
            />
            <button
              onClick={() => applyBulkTag(bulkTag)}
              disabled={bulkBusy}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-card border border-border text-text-secondary text-xs font-semibold hover:border-primary/40 hover:text-text-primary transition-all disabled:opacity-50"
            >
              <Plus size={13} /> Add tag
            </button>
          </div>
          <button
            onClick={() => exportCSV(filtered.filter(s => selected.has(s.id)))}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-card border border-border text-text-secondary text-xs font-semibold hover:border-primary/40 hover:text-text-primary transition-all"
          >
            <Download size={13} /> Export
          </button>
          <button
            onClick={bulkDelete}
            disabled={bulkBusy}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-card border border-border text-destructive text-xs font-semibold hover:border-destructive/40 transition-all disabled:opacity-50 ml-auto"
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      )}

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
          <p className="text-sm text-text-muted">Try a different search, source or tag filter.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-border accent-primary cursor-pointer"
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left px-4 py-4 font-medium text-text-muted text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-4 font-medium text-text-muted text-xs uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-4 font-medium text-text-muted text-xs uppercase tracking-wider">Tags</th>
                <th className="text-left px-4 py-4 font-medium text-text-muted text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(sub => {
                const isOpen = expanded === sub.id;
                return (
                  <FragmentRow
                    key={sub.id}
                    sub={sub}
                    isOpen={isOpen}
                    selected={selected.has(sub.id)}
                    onToggle={() => setExpanded(isOpen ? null : sub.id)}
                    onSelect={() => toggleSelect(sub.id)}
                    onDelete={() => handleDelete(sub.id)}
                    onPatch={patchSubscriber}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

/** Inline-editable cell: shows the value; clicking switches to an input that
 *  commits on Enter/blur and cancels on Escape. */
function InlineField({ value, onCommit, type = "text" }: {
  value: string;
  onCommit: (next: string) => void;
  type?: "text";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value.trim()) onCommit(draft.trim());
  };

  if (editing) {
    return (
      <input
        value={draft}
        autoFocus
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        className="h-8 w-full min-w-[200px] rounded-lg bg-background border border-primary/60 px-2.5 text-sm text-text-primary outline-none"
      />
    );
  }
  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click to edit"
      className="font-medium text-text-primary hover:text-primary text-left transition-colors"
    >
      {value || "direct"}
    </button>
  );
}

function FragmentRow({ sub, isOpen, selected, onToggle, onSelect, onDelete, onPatch }: {
  sub: Subscriber;
  isOpen: boolean;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onPatch: (id: string, patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const { toast } = useToast();
  const tags = sub.tags ?? [];
  const [noteDraft, setNoteDraft] = useState(sub.note ?? "");
  const [tagDraft, setTagDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const addTag = async (raw: string) => {
    const t = raw.trim().toLowerCase();
    if (!t || tags.includes(t)) { setTagDraft(""); return; }
    const ok = await onPatch(sub.id, { tags: [...tags, t] });
    if (ok) setTagDraft("");
  };
  const removeTag = async (t: string) => {
    await onPatch(sub.id, { tags: tags.filter(x => x !== t) });
  };
  const saveNote = async () => {
    setSavingNote(true);
    const ok = await onPatch(sub.id, { note: noteDraft });
    if (ok) toast({ title: "Note saved" });
    setSavingNote(false);
  };

  return (
    <>
      <tr className="hover:bg-surface/50 transition-colors">
        <td className="px-4 py-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="rounded border-border accent-primary cursor-pointer"
            aria-label={`Select ${sub.email}`}
          />
        </td>
        <td className="px-4 py-4">
          <InlineField value={sub.email} onCommit={(email) => onPatch(sub.id, { email })} />
        </td>
        <td className="px-4 py-4">
          <InlineField value={sub.source ?? ""} onCommit={(source) => onPatch(sub.id, { source })} />
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {tags.length === 0 ? (
              <span className="text-text-muted text-xs">—</span>
            ) : (
              tags.slice(0, 3).map(t => (
                <span key={t} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
              ))
            )}
            {tags.length > 3 && (
              <span className="text-[11px] text-text-muted px-1 py-0.5">+{tags.length - 3}</span>
            )}
          </div>
        </td>
        <td className="px-4 py-4 text-text-muted hidden md:table-cell">{format(new Date(sub.created_at), "MMM d, yyyy")}</td>
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
          <td colSpan={6} className="px-6 py-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
              {/* Engagement & history */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">History</div>
                <div className="space-y-1.5 text-text-secondary">
                  <div><span className="text-text-muted">Subscribed:</span> {format(new Date(sub.created_at), "MMMM d, yyyy 'at' h:mm a")}</div>
                  <div><span className="text-text-muted">Last updated:</span> {sub.updated_at ? format(new Date(sub.updated_at), "MMMM d, yyyy 'at' h:mm a") : "—"}</div>
                  <div><span className="text-text-muted">Source:</span> {sub.source || "direct"}</div>
                </div>
                <p className="text-xs text-text-muted mt-3">
                  True per-email opens and clicks need a Resend webhook to record delivery events; that is not wired up yet.
                </p>
              </div>

              {/* Tags, note, edit */}
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Tags</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        {t}
                        <button onClick={() => removeTag(t)} className="hover:text-destructive" aria-label={`Remove tag ${t}`}><X size={11} /></button>
                      </span>
                    ))}
                    <input
                      value={tagDraft}
                      onChange={e => setTagDraft(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addTag(tagDraft)}
                      placeholder="+ tag"
                      className="h-7 w-24 px-2 rounded-full bg-card border border-border text-xs outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Note</div>
                  <textarea
                    value={noteDraft}
                    onChange={e => setNoteDraft(e.target.value)}
                    rows={2}
                    placeholder="Private note on this subscriber…"
                    className="w-full rounded-lg bg-card border border-border px-3 py-2 text-sm text-text-primary outline-none focus:border-primary/50 resize-y"
                  />
                  <div className="flex justify-end mt-1.5">
                    <button
                      onClick={saveNote}
                      disabled={savingNote}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      <Check size={13} /> Save note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
