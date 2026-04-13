"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { logActivity } from "@/hooks/useActivityLog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Search, Trash2, Eye, EyeOff, X, MoreHorizontal,
  Pencil, Filter, Download, LayoutGrid, List as ListIcon,
  ChevronRight, Calendar, Tag, Briefcase, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  industry: string;
  published: boolean;
  publish_at: string | null;
  updated_at: string;
}

export default function CaseStudyList() {
  const supabase = createClient();
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const fetchData = async () => {
    const { data } = await supabase.from("case_studies").select("id, slug, title, industry, published, publish_at, updated_at").order("created_at", { ascending: false });
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
    <div className="p-4 sm:p-8 space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">Case Studies</h1>
          <p className="text-muted-foreground text-sm">Manage and showcase your client success stories.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/case-studies/new">
            <Button className="rounded-xl bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" /> New Case Study
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="border-none shadow-sm rounded-2xl bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search case studies..."
                className="pl-10 bg-muted/50 border-none h-11 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-muted/50 p-1 rounded-xl flex">
                {(["all", "published", "draft"] as const).map(f => (
                  <Button
                    key={f}
                    variant={filter === f ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn("rounded-lg text-xs h-9 px-4 capitalize", filter === f && "bg-card shadow-sm")}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </Button>
                ))}
              </div>

              <div className="h-10 w-px bg-border mx-1" />

              <div className="bg-muted/50 p-1 rounded-xl flex">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn("rounded-lg h-9 w-9", viewMode === 'list' && "bg-card shadow-sm")}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon size={16} />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn("rounded-lg h-9 w-9", viewMode === 'grid' && "bg-card shadow-sm")}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid size={16} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-200"
        >
          <div className="flex items-center gap-4 text-sm font-medium">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAll}
              className="border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-600"
            />
            <span>{selected.size} items selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => bulkAction('publish')} className="text-white hover:bg-white/10 text-xs font-bold">Publish</Button>
            <Button variant="ghost" size="sm" onClick={() => bulkAction('unpublish')} className="text-white hover:bg-white/10 text-xs font-bold">Draft</Button>
            <Button variant="ghost" size="sm" onClick={() => bulkAction('delete')} className="text-white hover:bg-red-500 hover:text-white text-xs font-bold">Delete</Button>
            <div className="w-px h-4 bg-white/20 mx-2" />
            <Button variant="ghost" size="icon" onClick={() => setSelected(new Set())} className="text-white hover:bg-white/10 h-8 w-8">
              <X size={16} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card border border-border rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-heading font-bold">No case studies found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or create a new case study.</p>
        </div>
      ) : viewMode === 'list' ? (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left border-b border-border">
                    <th className="px-6 py-4 w-12">
                      <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                    </th>
                    <th className="px-6 py-4">Case Study</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Industry</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((item) => (
                    <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selected.has(item.id)}
                          onCheckedChange={() => toggleOne(item.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="min-w-[240px]">
                          <Link href={`/admin/case-studies/${item.id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                            {item.title}
                          </Link>
                          <div className="text-[10px] text-muted-foreground mt-1">/{item.slug}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full border-none px-2.5 py-0.5 text-[10px] font-bold uppercase",
                            item.published
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-slate-500/10 text-slate-600"
                          )}
                        >
                          {item.published ? (isScheduled(item) ? "Scheduled" : "Published") : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={12} className="text-muted-foreground" />
                          <span className="text-xs font-medium">{item.industry}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/case-studies/${item.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <Pencil size={14} className="text-muted-foreground" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <MoreHorizontal size={14} className="text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl w-40">
                              <DropdownMenuItem onClick={() => toggle(item.id, item.published)}>
                                {item.published ? <EyeOff size={14} className="mr-2" /> : <Eye size={14} className="mr-2" />}
                                {item.published ? "Unpublish" : "Publish"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => remove(item.id)} className="text-destructive focus:text-destructive">
                                <Trash2 size={14} className="mr-2" />
                                Delete Study
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Card key={item.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-card group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full border-none px-2.5 py-0.5 text-[10px] font-bold uppercase",
                      item.published ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-600"
                    )}
                  >
                    {item.published ? "Live" : "Draft"}
                  </Badge>
                  <Checkbox
                    checked={selected.has(item.id)}
                    onCheckedChange={() => toggleOne(item.id)}
                  />
                </div>
                <Link href={`/admin/case-studies/${item.id}`} className="block group-hover:text-primary transition-colors">
                  <h3 className="font-heading font-bold text-base mb-2 line-clamp-2">{item.title}</h3>
                </Link>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                  <div className="flex-1 text-[11px] text-muted-foreground">
                    <span className="font-bold text-foreground">{item.industry}</span>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/admin/case-studies/${item.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => remove(item.id)} className="h-8 w-8 rounded-lg hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
