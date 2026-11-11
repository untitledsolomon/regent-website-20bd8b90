import { NextResponse } from "next/server";
import { isbot } from "isbot";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Basic in-memory sliding-window rate limiter (per instance; serverless is fine).
const hits: { key: string; ts: number }[] = [];
const RATE_MAX = 60; // events per minute per visitor
const RATE_WINDOW_MS = 60_000;

function rateLimited(key: string): boolean {
  const now = Date.now();
  while (hits.length && now - hits[0].ts > RATE_WINDOW_MS) hits.shift();
  const count = hits.filter((h) => h.key === key).length;
  if (count >= RATE_MAX) return true;
  hits.push({ key, ts: now });
  return false;
}

const CAPS: Record<string, number> = {
  page_path: 500, referrer: 2000, session_id: 128, visitor_id: 128,
  content_type: 60, title: 300, device_type: 40, browser: 80, os: 80,
  country_code: 8, city: 100, referrer_domain: 200, referrer_category: 40,
  utm_source: 120, utm_medium: 120, utm_campaign: 240, utm_term: 240, utm_content: 240,
  excluded_reason: 40, type: 32, source: 40, click_id: 240,
};

function cap(v: unknown, key: string): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return null;
  const max = CAPS[key] ?? 80;
  return v.length > max ? v.slice(0, max) : v;
}

function nonNull(v: string | null): string | null {
  return v === "" ? null : v;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Channel classification, precedence: paid -> email -> social -> organic_search
// -> internal -> referral -> direct (brief §3 channel rules).
const SOCIAL_HOSTS = ["linkedin.com", "lnkd.in", "x.com", "t.co", "facebook.com", "fb.com", "instagram.com", "whatsapp.com", "youtube.com", "reddit.com"];
const SEARCH_HOSTS = ["google.", "bing.", "brave.", "duckduckgo.", "yandex.", "baidu.", "ecosia.", "yahoo."];
const PAYED_MEDIA = ["cpc", "ppc", "paid_social", "paid"];

function classifyChannel(referrerDomain: string | null, utmSource: string | null, utmMedium: string | null, hasClickId: boolean): string {
  const medium = utmMedium?.toLowerCase();
  const source = utmSource?.toLowerCase();
  const host = referrerDomain?.toLowerCase() ?? "";

  if (medium && PAYED_MEDIA.includes(medium)) return "paid";
  if (medium === "email" || source === "email" || source === "newsletter") return "email";
  if (medium === "social") return "social";
  if (hasClickId) return "paid"; // Google Ads auto-tagging, LinkedIn ads, etc.
  if (SOCIAL_HOSTS.some((h) => host === h || host.endsWith("." + h))) return "social";
  if (SEARCH_HOSTS.some((h) => host.startsWith(h))) return "organic_search";
  if (referrerDomain) return "internal"; // resolved by caller against the site host
  return "direct";
}

function hostOf(referrer: string): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

const SITE_HOSTS = ["regentplatform.com", "regent.systems", "www.regentplatform.com"];

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Tracking unavailable: Supabase credentials not configured" }, { status: 503 });
  }

  // Bots are never stored (new traffic; historical bots are flagged in backfill).
  const ua = request.headers.get("user-agent") ?? "";
  if (isbot(ua)) return new NextResponse(null, { status: 204 });

  const body: any = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const visitor = cap(body.visitor_id, "visitor_id") ?? ip;
  if (rateLimited(`${visitor}:${ip}`)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  // Explicit opt-out (cookie set by the AdminSettings toggle / client) — never store.
  if (request.headers.get("cookie")?.includes("regent_opt_out=1")) {
    return new NextResponse(null, { status: 204 });
  }

  const supabase = createServiceClient();

  // Geo from Vercel edge headers (ISO-2 country + city). Never timezone-derived.
  const countryCode = nonNull(cap(request.headers.get("x-vercel-ip-country"), "country_code"));
  const city = nonNull(cap(request.headers.get("x-vercel-ip-city"), "city"));
  const host = request.headers.get("host") ?? "";

  switch (body.kind) {
    case "view":
    case "download":
      return handleView(supabase, body, { countryCode, city, host });
    case "update":
      return handleUpdate(supabase, body);
    case "conversion":
      return handleConversion(supabase, body);
    default:
      return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  }
}

async function handleView(
  supabase: ReturnType<typeof createServiceClient>,
  body: any,
  geo: { countryCode: string | null; city: string | null; host: string }
) {
  const contentType = body.kind === "download" ? "resource_download" : cap(body.content_type, "content_type") ?? "site_view";
  const id = typeof body.id === "string" && UUID_RE.test(body.id) ? body.id : null;
  if (!id) return NextResponse.json({ error: "view id required" }, { status: 400 });

  const contentId = typeof body.content_id === "string" && UUID_RE.test(body.content_id) ? body.content_id : null;
  const pagePath = nonNull(cap(body.page_path, "page_path"));
  const sessionId = nonNull(cap(body.session_id, "session_id"));
  const visitorId = nonNull(cap(body.visitor_id, "visitor_id"));

  // Admin pages are never site traffic. The client hook guards /admin, but the
  // DataFast auto-pageview runs there too and bypasses that guard (it posted
  // /admin rows as site_view), so this server gate is the enforcement point —
  // drop the view before any session row is written.
  if (pagePath && (pagePath === "/admin" || pagePath.startsWith("/admin/"))) {
    return new NextResponse(null, { status: 204 });
  }

  if (!sessionId || !visitorId) return NextResponse.json({ error: "session required" }, { status: 400 });

  const referrer = nonNull(cap(body.referrer, "referrer")) ?? "";
  const referrerDomain = hostOf(referrer);
  const clickId = nonNull(cap(body.gclid, "click_id"))
    ?? nonNull(cap(body.li_fat_id, "click_id"))
    ?? nonNull(cap(body.fbclid, "click_id"))
    ?? nonNull(cap(body.utm_id, "click_id"));
  const utmSource = nonNull(cap(body.utm_source, "utm_source"));
  const utmMedium = nonNull(cap(body.utm_medium, "utm_medium"));
  const isInternal = referrerDomain !== null
    && (SITE_HOSTS.includes(referrerDomain) || referrerDomain === geo.host);
  const referrerCategory = isInternal
    ? "internal"
    : classifyChannel(referrerDomain, utmSource, utmMedium, !!clickId);

  // is_returning: the visitor has an earlier session
  const { count } = await supabase
    .from("analytics_sessions")
    .select("session_id", { count: "exact", head: true })
    .eq("visitor_id", visitorId)
    .neq("session_id", sessionId);
  const isReturning = (count ?? 0) > 0;

  // Upsert session. A fresh session stores full attribution; an existing one
  // only bumps last_seen_at so started_at / landing_path stay first-touch.
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("analytics_sessions")
    .select("session_id")
    .eq("session_id", sessionId)
    .maybeSingle();

  const sessionRow = {
    session_id: sessionId,
    visitor_id: visitorId,
    started_at: now,
    last_seen_at: now,
    landing_path: pagePath,
    referrer_domain: referrerDomain,
    referrer_category: referrerCategory,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: nonNull(cap(body.utm_campaign, "utm_campaign")),
    utm_term: nonNull(cap(body.utm_term, "utm_term")),
    utm_content: nonNull(cap(body.utm_content, "utm_content")),
    country_code: geo.countryCode,
    city: geo.city,
    device_type: nonNull(cap(body.device_type, "device_type")),
    browser: nonNull(cap(body.browser, "browser")),
    os: nonNull(cap(body.os, "os")),
    is_returning: isReturning,
    excluded_reason: null,
  };

  if (existing) {
    await supabase
      .from("analytics_sessions")
      .update({ last_seen_at: now })
      .eq("session_id", sessionId);
  } else {
    await supabase.from("analytics_sessions").insert(sessionRow);
  }

  const { error } = await supabase.from("content_views").insert({
    id,
    content_type: contentType,
    content_id: contentId,
    page_path: pagePath,
    created_at: now,
    session_id: sessionId,
    visitor_id: visitorId,
    device_type: nonNull(cap(body.device_type, "device_type")),
    browser: nonNull(cap(body.browser, "browser")),
    os: nonNull(cap(body.os, "os")),
    referrer: referrer || null,
    referrer_domain: referrerDomain,
    referrer_category: referrerCategory,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: nonNull(cap(body.utm_campaign, "utm_campaign")),
    utm_term: nonNull(cap(body.utm_term, "utm_term")),
    utm_content: nonNull(cap(body.utm_content, "utm_content")),
    country_code: geo.countryCode,
    city: geo.city,
    is_returning: isReturning,
    time_on_page: 0,
    scroll_depth: 0,
  });

  if (error) {
    console.error("track view error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

async function handleUpdate(supabase: ReturnType<typeof createServiceClient>, body: any) {
  const id = typeof body.id === "string" && UUID_RE.test(body.id) ? body.id : null;
  const sessionId = cap(body.session_id, "session_id");
  const visitorId = cap(body.visitor_id, "visitor_id");
  if (!id || !sessionId || !visitorId) return NextResponse.json({ error: "update needs id+session" }, { status: 400 });

  const timeOnPage = Math.max(0, Math.min(1800, Math.round(Number(body.time_on_page) || 0)));
  const scrollDepth = Math.max(0, Math.min(100, Math.round(Number(body.scroll_depth) || 0)));

  // Only the owner may update a view row (no cross-visitor edits)
  const { data, error } = await supabase
    .from("content_views")
    .update({ time_on_page: timeOnPage, scroll_depth: scrollDepth })
    .eq("id", id)
    .eq("session_id", sessionId)
    .eq("visitor_id", visitorId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("track update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "view not found or not yours" }, { status: 404 });

  await supabase
    .from("analytics_sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("session_id", sessionId);

  return NextResponse.json({ ok: true });
}

async function handleConversion(supabase: ReturnType<typeof createServiceClient>, body: any) {
  const type = cap(body.type, "type");
  if (!type || !["newsletter", "inquiry", "resource_access"].includes(type)) {
    return NextResponse.json({ error: "invalid conversion type" }, { status: 400 });
  }
  const sessionId = cap(body.session_id, "session_id");
  const visitorId = cap(body.visitor_id, "visitor_id");
  const refId = typeof body.ref_id === "string" && UUID_RE.test(body.ref_id) ? body.ref_id : null;
  const contentId = typeof body.content_id === "string" && UUID_RE.test(body.content_id) ? body.content_id : null;

  let viewId: string | null = null;
  let content_type: string | null = null;
  let source: string | null = null;

  if (sessionId && visitorId) {
    // Source = the session's first-touch channel snapshot
    const { data: sess } = await supabase
      .from("analytics_sessions")
      .select("referrer_category")
      .eq("session_id", sessionId)
      .maybeSingle();
    source = cap(sess?.referrer_category, "source") ?? null;

    const { data: latest } = await supabase
      .from("content_views")
      .select("id, content_type")
      .eq("session_id", sessionId)
      .eq("visitor_id", visitorId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest) {
      viewId = latest.id;
      content_type = latest.content_type;
    }
  }

  const { error } = await supabase.from("conversion_events").insert({
    type,
    session_id: sessionId ?? null,
    visitor_id: visitorId ?? null,
    view_id: viewId,
    content_type: content_type ?? null,
    content_id: contentId,
    ref_id: refId,
    source,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("track conversion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Legacy compat: stamp the source view (get_conversion_stats / old dashboard)
  if (viewId) {
    await supabase.from("content_views").update({ converted_to: type }).eq("id", viewId);
  }

  return NextResponse.json({ ok: true });
}
