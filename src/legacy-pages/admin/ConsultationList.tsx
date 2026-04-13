"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MessageSquare, Trash2, Download, Search, Building2, Mail, Phone,
  ChevronDown, ChevronUp, X, Send, Pencil, Check, User, DollarSign,
  Briefcase, Users, Clock, TrendingUp, Filter, ArrowUpRight, Plus, TrendingDown,
  MoreHorizontal
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

const STATUS_CONFIG: Record<ConsultationStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; classes: string }> = {
  new:     { label: "New",     variant: "default", classes: "bg-indigo-500 text-white" },
  viewed:  { label: "Viewed",  variant: "secondary", classes: "bg-amber-500 text-white" },
  replied: { label: "Replied", variant: "secondary", classes: "bg-emerald-500 text-white" },
  closed:  { label: "Closed",  variant: "outline", classes: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
};

const STATUSES = Object.keys(STATUS_CONFIG) as ConsultationStatus[];

export default function ConsultationList() {
  const supabase = createClient();
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("consultation_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setItems(data as Consultation[]);
        setLoading(false);
      });
  }, []);

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

  const handleStatusChange = async (id: string, status: ConsultationStatus) => {
    await supabase.from("consultation_requests").update({ status }).eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    toast({ title: "Status updated", description: `Inquiry marked as ${status}` });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    const { error } = await supabase.from("consultation_requests").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      setItems(prev => prev.filter(i => i.id !== id));
      toast({ title: "Deleted" });
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
          <Button className="rounded-xl bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-2" /> Add Lead
          </Button>
          <Button variant="outline" className="rounded-xl bg-card">
            <Download size={16} className="mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Leads</div>
            <div className="text-2xl font-bold">{items.length}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium mt-1">
              <TrendingUp size={12} /> +12.5% vs last month
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">New</div>
            <div className="text-2xl font-bold text-indigo-500">{items.filter(i => i.status === 'new').length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting first contact</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold">6.08%</div>
            <div className="flex items-center gap-1 text-[11px] text-rose-500 font-medium mt-1">
              <TrendingDown size={12} /> -2.1% from target
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardContent className="pt-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Avg. Response</div>
            <div className="text-2xl font-bold">4.2h</div>
            <p className="text-[11px] text-muted-foreground mt-1">Improved by 1.2h</p>
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
            <div className="flex gap-2">
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
                <Button className="rounded-xl h-9 bg-primary">Reply to Lead</Button>
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
                        {lead.email}
                      </div>
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
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Message & Intent</label>
                  <div className="bg-muted/50 rounded-2xl p-6 border border-border">
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap italic">
                      "{lead.message || "No message provided."}"
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Industry</div>
                      <div className="text-sm font-bold">{lead.industry || "General"}</div>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Budget</div>
                      <div className="text-sm font-bold">{lead.budget || "Not disclosed"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
