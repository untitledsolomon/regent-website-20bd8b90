"use client";

// WS4: single shared data layer for both admin analytics pages. Every number
// comes from an analytics_* RPC (same functions the MCP tools call), so the
// dashboard, the MCP server and raw SQL always agree for the same filters.

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AnalyticsParams {
  p_from: string;
  p_to: string;
  p_include_internal: boolean;
  p_content_type?: string;
  p_slug?: string;
  p_source?: string;
  p_country?: string;
  p_device?: string;
}

export interface ContentTypeOption {
  value: string;
  label: string;
}
export const CONTENT_TYPES: ContentTypeOption[] = [
  { value: "page", label: "Page" },
  { value: "blog_post", label: "Blog Post" },
  { value: "case_study", label: "Case Study" },
  { value: "resource_download", label: "Download" },
];
export const CHANNELS = ["paid", "email", "social", "organic_search", "internal", "referral", "direct"];
export const DEVICES = ["desktop", "mobile", "tablet"];

export function defaultParams(daysBack: number): AnalyticsParams {
  return {
    p_from: new Date(Date.now() - daysBack * 86_400_000).toISOString(),
    p_to: new Date().toISOString(),
    p_include_internal: false,
  };
}

export interface OverviewRow {
  views: number; prev_views: number; views_change: number | null;
  visitors: number; prev_visitors: number; visitors_change: number | null;
  sessions: number; prev_sessions: number; sessions_change: number | null;
  engaged_views: number; prev_engaged_views: number; engaged_views_change: number | null;
  engaged_rate: number | null; prev_engaged_rate: number | null; engaged_rate_change: number | null;
  avg_time_on_page: number | null; prev_avg_time_on_page: number | null; avg_time_change: number | null;
  conversions: number; prev_conversions: number; conversions_change: number | null;
}
export interface DailyRow { day: string; views: number; visitors: number; sessions: number; engaged_views: number; conversions: number; }
export interface TopContentRow {
  content_type: string; title: string | null; slug: string | null;
  views: number; visitors: number; avg_time_on_page: number | null;
  avg_scroll_depth: number | null; engaged_sessions: number; conversions: number; last_viewed_at: string | null;
}
export interface SourceRow { channel: string; source: string | null; sessions: number; visitors: number; views: number; conversions: number; }
export interface GeoRow { country_code: string; sessions: number; visitors: number; views: number; share: number; }
export interface DeviceRow { device_type: string; sessions: number; visitors: number; views: number; share: number; }
export interface FunnelRow {
  visitors: number; engaged_visitors: number; converted_visitors: number;
  engaged_rate: number | null; conversion_rate: number | null;
  engaged_drop: number | null; converted_drop: number | null; inquiry_statuses: Record<string, number>;
}

export interface AnalyticsData {
  overview: OverviewRow | null;
  daily: DailyRow[];
  topContent: TopContentRow[];
  sources: SourceRow[];
  geo: GeoRow[];
  devices: DeviceRow[];
  funnel: FunnelRow | null;
}

function stripNulls<T extends Record<string, unknown>>(obj: T): T {
  for (const k of Object.keys(obj)) if (obj[k] === null || obj[k] === undefined) delete obj[k];
  return obj;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function useAnalytics(params: AnalyticsParams) {
  const supabase = createClient();
  const [data, setData] = useState<AnalyticsData>({
    overview: null, daily: [], topContent: [], sources: [], geo: [], devices: [], funnel: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const p = stripNulls({ ...params });
    // The typed client only knows the legacy get_* functions; the analytics_*
    // family is added to types.ts but the union of return shapes still needs an
    // explicit cast at this boundary — the mapping below fixes the shape.
    const run = async (fn: string) => {
      const { data: d, error: e } = await (supabase.rpc as any)(fn, p);
      if (e) throw new Error(`${fn}: ${e.message}`);
      return d as any[];
    };
    try {
      const [overview, daily, topContent, sources, geo, devices, funnel] = await Promise.all([
        run("analytics_overview"), run("analytics_daily"), run("analytics_top_content"),
        run("analytics_sources"), run("analytics_geo"), run("analytics_devices"), run("analytics_funnel"),
      ]);
      setData({
        overview: overview?.[0] ?? null,
        daily: (daily || []).map((d: any) => ({
          day: d.day, views: num(d.views), visitors: num(d.visitors),
          sessions: num(d.sessions), engaged_views: num(d.engaged_views), conversions: num(d.conversions),
        })),
        topContent: (topContent || []).map((r: any) => ({
          content_type: r.content_type, title: r.title, slug: r.slug, views: num(r.views),
          visitors: num(r.visitors), avg_time_on_page: r.avg_time_on_page != null ? num(r.avg_time_on_page) : null,
          avg_scroll_depth: r.avg_scroll_depth != null ? num(r.avg_scroll_depth) : null,
          engaged_sessions: num(r.engaged_sessions), conversions: num(r.conversions), last_viewed_at: r.last_viewed_at ?? null,
        })),
        sources: (sources || []).map((r: any) => ({
          channel: r.channel, source: r.source, sessions: num(r.sessions),
          visitors: num(r.visitors), views: num(r.views), conversions: num(r.conversions),
        })),
        geo: (geo || []).map((r: any) => ({
          country_code: r.country_code, sessions: num(r.sessions), visitors: num(r.visitors),
          views: num(r.views), share: num(r.share),
        })),
        devices: (devices || []).map((r: any) => ({
          device_type: r.device_type, sessions: num(r.sessions), visitors: num(r.visitors),
          views: num(r.views), share: num(r.share),
        })),
        funnel: funnel?.[0] ? {
          visitors: num(funnel[0].visitors), engaged_visitors: num(funnel[0].engaged_visitors),
          converted_visitors: num(funnel[0].converted_visitors),
          engaged_rate: funnel[0].engaged_rate != null ? num(funnel[0].engaged_rate) : null,
          conversion_rate: funnel[0].conversion_rate != null ? num(funnel[0].conversion_rate) : null,
          engaged_drop: funnel[0].engaged_drop != null ? num(funnel[0].engaged_drop) : null,
          converted_drop: funnel[0].converted_drop != null ? num(funnel[0].converted_drop) : null,
          inquiry_statuses: funnel[0].inquiry_statuses ?? {},
        } : null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analytics failed to load");
    } finally {
      setLoading(false);
    }
  }, [supabase, params]);

  useEffect(() => { load(); }, [load]);

  return { ...data, loading, error, refetch: load };
}

/** Client-side CSV export of the current filtered result. */
export function downloadCsv(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
