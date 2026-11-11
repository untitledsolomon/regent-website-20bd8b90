// WS5: analytics tools exposed to the AI model. The 9 analytics_* RPC functions
// (identical to the MCP server's tools) are surfaced as OpenAI-style function
// definitions; toolArgsFor maps a model's arguments onto the shared 8-parameter
// RPC signature so the assistant queries exactly what the dashboard and MCP see.

import { z } from "zod";

export const ANALYTICS_TOOL_NAMES = [
  "analytics_overview",
  "analytics_daily",
  "analytics_top_content",
  "analytics_content_trend",
  "analytics_sources",
  "analytics_geo",
  "analytics_devices",
  "analytics_funnel",
  "analytics_unique_visitors",
] as const;

export type AnalyticsToolName = (typeof ANALYTICS_TOOL_NAMES)[number];

// Shared parameter shape for every analytics tool (p_to exclusive, p_from inclusive).
const analyticsArgsShape = z.object({
  p_from: z.string().datetime().optional().describe("ISO start date (inclusive)"),
  p_to: z.string().datetime().optional().describe("ISO end date (exclusive)"),
  p_content_type: z.enum(["page", "blog_post", "case_study", "resource", "resource_download"]).optional(),
  p_slug: z.string().optional().describe("Filter to a single content slug"),
  p_source: z.string().optional().describe("Referrer channel: paid, email, social, organic_search, internal, referral, direct"),
  p_country: z.string().optional().describe("ISO-2 country code"),
  p_device: z.enum(["desktop", "mobile", "tablet"]).optional(),
  p_include_internal: z.boolean().optional().describe("Include admin/bot/test traffic (default false)"),
});

export function parseToolArgs(raw: string): Record<string, unknown> {
  try {
    return analyticsArgsShape.parse(JSON.parse(raw)) as Record<string, unknown>;
  } catch {
    // Let the model see its malformed args through the tool result.
    return {};
  }
}

/** Default the date window when absent (last 30 days) and drop null/undefined. */
export function normalizeArgs(args: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...args };
  const now = Date.now();
  out.p_from ??= new Date(now - 30 * 86_400_000).toISOString();
  out.p_to ??= new Date(now).toISOString();
  out.p_include_internal ??= false;
  for (const k of Object.keys(out)) {
    if (out[k] === null || out[k] === undefined || out[k] === "") delete out[k];
  }
  return out;
}

const toolDescriptions: Record<AnalyticsToolName, string> = {
  analytics_overview: "Key metrics for the range: views, unique visitors, sessions, engaged rate, avg engaged time, conversions, each with previous-period % change.",
  analytics_daily: "Per-day time series of views, visitors, sessions, engaged views and conversions (chart feed).",
  analytics_top_content: "Performance per page/post/case-study/resource: views, visitors, avg time, avg scroll, engaged rate, conversions, last viewed.",
  analytics_content_trend: "Single content item's daily trend. Pass p_slug.",
  analytics_sources: "Sessions, visitors, views and conversions grouped by referrer channel and source.",
  analytics_geo: "Views, visitors, sessions and share grouped by ISO-2 country code.",
  analytics_devices: "Views, visitors, sessions and share grouped by device type.",
  analytics_funnel: "Visitors → Engaged → Converted funnel with conversion rates and inquiry statuses.",
  analytics_unique_visitors: "Distinct visitor count for the range (daily series).",
};

export function openAiToolsList(): Array<Record<string, unknown>> {
  return ANALYTICS_TOOL_NAMES.map((name) => ({
    type: "function",
    function: {
      name,
      description:
        toolDescriptions[name] +
        " If p_from/p_to are omitted, use the last 30 days. Internal traffic is excluded unless p_include_internal is true.",
      parameters: {
        type: "object",
        properties: {
          p_from: { type: "string", format: "date-time", description: "ISO start (inclusive)" },
          p_to: { type: "string", format: "date-time", description: "ISO end (exclusive)" },
          p_content_type: { type: "string", enum: ["page", "blog_post", "case_study", "resource", "resource_download"] },
          p_slug: { type: "string", description: "Single slug filter" },
          p_source: { type: "string", enum: ["paid", "email", "social", "organic_search", "internal", "referral", "direct"] },
          p_country: { type: "string", description: "ISO-2 country code" },
          p_device: { type: "string", enum: ["desktop", "mobile", "tablet"] },
          p_include_internal: { type: "boolean", description: "Include internal/bot/test traffic" },
        },
        additionalProperties: false,
      },
    },
  }));
}
