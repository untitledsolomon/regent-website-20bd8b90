"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Eye, Users, Monitor, Smartphone, Tablet, Clock,
  BarChart3, MousePointerClick, Download,
  Filter, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Globe,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useAnalytics, downloadCsv, defaultParams, CONTENT_TYPES, CHANNELS, DEVICES,
  type AnalyticsParams,
} from "./useAnalytics";

const PIE_COLORS = ["#4F46E5", "#818CF8", "#C084FC", "#22C55E", "#EAB308", "#F43F5E"];

function TrendBadge({ change }: { change: number | null }) {
  if (change == null) return <Badge variant="outline" className="rounded-full border-none px-1.5 py-0 text-[10px] font-bold bg-muted text-muted-foreground">—</Badge>;
  const up = change >= 0;
  return (
    <Badge variant="outline" className={cn("rounded-full border-none px-1.5 py-0 text-[10px] font-bold", up ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
      {up ? "+" : ""}{change.toLocaleString()}%
    </Badge>
  );
}

function formatClock(s: number | null): string {
  if (s == null) return "—";
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

const deviceIcons: Record<string, React.ReactNode> = {
  desktop: <Monitor size={14} />,
  mobile: <Smartphone size={14} />,
  tablet: <Tablet size={14} />,
};

export default function AdminAnalytics() {
  const [preset, setPreset] = useState<number | null>(30);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [contentType, setContentType] = useState("");
  const [source, setSource] = useState("");
  const [country, setCountry] = useState("");
  const [device, setDevice] = useState("");
  const [includeInternal, setIncludeInternal] = useState(false);
  const [pageIdx, setPageIdx] = useState(0);
  const PAGE_SIZE = 8;

  const filters = useMemo(() => ({
    p_include_internal: includeInternal,
    ...(contentType ? { p_content_type: contentType } : {}),
    ...(source ? { p_source: source } : {}),
    ...(country ? { p_country: country } : {}),
    ...(device ? { p_device: device } : {}),
  }), [contentType, source, country, device, includeInternal]);

  const params = useMemo<AnalyticsParams>(() => {
    const base = preset != null ? defaultParams(preset) : {
      p_from: customFrom ? new Date(customFrom + "T00:00:00").toISOString() : defaultParams(30).p_from,
      p_to: customTo ? new Date(customTo + "T23:59:59.999").toISOString() : defaultParams(30).p_to,
    };
    return { ...base, ...filters };
  }, [preset, customFrom, customTo, filters]);

  // Changing the date range or filters restarts pagination at page one.
  useEffect(() => { setPageIdx(0); }, [params]);

  const a = useAnalytics(params);
  const o = a.overview;
  const rangeLabel = preset != null ? `Last ${preset} days` : `${customFrom && customTo ? `${customFrom} → ${customTo}` : "Custom range"}`;

  const exportRows = a.topContent.map((r) => ({
    content_type: r.content_type, title: r.title, slug: r.slug, views: r.views,
    visitors: r.visitors, avg_time_on_page: r.avg_time_on_page, avg_scroll_depth: r.avg_scroll_depth,
    engaged_sessions: r.engaged_sessions, conversions: r.conversions, last_viewed_at: r.last_viewed_at,
  }));

  if (a.loading) return <div className="p-8 animate-pulse">Loading analytics...</div>;

  const kpis = [
    { label: "TOTAL VIEWS", value: o?.views ?? 0, trend: o?.views_change ?? null, sub: rangeLabel, icon: Eye },
    { label: "UNIQUE VISITORS", value: o?.visitors ?? 0, trend: o?.visitors_change ?? null, sub: `${o?.engaged_rate ?? 0}% engaged`, icon: Users },
    { label: "AVG ENGAGEMENT", value: formatClock(o?.avg_time_on_page ?? null), trend: o?.avg_time_change ?? null, sub: `engaged rate ${o?.engaged_rate ?? 0}%`, icon: Clock },
    { label: "CONVERSIONS", value: o?.conversions ?? 0, trend: o?.conversions_change ?? null, sub: `${o?.sessions ?? 0} sessions`, icon: MousePointerClick },
  ];

  const dailyData = a.daily.map((d) => ({ ...d, date: format(parseISO(d.day), "MMM dd") }));
  const totalViews = a.sources.reduce((s, r) => s + r.views, 0);
  // Top referrers: domain rows only (direct traffic has no referrer domain).
  const referrers = a.sources
    .filter((r) => r.source && r.source.trim().length > 0)
    .sort((x, y) => y.views - x.views)
    .slice(0, 12);
  const refMax = referrers[0]?.views ?? 0;
  // Pagination for the Top Content table.
  const pageCount = Math.max(1, Math.ceil(a.topContent.length / PAGE_SIZE));
  const safePage = Math.min(pageIdx, pageCount - 1);
  const topRows = a.topContent.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Content Analytics</h1>
          <p className="text-muted-foreground text-sm">Deep dive into audience and content performance.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-xl h-10 bg-card text-xs font-medium">
                <CalendarIcon size={14} className="mr-2" /> {rangeLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 space-y-3">
              <div className="flex gap-1.5">
                {[7, 30, 90].map((d) => (
                  <Button key={d} size="sm" variant={preset === d ? "secondary" : "ghost"} className="rounded-lg text-xs h-8 flex-1" onClick={() => setPreset(d)}>{d}d</Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">From</label>
                  <input type="date" value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); setPreset(null); }} className="w-full h-9 px-2 text-xs bg-background border border-input rounded-lg" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">To</label>
                  <input type="date" value={customTo} onChange={(e) => { setCustomTo(e.target.value); setPreset(null); }} className="w-full h-9 px-2 text-xs bg-background border border-input rounded-lg" />
                </div>
              </div>
              {customFrom && customTo && preset === null && (
                <Button size="sm" className="w-full rounded-lg" onClick={() => { setCustomFrom(""); setCustomTo(""); setPreset(30); }}>Reset to 30d</Button>
              )}
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl h-10 bg-card"><Filter size={15} /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Content type</label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {CONTENT_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Channel</label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="All channels" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All channels</SelectItem>
                    {CHANNELS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Device</label>
                <Select value={device} onValueChange={setDevice}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="All devices" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All devices</SelectItem>
                    {DEVICES.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Country (ISO-2)</label>
                <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. US" className="w-full h-9 px-2 mt-1 text-xs bg-background border border-input rounded-lg" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Include internal traffic</label>
                <Switch checked={includeInternal} onCheckedChange={setIncludeInternal} />
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" className="rounded-xl h-10 bg-card" onClick={() => downloadCsv(exportRows, `analytics-${rangeLabel.replace(/[^a-z0-9]+/gi, "-")}.csv`)}>
            <Download size={16} className="mr-2" /> Export
          </Button>
        </div>
      </div>

      {a.error && <div className="rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-4">Analytics error: {a.error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k) => (
          <Card key={k.label} className="border-none shadow-sm rounded-2xl bg-card">
            <CardContent className="pt-6">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{k.label}</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{typeof k.value === "number" ? k.value.toLocaleString() : k.value}</div>
                <TrendBadge change={k.trend} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-heading font-bold">Views & Engaged Sessions Over Time</CardTitle>
          <CardDescription className="text-xs">Daily performance metrics for the selected period</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] pt-4">
          {a.daily.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <BarChart3 size={28} className="opacity-40" />
              <p className="text-sm">No data yet for this range.</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEngaged" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} interval={Math.max(3, Math.floor(a.daily.length / 10))} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="views" name="Page Views" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" dataKey="engaged_views" name="Engaged" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorEngaged)" />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="content" className="rounded-lg px-6">Top Content</TabsTrigger>
          <TabsTrigger value="audience" className="rounded-lg px-6">Audience</TabsTrigger>
          <TabsTrigger value="conversions" className="rounded-lg px-6">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-card">
            <CardContent className="p-0">
              {a.topContent.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <BarChart3 size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No views yet for this range.</p>
                </div>
              ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left border-b border-border">
                    <th className="px-6 py-4">Article / Resource</th>
                    <th className="px-6 py-4">Views</th>
                    <th className="px-6 py-4">Visitors</th>
                    <th className="px-6 py-4">Avg. Time</th>
                    <th className="px-6 py-4">Scroll</th>
                    <th className="px-6 py-4">Conversions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topRows.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", idx % 2 === 0 ? "bg-indigo-50" : "bg-emerald-50")}>
                            <BarChart3 size={18} className={idx % 2 === 0 ? "text-indigo-600" : "text-emerald-600"} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground line-clamp-1">{item.title || item.slug || "Untitled"}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold">{item.content_type.replace("_", " ")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">{item.views.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium">{item.visitors.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatClock(item.avg_time_on_page)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, item.avg_scroll_depth ?? 0)}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">{item.avg_scroll_depth != null ? `${Math.round(item.avg_scroll_depth)}%` : "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">{item.conversions > 0 ? item.conversions : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
              {a.topContent.length > PAGE_SIZE && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {safePage * PAGE_SIZE + 1}–{Math.min(a.topContent.length, (safePage + 1) * PAGE_SIZE)} of {a.topContent.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
                      disabled={safePage === 0}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-medium text-muted-foreground px-2">Page {safePage + 1} of {pageCount}</span>
                    <button
                      onClick={() => setPageIdx((p) => Math.min(pageCount - 1, p + 1))}
                      disabled={safePage >= pageCount - 1}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm rounded-3xl bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Devices</CardTitle>
              </CardHeader>
              <CardContent>
                {a.devices.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">No data yet.</div>
                ) : (
                  <>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={a.devices} dataKey="views" nameKey="device_type" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} stroke="none">
                            {a.devices.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(v: any, n: any) => [`${Number(v).toLocaleString()} views`, String(n).replace("_", " ")]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {a.devices.map((item, i) => (
                        <div key={item.device_type} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            {deviceIcons[item.device_type]}{" "}
                            <span className="font-medium capitalize">{item.device_type}</span>
                          </div>
                          <span className="font-bold">{item.views.toLocaleString()} · {item.share}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                {a.geo.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">No data yet.</div>
                ) : (
                  <div className="space-y-4">
                    {a.geo.slice(0, 8).map((g, i) => (
                      <div key={g.country_code} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">{g.country_code}</span>
                          <span className="text-sm font-medium">{g.country_code}</span>
                        </div>
                        <span className="text-sm font-medium">{g.views.toLocaleString()} views · {g.share}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-3xl bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Referrers</CardTitle>
              </div>
              <CardDescription className="text-xs">Sites sending visitors your way, by referrer domain</CardDescription>
            </CardHeader>
            <CardContent>
              {referrers.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">No referral traffic in this range.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {referrers.map((r, i) => (
                    <div key={r.source} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">{i + 1}</span>
                          <span className="font-semibold text-foreground truncate">{r.source}</span>
                          <span className="text-[10px] font-medium text-muted-foreground capitalize shrink-0">{r.channel.replace("_", " ")}</span>
                        </div>
                        <span className="font-bold shrink-0">{r.views.toLocaleString()} <span className="font-normal text-muted-foreground">views</span></span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: refMax > 0 ? `${Math.max(2, Math.round((r.views / refMax) * 100))}%` : "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm rounded-3xl bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold">Conversions</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Tracked conversion events ({o?.conversions ?? 0} in range)</CardDescription>
              </CardHeader>
              <CardContent>
                {a.sources.reduce((s, r) => s + r.conversions, 0) === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm">No conversions tracked yet.</div>
                ) : (
                  <div className="space-y-4">
                    {a.sources.filter((s) => s.conversions > 0).slice(0, 6).map((s) => (
                      <div key={s.channel} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                        <span className="text-sm font-medium capitalize text-foreground">{s.channel.replace("_", " ")}</span>
                        <span className="text-sm font-bold text-foreground">{s.conversions} conversion{s.conversions === 1 ? "" : "s"}</span>
                      </div>
                    ))}
                    <div className="pt-4 mt-2 border-t border-border">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Conversion rate</span>
                      <div className="text-2xl font-bold mt-1 text-foreground">{a.funnel?.conversion_rate != null ? `${a.funnel.conversion_rate}%` : "—"}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold">Attribution by Channel</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Where conversion-driving traffic originates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {a.sources.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm">No data yet.</div>
                ) : (
                  a.sources.slice(0, 6).map((s) => (
                    <div key={s.channel + (s.source || "")} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium capitalize">{s.channel.replace("_", " ")}{s.source && <span className="text-muted-foreground font-normal"> · {s.source}</span>}</span>
                        <span className="font-bold">{s.views.toLocaleString()} views</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${totalViews > 0 ? Math.max(2, Math.round((s.views / totalViews) * 100)) : 0}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-card md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold">Inquiry Status Breakdown</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Consultation-request statuses for inquiries attributed to this range</CardDescription>
              </CardHeader>
              <CardContent>
                {a.funnel && Object.keys(a.funnel.inquiry_statuses).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(a.funnel.inquiry_statuses).map(([k, v]) => (
                      <span key={k} className="text-xs font-bold capitalize bg-muted rounded-full px-3 py-1.5">{k}: {v}</span>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground text-sm">No inquiries in this range.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
