"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import {
  User, Mail, Phone, FileText, Briefcase, ChevronDown, ChevronUp,
  ExternalLink, Send, MessageSquare, Search, X, Pencil, Trash2, Check
} from "lucide-react";

interface Reply {
  id: string;
  application_id: string;
  message: string;
  created_at: string;
  author_email?: string;
}

interface Application {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  career_id: string | null;
  status: string;
  career?: { title: string; department: string; location: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  new:         { label: "New",         classes: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  reviewing:   { label: "Reviewing",   classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  interviewed: { label: "Interviewed", classes: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  offered:     { label: "Offered",     classes: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
  hired:       { label: "Hired",       classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  rejected:    { label: "Rejected",    classes: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
};

const STATUSES = Object.keys(STATUS_CONFIG);

export default function Applications() {
  const supabase = createClient();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deletingReply, setDeletingReply] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("Admin");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserEmail(data.user?.email || "Admin");
    });
    supabase
      .from("job_applications")
      .select("*, career:careers(title, department, location)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setApplications((data as any[]) || []);
        setLoading(false);
      });
  }, []);

  const kpis = useMemo(() => {
    const total = applications.length;
    const byStatus = STATUSES.reduce((acc, s) => {
      acc[s] = applications.filter(a => a.status === s).length;
      return acc;
    }, {} as Record<string, number>);
    const thisWeek = applications.filter(a =>
      new Date(a.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    return { total, byStatus, thisWeek };
  }, [applications]);

  const roles = useMemo(() => {
    const titles = applications.map(a => a.career?.title).filter(Boolean) as string[];
    return Array.from(new Set(titles));
  }, [applications]);

  const filtered = useMemo(() => {
    return applications.filter(app => {
      const matchSearch =
        !search ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.email.toLowerCase().includes(search.toLowerCase()) ||
        (app.career?.title || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || app.status === filterStatus;
      const matchRole =
        filterRole === "all" ||
        (filterRole === "general" && !app.career) ||
        app.career?.title === filterRole;
      return matchSearch && matchStatus && matchRole;
    });
  }, [applications, search, filterStatus, filterRole]);

  const loadReplies = async (applicationId: string) => {
    const { data } = await (supabase as any)
      .from("application_replies")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });
    setReplies(r => ({ ...r, [applicationId]: (data || []) as Reply[] }));
  };

  const handleExpand = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
      loadReplies(id);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingStatus(appId);
    await (supabase as any)
      .from("job_applications")
      .update({ status: newStatus })
      .eq("id", appId);
    setApplications(apps =>
      apps.map(a => a.id === appId ? { ...a, status: newStatus } : a)
    );
    setUpdatingStatus(null);
  };

  const handleSendReply = async (appId: string) => {
    const message = replyText[appId]?.trim();
    if (!message) return;
    setSendingReply(appId);
    const { data, error } = await (supabase as any)
      .from("application_replies")
      .insert({ application_id: appId, message, author_email: currentUserEmail })
      .select()
      .single();
    if (!error && data) {
      setReplies(r => ({ ...r, [appId]: [...(r[appId] || []), data as Reply] }));
      setReplyText(t => ({ ...t, [appId]: "" }));
    }
    setSendingReply(null);
  };

  const handleEditReply = async (replyId: string, appId: string) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    await (supabase as any)
      .from("application_replies")
      .update({ message: trimmed })
      .eq("id", replyId);
    setReplies(r => ({
      ...r,
      [appId]: r[appId].map(rep => rep.id === replyId ? { ...rep, message: trimmed } : rep),
    }));
    setEditingReply(null);
    setEditText("");
  };

  const handleDeleteReply = async (replyId: string, appId: string) => {
    setDeletingReply(replyId);
    await (supabase as any)
      .from("application_replies")
      .delete()
      .eq("id", replyId);
    setReplies(r => ({
      ...r,
      [appId]: r[appId].filter(rep => rep.id !== replyId),
    }));
    setDeletingReply(null);
  };

  const handleDownload = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("job-applications")
      .createSignedUrl(path, 60);
    if (error || !data) return;
    window.open(data.signedUrl, "_blank", "noopener");
  };

  if (loading) {
    return (
      <div className="p-8">
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
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">Job Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">{applications.length} total submission{applications.length !== 1 ? "s" : ""}</p>
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
          <div className="text-xs text-muted-foreground mt-1">awaiting review</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">In Progress</div>
          <div className="text-2xl font-heading font-bold text-amber-600 dark:text-amber-400">
            {(kpis.byStatus.reviewing || 0) + (kpis.byStatus.interviewed || 0) + (kpis.byStatus.offered || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">reviewing · interviewed · offered</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Hired</div>
          <div className="text-2xl font-heading font-bold text-emerald-600 dark:text-emerald-400">{kpis.byStatus.hired || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {kpis.total > 0 ? Math.round(((kpis.byStatus.hired || 0) / kpis.total) * 100) : 0}% conversion
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
            placeholder="Search by name, email, or role..."
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
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="h-10 px-3 border border-border rounded-lg text-sm bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <option value="all">All Roles</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
          <option value="general">General Application</option>
        </select>
      </div>

      {(search || filterStatus !== "all" || filterRole !== "all") && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filtered.length} of {applications.length} applications
        </p>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-border rounded-2xl bg-card">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase size={24} />
          </div>
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
            {applications.length === 0 ? "No applications yet" : "No results found"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {applications.length === 0
              ? "Applications will appear here when candidates apply."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.new;
            const appReplies = replies[app.id] || [];
            const isExpanded = expanded === app.id;

            return (
              <div key={app.id} className="border border-border rounded-xl bg-card overflow-hidden hover:border-primary/30 transition-colors">

                <button
                  onClick={() => handleExpand(app.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">{app.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{app.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {app.career ? (
                      <span className="hidden sm:inline text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        {app.career.title}
                      </span>
                    ) : (
                      <span className="hidden sm:inline text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                        General
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.classes}`}>
                      {status.label}
                    </span>
                    <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                    </span>
                    {isExpanded
                      ? <ChevronUp size={16} className="text-muted-foreground" />
                      : <ChevronDown size={16} className="text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    <div className="p-5 space-y-4 bg-muted/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-muted-foreground shrink-0" />
                          <a href={`mailto:${app.email}`} className="text-primary hover:underline">{app.email}</a>
                        </div>
                        {app.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} className="text-muted-foreground shrink-0" />
                            <span className="text-foreground">{app.phone}</span>
                          </div>
                        )}
                        {app.career && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase size={14} className="text-muted-foreground shrink-0" />
                            <span className="text-foreground">{app.career.title} · {app.career.department} · {app.career.location}</span>
                          </div>
                        )}
                        {app.resume_url && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText size={14} className="text-muted-foreground shrink-0" />
                            <button
                              onClick={() => handleDownload(app.resume_url!)}
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              Download Resume <ExternalLink size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-3 flex-wrap pt-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                        <div className="flex flex-wrap gap-2">
                          {STATUSES.map(s => {
                            const cfg = STATUS_CONFIG[s];
                            const isActive = app.status === s;
                            return (
                              <button
                                key={s}
                                disabled={updatingStatus === app.id}
                                onClick={() => handleStatusChange(app.id, s)}
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
                      </div>

                      {app.cover_letter && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Cover Letter</div>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-card border border-border rounded-lg p-4">
                            {app.cover_letter}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="border-t border-border p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Internal Notes {appReplies.length > 0 && `(${appReplies.length})`}
                        </span>
                      </div>

                      {appReplies.length > 0 && (
                        <div className="space-y-3">
                          {appReplies.map(reply => (
                            <div key={reply.id} className="flex gap-3 group">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5 text-xs font-bold">
                                {(reply.author_email || "A")[0].toUpperCase()}
                              </div>
                              <div className="flex-1 bg-muted/40 rounded-xl px-4 py-3">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-xs font-medium text-foreground">
                                    {reply.author_email || "Admin"}
                                  </span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => { setEditingReply(reply.id); setEditText(reply.message); }}
                                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReply(reply.id, app.id)}
                                      disabled={deletingReply === reply.id}
                                      className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>

                                {editingReply === reply.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editText}
                                      onChange={e => setEditText(e.target.value)}
                                      rows={2}
                                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditReply(reply.id, app.id)}
                                        className="flex items-center gap-1 text-xs px-2.5 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                      >
                                        <Check size={11} /> Save
                                      </button>
                                      <button
                                        onClick={() => { setEditingReply(null); setEditText(""); }}
                                        className="text-xs px-2.5 py-1 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-foreground leading-relaxed">{reply.message}</p>
                                )}

                                <p className="text-[11px] text-muted-foreground mt-1.5">
                                  {format(new Date(reply.created_at), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3 items-end">
                        <textarea
                          value={replyText[app.id] || ""}
                          onChange={e => setReplyText(t => ({ ...t, [app.id]: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSendReply(app.id);
                          }}
                          rows={2}
                          placeholder="Add an internal note... (⌘↵ to send)"
                          className="flex-1 border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        />
                        <button
                          onClick={() => handleSendReply(app.id)}
                          disabled={sendingReply === app.id || !replyText[app.id]?.trim()}
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