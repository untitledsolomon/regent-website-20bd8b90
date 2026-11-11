"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Trash2, Download, Search, Building2, Mail, Phone,
  X, Send, Users, Clock, MoreHorizontal, ExternalLink, Loader2, Sparkles,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { downloadCsv } from "./useAnalytics";
import AddLeadDialog from "@/components/admin/AddLeadDialog";

type ConsultationStatus = "new" | "viewed" | "replied" | "closed";

interface Consultation {
  id: string;
  name: string;
  company: string;
  email: string;
  industry: string | null;
  size: string | null;
  budget: string | null;
  phone: string | null;
  message: string | null;
  status: ConsultationStatus;
  created_at: string;
  replied_at: string | null;
  ai_summary: string | null;
  ai_category: string | null;
  suggested_reply: string | null;
}

const STATUS_CONFIG: Record<ConsultationStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; classes: string }> = {
  new:     { label: "New",     variant: "default", classes: "bg-indigo-500 text-white" },
  viewed:  { label: "Viewed",  variant: "secondary", classes: "bg-amber-500 text-white" },
  replied: { label: "Replied", variant: "secondary", classes: "bg-emerald-500 text-white" },
  closed:  { label: "Closed",  variant: "outline", classes: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
};

const STATUSES = Object.keys(STATUS_CONFIG) as ConsultationStatus[];

export default function ConsultationList() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);

  // Cached so returning to this tab does not refetch on every mount.
  const query = useQuery({
    queryKey: ["admin", "consultations"],
    staleTime: 60_000,
    queryFn: async (): Promise<Consultation[]> => {
      const { data, error } = await (supabase as any)
        .from("consultation_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Consultation[]) || [];
    },
  });
  const items = query.data ?? [];
  const loading = query.isLoading;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "consultations"] });

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchSearch = !search ||
        [i.name, i.company, i.email, i.industry].some(f =>
          f?.toLowerCase().includes(search.toLowerCase())
        );
      const matchStatus = filterStatus === "all" || i.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [items, search, filterStatus]);

  // Real numbers, computed from the live rows — no placeholders.
  const stats = useMemo(() => {
    const total = items.length;
    const newCount = items.filter(i => i.status === "new").length;
    const replied = items.filter(i => i.status === "replied" || i.status === "closed").length;
    const conversionRate = total > 0 ? Math.round((replied / total) * 1000) / 10 : 0;
    return { total, newCount, replied, conversionRate };
  }, [items]);

  const handleStatusChange = async (id: string, status: ConsultationStatus) => {
    await supabase.from("consultation_requests").update({ status }).eq("id", id);
    refresh();
    toast({ title: "Status updated", description: `Inquiry marked as ${status}` });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    const { error } = await supabase.from("consultation_requests").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      refresh();
      toast({ title: "Deleted" });
    }
  };

  const handleExport = () => {
    const rows = filtered.map(i => ({
      name: i.name, company: i.company, email: i.email, phone: i.phone ?? "",
      industry: i.industry ?? "", size: i.size ?? "", budget: i.budget ?? "",
      status: i.status, message: i.message ?? "",
      created_at: format(new Date(i.created_at), "yyyy-MM-dd HH:mm"),
      replied_at: i.replied_at ? format(new Date(i.replied_at), "yyyy-MM-dd HH:mm") : "",
    }));
    if (!rows.length) {
      toast({ title: "Nothing to export", variant: "destructive" });
      return;
    }
    downloadCsv(rows, `leads-${format(new Date(), "yyyy-MM-dd")}.csv`);
    toast({ title: "Export started", description: `${rows.length} leads written to CSV.` });
  };

  const openReply = (lead: Consultation) => {
    setReplyOpen(replyOpen === lead.id ? null : lead.id);
    setReplyBody(lead.suggested_reply ?? "");
    setReplySubject(`Re: Your consultation request — Regent`);
  };

  const handleReply = async (lead: Consultation) => {
    if (!replySubject.trim() || !replyBody.trim()) {
      toast({ title: "Add a subject and message", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/reply-consultation`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            consultation_id: lead.id,
            to_email: lead.email,
            to_name: lead.name,
            subject: replySubject.trim(),
            body: replyBody.trim(),
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Send failed (${res.status})`);
      await supabase.from("consultation_requests").update({ status: "replied" }).eq("id", lead.id);
      toast({ title: "Reply sent", description: `Email sent to ${lead.email}` });
      setReplyOpen(null);
      setReplySubject("");
      setReplyBody("");
      refresh();
    } catch (err) {
      toast({ title: "Failed to send", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse">Loading leads...</div>;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">Leads & Inquiries</h1>
          <p className="text-muted-foreground text-sm">Manage and track your conversion funnel entries.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddLeadDialog />
          <Button variant="outline" className="rounded-xl bg-card" onClick={handleExport}>
            <Download size={16} className="mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Stats Cards - computed live from the inbox */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Leads</div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-[11px] text-muted-foreground mt-1">All-time submissions</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">New</div>
            <div className="text-2xl font-bold text-indigo-500">{stats.newCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting first contact</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Replied / Closed</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.replied}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Emails sent or closed</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">Replied or closed over total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-card">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search leads by name, email, or company..."
                className="pl-10 bg-muted/50 border-none h-11 rounded-xl"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                className="rounded-xl h-11 px-5"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              {STATUSES.map(s => (
                <Button
                  key={s}
                  variant={filterStatus === s ? 'default' : 'outline'}
                  className="rounded-xl h-11 px-5 capitalize"
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left border-b border-border">
                  <th className="px-6 py-4">Lead Information</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Industry</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => {
                  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.new;
                  return (
                    <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-primary font-bold text-xs">{item.name[0]}</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">{item.name}</div>
                            <div className="text-[11px] text-muted-foreground">{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn("rounded-full border-none px-2.5 py-0.5 text-[10px] font-bold uppercase", status.classes)}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.industry || "—"}</div>
                        <div className="text-[10px] text-muted-foreground">{item.company}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-foreground">{item.budget || "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl w-40">
                              {STATUSES.map(s => (
                                <DropdownMenuItem key={s} onClick={() => handleStatusChange(item.id, s)} className="capitalize">
                                  Mark as {s}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem
                                onClick={() => { setExpanded(item.id); openReply(item); }}
                              >
                                Reply via email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive focus:text-destructive">
                                Delete Lead
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl h-8 text-[11px] font-bold"
                            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                          >
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-muted-foreground" />
              </div>
              <h3 className="font-heading font-bold text-lg">No leads found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expanded Lead Detail View */}
      {expanded && (() => {
        const lead = items.find(i => i.id === expanded);
        if (!lead) return null;
        const status = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
        const isReplyOpen = replyOpen === lead.id;
        return (
          <Card className="border-none shadow-lg rounded-3xl bg-card overflow-hidden animate-in fade-in slide-in-from-top-4">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/30">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setExpanded(null)}>
                  <X size={18} />
                </Button>
                <div>
                  <CardTitle className="text-lg font-heading font-bold">{lead.name}</CardTitle>
                  <CardDescription className="text-xs">{lead.company} · {format(new Date(lead.created_at), "PPP")}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn("rounded-full border-none px-2.5 py-0.5 text-[10px] font-bold uppercase", status.classes)}>{status.label}</Badge>
                <Link href={`/admin/inquiries/${lead.id}`} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-all shrink-0">
                  <ExternalLink size={14} /> Full profile
                </Link>
                <Button className="rounded-xl h-9 bg-primary" onClick={() => openReply(lead)}>
                  <Send size={14} className="mr-1.5" /> {isReplyOpen ? "Close reply" : "Reply via Email"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Contact Details</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <Mail size={16} className="text-indigo-500" />
                        <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-3 text-sm font-medium">
                          <Phone size={16} className="text-indigo-500" />
                          {lead.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <Building2 size={16} className="text-indigo-500" />
                        {lead.company}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <Users size={16} className="text-indigo-500" />
                        Size: {lead.size || "Unknown"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Timeline</label>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock size={14} /> Received {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </div>
                    {lead.replied_at && (
                      <div className="text-sm text-emerald-600 flex items-center gap-2 mt-1">
                        <Send size={14} /> Replied {formatDistanceToNow(new Date(lead.replied_at), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Message & Intent</label>
                    <div className="bg-muted/50 rounded-2xl p-6 border border-border">
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap italic">
                        "{lead.message || "No message provided."}"
                      </p>
                    </div>
                  </div>

                  {lead.ai_summary && (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">
                        <Sparkles size={12} /> AI Summary
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{lead.ai_summary}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="p-3 bg-card rounded-xl border border-border flex-1 min-w-[120px]">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Industry</div>
                          <div className="text-sm font-bold">{lead.industry || "General"}</div>
                        </div>
                        <div className="p-3 bg-card rounded-xl border border-border flex-1 min-w-[120px]">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Budget</div>
                          <div className="text-sm font-bold">{lead.budget || "Not disclosed"}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isReplyOpen && (
                    <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Send size={14} className="text-primary" /> Reply to {lead.name}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">To</label>
                        <div className="text-sm text-muted-foreground">{lead.email}</div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Subject</label>
                        <Input value={replySubject} onChange={e => setReplySubject(e.target.value)} className="h-10 bg-background" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Message</label>
                        <textarea
                          value={replyBody}
                          onChange={e => setReplyBody(e.target.value)}
                          rows={5}
                          placeholder={lead.suggested_reply ? "Suggested reply pre-filled — edit if needed." : "Write your reply…"}
                          className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none text-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setReplyBody("")}>Clear</Button>
                        <Button size="sm" className="rounded-xl" onClick={() => handleReply(lead)} disabled={sending}>
                          {sending ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Send size={14} className="mr-1.5" />}
                          {sending ? "Sending…" : "Send"}
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">An email is sent to the lead and the status changes to Replied.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
