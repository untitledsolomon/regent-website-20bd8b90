// WS6: scheduled AI report emails (weekly + daily). generateDigest() pulls the
// same fact set as the insight generator, runs the weekly/daily markdown prompt
// through callModel and records the call in the ai_usage ledger. The Emails-page
// control center and the /api/cron/digest route both build on it; delivery goes
// through the send-ai-report edge function (the only place with RESEND_API_KEY).

import { callModel, recordAiUsage } from "./model";
import {
  gatherInsightFacts,
  buildWeeklyReportPrompt,
  buildDailyReportPrompt,
  markdownToHtml,
} from "./insights";

export type DigestKind = "weekly" | "daily";

export interface DigestPreview {
  /** Email subject line, e.g. "Regent weekly AI report — 2026-11-11". */
  subject: string;
  /** The raw markdown the model produced (editable in the UI). */
  markdown: string;
  /** Rendered HTML of that markdown, ready to email. */
  html: string;
}

/** Generate a scheduled digest. Throws with the provider error on failure. */
export async function generateDigest(kind: DigestKind, uid: string): Promise<DigestPreview> {
  const facts = await gatherInsightFacts();
  const { system, user } = kind === "weekly" ? buildWeeklyReportPrompt(facts) : buildDailyReportPrompt(facts);
  const result = await callModel({
    system,
    messages: [{ role: "user", content: user }],
    temperature: kind === "weekly" ? 0.4 : 0.3,
    maxTokens: kind === "weekly" ? 1500 : 800,
  });
  await recordAiUsage({
    uid,
    feature: kind === "weekly" ? "weekly_report" : "digest_daily",
    usage: result.usage,
    latency_ms: result.latency_ms,
    success: true,
  });
  const today = new Date().toISOString().slice(0, 10);
  return {
    subject: `Regent ${kind} AI report — ${today}`,
    markdown: result.text,
    html: markdownToHtml(result.text),
  };
}
