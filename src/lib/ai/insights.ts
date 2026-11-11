// WS6: model-generated "Intelligence Insights" for the admin dashboard (and the
// /admin/insights hub).
// gatherInsightFacts() pulls the same analytics_* RPCs the chat assistant and
// MCP tools use plus a full content library (slug -> type/id) so the model can
// only ever reference content that really exists; buildInsightPrompt() turns
// the facts into a strict-JSON prompt; parseInsightResponse() parses with a zod
// schema, validates every target against the library (model-invented slugs are
// dropped, never linked) and stamps admin-editor URLs — not public blog URLs;
// detectAnomalies() adds the rule-based drop-off/boom alerts (|Δ| ≥ 25% vs the
// prior window) so those never depend on the model being available.

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ContentType = "post" | "case_study" | "resource";

export interface ContentLibraryItem {
  type: ContentType;
  id: string;
  slug: string;
  title: string;
  has_meta: boolean;
}

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
  /** Every authored content row (id + slug), so targets are validated before use. */
  library: ContentLibraryItem[];
}

/** Insert shape for ai_insights (subset that is safe to write server-side). */
export interface InsightRow {
  category: "content" | "anomaly" | "consultation" | "weekly_report";
  severity: "low" | "medium" | "high";
  title: string;
  body: string | null;
  target_type: string | null;
  target_id: string | null;
  target_slug: string | null;
  target_url: string | null;
  action: string | null;
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

  const [ov30, ov7, top, funnel, leads, counts, posts, caseStudies, resources] = await Promise.all([
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
    (supabase as any).from("blog_posts").select("id, slug, title, meta_description").limit(500),
    (supabase as any).from("case_studies").select("id, slug, title, meta_description").limit(500),
    (supabase as any).from("resources").select("id, slug, title, meta_description").limit(500),
  ]);

  const toLibrary = (rows: any[], type: ContentType): ContentLibraryItem[] =>
    (rows ?? [])
      .filter((r: any) => r.slug)
      .map((r: any) => ({ type, id: r.id, slug: r.slug, title: r.title ?? "", has_meta: !!r.meta_description }));

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
    library: [...toLibrary(posts.data, "post"), ...toLibrary(caseStudies.data, "case_study"), ...toLibrary(resources.data, "resource")],
  };
}

function fmtPct(v: number | null): string {
  if (v == null) return "n/a";
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

/** Model prompt: strict JSON array of findings, one per finding. */
export function buildInsightPrompt(facts: InsightFactSet): { system: string; user: string } {
  const leadLines = facts.newLeads.length
    ? facts.newLeads
        .map((l) => `- ${l.company ?? "Unknown company"}${l.industry ? ` (${l.industry})` : ""}${l.message ? `: ${l.message.slice(0, 120)}` : ""}`)
        .join("\n")
    : "none";

  const libraryLines = facts.library.slice(0, 100).length
    ? facts.library
        .slice(0, 100)
        .map((i) => `- [${i.type}:${i.slug}] ${i.title.slice(0, 80)}${i.has_meta ? "" : " (no meta description)"}`)
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
    `CONTENT LIBRARY (${facts.library.length} items; reference by exact slug only):\n${libraryLines}`,
    `CONTENT LIBRARY SIZE: ${facts.contentCounts.posts} posts, ${facts.contentCounts.caseStudies} case studies, ${facts.contentCounts.resources} resources`,
  ].join("\n");

  return {
    system:
      "You are the analytics assistant for Regent Technologies. Analyze the provided website analytics facts and write 3-6 concise, actionable insights for a busy founder. Each insight needs a short title, a 1-3 sentence plain-language body, a severity, a category, an optional action and an optional target that ONLY references the CONTENT LIBRARY slugs. Respond with ONLY a JSON array. Do not include markdown, prose, or any text outside the array.",
    user: `Today is ${new Date().toISOString().slice(0, 10)}. Facts:\n\n${factLines}\n\nReturn JSON array of objects with fields: title (string), body (string), severity ("low"|"medium"|"high"), category ("content"|"consultation"), target_slug (string|null), target_type ("post"|"case_study"|"resource"|"page"|null), action ("open_editor"|"create_post_draft"|null), actionable (boolean). Rules: target_slug MUST be an exact slug from the CONTENT LIBRARY — never invent one. Use category "content" for traffic, SEO and topic findings; category "consultation" for lead-related findings. Use action "create_post_draft" for an idea for a NEW post (set target_slug and target_type to null), action "open_editor" when you recommend a change or SEO fix to EXISTING library content (set target_slug and target_type to that item).`,
  };
}

const InsightSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  category: z.enum(["content", "consultation"]),
  target_slug: z.string().nullable().optional(),
  target_type: z.enum(["post", "case_study", "resource", "page"]).nullable().optional(),
  action: z.enum(["open_editor", "create_post_draft", "view_analytics"]).nullable().optional(),
  actionable: z.boolean().optional(),
});

/** Map a validated library slug (or a public page type) to an admin route. */
function resolveContentTarget(
  t: { target_type?: "post" | "case_study" | "resource" | "page" | null; target_slug?: string | null },
  library: ContentLibraryItem[]
): { target_id: string | null; target_type: string; target_url: string } | null {
  if (t.target_type === "page") {
    return { target_id: null, target_type: "page", target_url: "/admin/analytics" };
  }
  if (!t.target_slug) return null;
  const item = library.find((i) => i.slug === t.target_slug);
  if (!item) return null; // model invented a slug — never link it.
  if (item.type === "post") return { target_id: item.id, target_type: "post", target_url: `/admin/posts/${item.id}` };
  if (item.type === "case_study") return { target_id: item.id, target_type: "case_study", target_url: `/admin/case-studies/${item.id}` };
  if (item.type === "resource") return { target_id: item.id, target_type: "resource", target_url: `/admin/resources/${item.id}` };
  return null;
}

/** Parse model output into insight rows; never throws — bad output yields []. */
export function parseInsightResponse(text: string, library: ContentLibraryItem[] = []): InsightRow[] {
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
        const d = r.data;
        const action = d.action ?? null;

        // An idea for a new post has no target; everything else must resolve
        // against the library or the public-page route before we link it.
        let target: ReturnType<typeof resolveContentTarget> = null;
        if (action !== "create_post_draft") {
          target = resolveContentTarget({ target_type: d.target_type, target_slug: d.target_slug }, library);
        }
        // A model action with no valid target becomes a message-only row.
        const finalAction = action === "open_editor" && !target ? null : action;

        return {
          category: d.category,
          severity: d.severity,
          title: d.title,
          body: d.body || null,
          target_type: target?.target_type ?? null,
          target_id: target?.target_id ?? null,
          target_slug: target ? (d.target_slug ?? null) : null,
          target_url: target?.target_url ?? null,
          action: finalAction,
          actionable: target?.target_url != null || finalAction === "create_post_draft" || finalAction === "view_analytics",
          generated_by: "model",
          dedupe_key: null,
        } as InsightRow;
      })
      .filter((x): x is InsightRow => x !== null);
  } catch {
    return [];
  }
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
    change: number | null
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
      target_id: null,
      target_slug: null,
      target_url: "/admin/analytics",
      action: "view_analytics",
      actionable: true,
      generated_by: "rule",
      dedupe_key: `anomaly:${metric}:${today}`,
    });
  };

  consider("views", "Views", a.views, a.views_change);
  consider("visitors", "Visitors", a.visitors, a.visitors_change);
  consider("sessions", "Sessions", a.sessions, a.sessions_change);
  consider("conversions", "Conversions", a.conversions, a.conversions_change);
  return out;
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
      "You are the analytics editor for Regent Technologies. Write a concise weekly website report in Markdown aimed at a busy founder. Use Markdown headings, short bullets and bold for the headline numbers. Keep it under 300 words. Do not invent numbers that are not in the facts.",
    user:
      `Today is ${new Date().toISOString().slice(0, 10)}. Write the weekly report with these sections:\n\n` +
      `## Executive summary\n## Highlights & wins\n## Issues to watch\n## Leads & conversions\n## Recommendations\n\nFacts:\n\n${factLines}`,
  };
}

/** Daily digest prompt: a much shorter, numbers-first summary for email. */
export function buildDailyReportPrompt(facts: InsightFactSet): { system: string; user: string } {
  const factLines = [
    "OVERVIEW (today's numbers, last 7 and 30 days with % change vs previous period):",
    facts.overview
      ? `- views=${facts.overview.views} (${fmtPct(facts.overview.views_change)}), visitors=${facts.overview.visitors} (${fmtPct(facts.overview.visitors_change)}), sessions=${facts.overview.sessions} (${fmtPct(facts.overview.sessions_change)}), conversions=${facts.overview.conversions} (${fmtPct(facts.overview.conversions_change)}), engaged_rate=${facts.overview.engaged_rate ?? "n/a"}%, avg_time=${facts.overview.avg_time_on_page ?? "n/a"}s`
      : "- no data",
    "TOP CONTENT (by views, top 5):",
    ...facts.topContent.slice(0, 5).map(
      (t) => `- ${t.title ?? t.slug ?? "untitled"} [${t.content_type}] views=${t.views}, conversions=${t.conversions}`
    ),
    "FUNNEL (last 30 days):",
    facts.funnel
      ? `- visitors=${facts.funnel.visitors}, engaged=${facts.funnel.engaged_visitors} (${facts.funnel.engaged_rate ?? "n/a"}%), converted=${facts.funnel.converted_visitors} (${facts.funnel.conversion_rate ?? "n/a"}%)`
      : "- no data",
    `NEW CONSULTATION LEADS (${facts.newLeads.length}):`,
    ...(facts.newLeads.length
      ? facts.newLeads.map((l) => `- ${l.company ?? "Unknown company"}${l.industry ? ` (${l.industry})` : ""}`)
      : ["- none"]),
  ].join("\n");

  return {
    system:
      "You are the analytics editor for Regent Technologies. Write a very short daily website summary in Markdown for a busy founder. Lead with the headline numbers in one line, then 3-5 short bullets of what to notice (top content, funnel, new leads). No headings except an opening line. Keep it under 120 words. Do not invent numbers that are not in the facts.",
    user: `Today is ${new Date().toISOString().slice(0, 10)}. Write today's summary. Facts:\n\n${factLines}`,
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
