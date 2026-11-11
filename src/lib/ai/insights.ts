// WS6: model-generated "Intelligence Insights" for the admin dashboard.
// gatherInsightFacts() pulls the same analytics_* RPCs the chat assistant and
// MCP tools use, buildInsightPrompt() turns them into a strict-JSON prompt,
// parseInsightResponse() parses with a zod schema + graceful fallback, and
// detectAnomalies() adds the rule-based drop-off/boom alerts (|Δ| ≥ 25% vs the
// prior window) so those never depend on the model being available.

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface OverviewFacts {
  views: number;
  views_change: number | null;
  visitors: number;
  visitors_change: number | null;
  sessions: number;
  sessions_change: number | null;
  conversions: number;
  conversions_change: number | null;
  engaged_rate: number | null;
  avg_time_on_page: number | null;
}

export interface InsightFactSet {
  windowFrom: string;
  windowTo: string;
  overview: OverviewFacts | null;
  /** Last 7 days with % change vs the prior 7 days — feeds the anomaly rules. */
  anomaly7d: OverviewFacts | null;
  topContent: Array<{
    title: string | null;
    slug: string | null;
    content_type: string;
    views: number;
    visitors: number;
    conversions: number;
    avg_time_on_page: number | null;
  }>;
  funnel:
    | {
        visitors: number;
        engaged_visitors: number;
        converted_visitors: number;
        engaged_rate: number | null;
        conversion_rate: number | null;
      }
    | null;
  newLeads: Array<{ company: string | null; industry: string | null; message: string | null; created_at: string | null }>;
  contentCounts: { posts: number; caseStudies: number; resources: number };
}

/** Insert shape for ai_insights (subset that is safe to write server-side). */
export interface InsightRow {
  category: "content" | "anomaly" | "consultation" | "weekly_report";
  severity: "low" | "medium" | "high";
  title: string;
  body: string | null;
  target_type: string | null;
  target_slug: string | null;
  target_url: string | null;
  actionable: boolean;
  generated_by: string;
  dedupe_key: string | null;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toOverview(row: any): OverviewFacts | null {
  if (!row) return null;
  return {
    views: num(row.views),
    views_change: row.views_change != null ? num(row.views_change) : null,
    visitors: num(row.visitors),
    visitors_change: row.visitors_change != null ? num(row.visitors_change) : null,
    sessions: num(row.sessions),
    sessions_change: row.sessions_change != null ? num(row.sessions_change) : null,
    conversions: num(row.conversions),
    conversions_change: row.conversions_change != null ? num(row.conversions_change) : null,
    engaged_rate: row.engaged_rate != null ? num(row.engaged_rate) : null,
    avg_time_on_page: row.avg_time_on_page != null ? num(row.avg_time_on_page) : null,
  };
}

/** Pull the fact set used by the generator through the admin session client. */
export async function gatherInsightFacts(): Promise<InsightFactSet> {
  const supabase = await createClient();

  const now = new Date();
  const from30 = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const from7 = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const to = now.toISOString();

  const rpc = async (fn: string, args: Record<string, unknown>) => {
    const { data, error } = await (supabase as any).rpc(fn, {
      p_from: args.p_from,
      p_to: args.p_to,
      p_include_internal: false,
    });
    if (error) throw error;
    return data;
  };

  const [ov30, ov7, top, funnel, leads, counts] = await Promise.all([
    rpc("analytics_overview", { p_from: from30, p_to: to }),
    rpc("analytics_overview", { p_from: from7, p_to: to }),
    rpc("analytics_top_content", { p_from: from30, p_to: to }),
    rpc("analytics_funnel", { p_from: from30, p_to: to }),
    supabase
      .from("consultation_requests")
      .select("company, industry, message, created_at")
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(5),
    Promise.all([
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("case_studies").select("id", { count: "exact", head: true }),
      supabase.from("resources").select("id", { count: "exact", head: true }),
    ]),
  ]);

  return {
    windowFrom: from30,
    windowTo: to,
    overview: toOverview(ov30?.[0]),
    anomaly7d: toOverview(ov7?.[0]),
    topContent: (top || []).map((r: any) => ({
      title: r.title ?? null,
      slug: r.slug ?? null,
      content_type: r.content_type ?? "",
      views: num(r.views),
      visitors: num(r.visitors),
      conversions: num(r.conversions),
      avg_time_on_page: r.avg_time_on_page != null ? num(r.avg_time_on_page) : null,
    })),
    funnel: funnel?.[0]
      ? {
          visitors: num(funnel[0].visitors),
          engaged_visitors: num(funnel[0].engaged_visitors),
          converted_visitors: num(funnel[0].converted_visitors),
          engaged_rate: funnel[0].engaged_rate != null ? num(funnel[0].engaged_rate) : null,
          conversion_rate: funnel[0].conversion_rate != null ? num(funnel[0].conversion_rate) : null,
        }
      : null,
    newLeads: (leads.data || []).map((l: any) => ({
      company: l.company ?? null,
      industry: l.industry ?? null,
      message: l.message ?? null,
      created_at: l.created_at ?? null,
    })),
    contentCounts: {
      posts: counts[0].count || 0,
      caseStudies: counts[1].count || 0,
      resources: counts[2].count || 0,
    },
  };
}

/** Model prompt: strict JSON array of findings, one per finding. */
export function buildInsightPrompt(facts: InsightFactSet): { system: string; user: string } {
  const leadLines = facts.newLeads.length
    ? facts.newLeads
        .map((l) => `- ${l.company ?? "Unknown company"}${l.industry ? ` (${l.industry})` : ""}${l.message ? `: ${l.message.slice(0, 120)}` : ""}`)
        .join("\n")
    : "none";

  const factLines = [
    "OVERVIEW (last 30 days, % = change vs previous period):",
    facts.overview
      ? `- views=${facts.overview.views} (${fmtPct(facts.overview.views_change)}), visitors=${facts.overview.visitors} (${fmtPct(facts.overview.visitors_change)}), sessions=${facts.overview.sessions} (${fmtPct(facts.overview.sessions_change)}), conversions=${facts.overview.conversions} (${fmtPct(facts.overview.conversions_change)}), engaged_rate=${facts.overview.engaged_rate ?? "n/a"}%, avg_time=${facts.overview.avg_time_on_page ?? "n/a"}s`
      : "- no data",
    "TOP CONTENT (by views):",
    ...facts.topContent.slice(0, 6).map((t) => `- ${t.title ?? t.slug ?? "untitled"} [${t.content_type}] views=${t.views}, visitors=${t.visitors}, conversions=${t.conversions}, avg_time=${t.avg_time_on_page ?? "n/a"}s`),
    "FUNNEL:",
    facts.funnel
      ? `- visitors=${facts.funnel.visitors}, engaged=${facts.funnel.engaged_visitors} (${facts.funnel.engaged_rate ?? "n/a"}%), converted=${facts.funnel.converted_visitors} (${facts.funnel.conversion_rate ?? "n/a"}%)`
      : "- no data",
    `NEW CONSULTATION LEADS:\n${leadLines}`,
    `CONTENT LIBRARY: ${facts.contentCounts.posts} posts, ${facts.contentCounts.caseStudies} case studies, ${facts.contentCounts.resources} resources`,
  ].join("\n");

  return {
    system:
      "You are the analytics assistant for Regent Systems. Analyze the provided website analytics facts and write 3-6 concise, actionable insights for a busy founder. Each insight needs a short title, a 1-3 sentence plain-language body, a severity, a category, and an optional target. Respond with ONLY a JSON array. Do not include markdown, prose, or any text outside the array.",
    user: `Today is ${new Date().toISOString().slice(0, 10)}. Facts:\n\n${factLines}\n\nReturn JSON array of objects with fields: title (string), body (string), severity ("low"|"medium"|"high"), category ("content"|"consultation"), target_slug (string|null), target_type (string|null), actionable (boolean). Categories: "content" for traffic/engagement findings (use target_slug when tied to a specific post, e.g. a top or underperforming article), "consultation" for lead-related findings.`,
  };
}

const InsightSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  category: z.enum(["content", "consultation"]),
  target_slug: z.string().nullable().optional(),
  target_type: z.string().nullable().optional(),
  actionable: z.boolean().optional(),
});

/** Parse model output into insight rows; never throws — bad output yields []. */
export function parseInsightResponse(text: string): InsightRow[] {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  if (!cleaned.startsWith("[")) {
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start >= 0 && end > start) cleaned = cleaned.slice(start, end + 1);
  }
  try {
    const parsed = JSON.parse(cleaned);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    return arr
      .map((item, i) => {
        const r = InsightSchema.safeParse(item);
        if (!r.success) return null;
        return {
          category: r.data.category,
          severity: r.data.severity,
          title: r.data.title,
          body: r.data.body || null,
          target_type: r.data.target_type ?? null,
          target_slug: r.data.target_slug ?? null,
          target_url: r.data.target_slug ? buildTargetUrl(r.data) : null,
          actionable: !!r.data.actionable,
          generated_by: "model",
          dedupe_key: null,
        } as InsightRow;
      })
      .filter((x): x is InsightRow => x !== null);
  } catch {
    return [];
  }
}

function buildTargetUrl(t: { target_type?: string | null; target_slug?: string | null }): string | null {
  if (!t.target_slug) return null;
  const base = t.target_type === "case_study" ? "/case-studies/"
    : t.target_type === "resource" ? "/resources/"
    : "/blog/";
  return `${base}${t.target_slug}`;
}

/** Rule-based alerts: a ≥25% swing in a 7d-vs-prior-7d metric becomes an anomaly row. */
export function detectAnomalies(facts: InsightFactSet): InsightRow[] {
  const a = facts.anomaly7d;
  if (!a) return [];
  const today = new Date().toISOString().slice(0, 10);
  const out: InsightRow[] = [];

  // The overview RPC returns only the current value + % change vs the prior
  // window; back out the prior value as prev = cur * 100 / (100 + change).
  const consider = (
    metric: string,
    label: string,
    value: number,
    change: number | null,
    url: string | null
  ) => {
    if (change == null || change <= -100 || Math.abs(change) < 25) return;
    const prev = (value * 100) / (100 + change);
    if (prev <= 0) return;
    const up = change > 0;
    out.push({
      category: "anomaly",
      severity: Math.abs(change) >= 50 ? "high" : "medium",
      title: `${label} ${up ? "surged" : "dropped"} ${Math.abs(change).toFixed(0)}% in the last 7 days`,
      body: `${label} went from ${Math.round(prev).toLocaleString()} to ${Math.round(value).toLocaleString()} compared with the previous 7 days${up ? " — more than expected. Check for a campaign or email that drove it." : " — worth investigating what changed."}`,
      target_type: null,
      target_slug: null,
      target_url: url,
      actionable: true,
      generated_by: "rule",
      dedupe_key: `anomaly:${metric}:${today}`,
    });
  };

  consider("views", "Views", a.views, a.views_change, null);
  consider("visitors", "Visitors", a.visitors, a.visitors_change, null);
  consider("sessions", "Sessions", a.sessions, a.sessions_change, null);
  consider("conversions", "Conversions", a.conversions, a.conversions_change, "/contact");
  return out;
}

function fmtPct(v: number | null): string {
  if (v == null) return "n/a";
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

/** Weekly report prompt: a structured markdown summary for email. */
export function buildWeeklyReportPrompt(facts: InsightFactSet): { system: string; user: string } {
  const factLines = [
    "OVERVIEW (last 30 days, % = change vs previous period):",
    facts.overview
      ? `- views=${facts.overview.views} (${fmtPct(facts.overview.views_change)}), visitors=${facts.overview.visitors} (${fmtPct(facts.overview.visitors_change)}), sessions=${facts.overview.sessions} (${fmtPct(facts.overview.sessions_change)}), conversions=${facts.overview.conversions} (${fmtPct(facts.overview.conversions_change)}), engaged_rate=${facts.overview.engaged_rate ?? "n/a"}%, avg_time=${facts.overview.avg_time_on_page ?? "n/a"}s`
      : "- no data",
    "TOP CONTENT (by views):",
    ...facts.topContent.slice(0, 6).map(
      (t) => `- ${t.title ?? t.slug ?? "untitled"} [${t.content_type}] views=${t.views}, conversions=${t.conversions}`
    ),
    "FUNNEL:",
    facts.funnel
      ? `- visitors=${facts.funnel.visitors}, engaged=${facts.funnel.engaged_visitors} (${facts.funnel.engaged_rate ?? "n/a"}%), converted=${facts.funnel.converted_visitors} (${facts.funnel.conversion_rate ?? "n/a"}%)`
      : "- no data",
    `NEW CONSULTATION LEADS (${facts.newLeads.length}):`,
    ...(facts.newLeads.length
      ? facts.newLeads.map((l) => `- ${l.company ?? "Unknown company"}${l.industry ? ` (${l.industry})` : ""}`)
      : ["- none"]),
    `CONTENT LIBRARY: ${facts.contentCounts.posts} posts, ${facts.contentCounts.caseStudies} case studies, ${facts.contentCounts.resources} resources`,
  ].join("\n");

  return {
    system:
      "You are the analytics editor for Regent Systems. Write a concise weekly website report in Markdown aimed at a busy founder. Use Markdown headings, short bullets and bold for the headline numbers. Keep it under 300 words. Do not invent numbers that are not in the facts.",
    user:
      `Today is ${new Date().toISOString().slice(0, 10)}. Write the weekly report with these sections:\n\n` +
      `## Executive summary\n## Highlights & wins\n## Issues to watch\n## Leads & conversions\n## Recommendations\n\nFacts:\n\n${factLines}`,
  };
}

/** Tiny markdown → HTML for emails (headings, bullets, paragraphs; otherwise escaped). */
export function markdownToHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const out: string[] = [];
  let listOpen = false;
  const closeList = () => {
    if (listOpen) {
      out.push("</ul>");
      listOpen = false;
    }
  };
  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) {
      closeList();
      out.push(`<h${h[1].length}>${esc(h[2])}</h${h[1].length}>`);
      continue;
    }
    const li = line.match(/^[-*]\s+(.*)/);
    if (li) {
      if (!listOpen) {
        out.push("<ul>");
        listOpen = true;
      }
      out.push(`<li>${esc(li[1])}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${esc(line)}</p>`);
  }
  closeList();
  return out.join("\n");
}
