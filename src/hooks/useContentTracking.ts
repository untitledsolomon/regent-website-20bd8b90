"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

const SESSION_KEY = "regent_session_id";
const SESSION_STARTED_KEY = "regent_session_started";
const VISITOR_KEY = "regent_visitor_id";
const CONSENT_KEY = "regent-cookie-consent";
const OPT_OUT_KEY = "regent_opt_out";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min inactivity rollover

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const now = Date.now();
  const existing = localStorage.getItem(SESSION_KEY);
  const startedRaw = localStorage.getItem(SESSION_STARTED_KEY);
  const started = startedRaw ? parseInt(startedRaw, 10) : 0;
  // Shared across tabs via localStorage; a new session after 30 min idle.
  if (existing && started && now - started < SESSION_TTL_MS) return existing;
  const sid = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, sid);
  localStorage.setItem(SESSION_STARTED_KEY, String(now));
  return sid;
}

function consentAccepted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  // A persistent visitor id only after consent (privacy policy §6). Before that,
  // the visitor is scoped to this session and forgettable by clearing it.
  if (consentAccepted()) {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  }
  const scoped = sessionStorage.getItem("regent_session_visitor_id");
  if (scoped) return scoped;
  const vid = crypto.randomUUID();
  sessionStorage.setItem("regent_session_visitor_id", vid);
  return vid;
}

function isOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(OPT_OUT_KEY) === "1" ||
    document.cookie.includes(`${OPT_OUT_KEY}=1`)
  );
}

function parseUserAgent(): { device_type: string; browser: string; os: string } {
  const ua = navigator.userAgent;

  let device_type = "desktop";
  if (/Mobi|Android/i.test(ua)) device_type = "mobile";
  else if (/Tablet|iPad/i.test(ua)) device_type = "tablet";

  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Opera|OPR/i.test(ua)) browser = "Opera";

  let os = "Unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";

  return { device_type, browser, os };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function trackingPayload() {
  const { device_type, browser, os } = parseUserAgent();
  const params = new URLSearchParams(window.location.search);
  return {
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    device_type,
    browser,
    os,
    referrer: document.referrer || null,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
    gclid: params.get("gclid"),
    li_fat_id: params.get("li_fat_id"),
    fbclid: params.get("fbclid"),
  };
}

function splitContentRef(id: string): { content_id: string | null; page_path: string | null } {
  if (UUID_RE.test(id)) return { content_id: id, page_path: null };
  return { content_id: null, page_path: id };
}

async function sendTrack(body: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok && res.status !== 204 && res.status !== 429) {
      console.warn("track:", res.status);
    }
  } catch {
    // analytics must never break the page
  }
}

function sendTrackKeepalive(body: Record<string, unknown>): void {
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([JSON.stringify(body)], { type: "application/json" })
      );
      return;
    }
  } catch {
    // fall through to fetch keepalive
  }
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Max scroll depth tracking. Uses document.scrollingElement (the blog's scroll
 * bug was documentElement-based), recomputes on resize / content height changes,
 * and only counts while the tab is visible.
 */
function trackScrollDepth(): { sample: () => number; stop: () => number } {
  let maxDepth = 0;
  let ro: ResizeObserver | null = null;

  const measure = () => {
    const el = document.scrollingElement || document.documentElement;
    const scrollTop = el.scrollTop;
    const scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable > 0) {
      const depth = Math.round((scrollTop / scrollable) * 100);
      if (depth > maxDepth) maxDepth = Math.min(100, depth);
    }
  };

  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
  }
  measure();

  return {
    sample: () => maxDepth,
    stop: () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      ro?.disconnect();
      return maxDepth;
    },
  };
}

const allowedToTrack = () =>
  !isOptedOut() &&
  !window.location.pathname.startsWith("/admin");

/**
 * Tracks a content view with engagement (time on page, max scroll depth).
 * Fire-and-forget POST to /api/track; updates heartbeat while visible and a
 * final update fires on page hide / unmount. Skips logged-in admins, /admin
 * pages, opted-out browsers, and stores nothing for bots (server-side).
 */
export function useTrackView(contentType: string, contentId: string | undefined) {
  const { user } = useAuth();
  const enabledRef = useRef(false);
  const viewIdRef = useRef<string | null>(null);
  const startRef = useRef(0);
  const trackerRef = useRef<ReturnType<typeof trackScrollDepth> | null>(null);
  const sessionRef = useRef<string>("");
  const visitorRef = useRef<string>("");
  const finalizedRef = useRef(false);

  useEffect(() => {
    finalizedRef.current = false;

    // Logged-in admins, /admin/* and opted-out browsers are never tracked.
    if (user || !allowedToTrack() || !contentId) {
      enabledRef.current = false;
      return;
    }
    enabledRef.current = true;

    const { content_id, page_path } = splitContentRef(contentId);
    const payload = trackingPayload();
    const viewId = crypto.randomUUID();
    viewIdRef.current = viewId;
    sessionRef.current = payload.session_id;
    visitorRef.current = payload.visitor_id;
    startRef.current = Date.now();
    trackerRef.current = trackScrollDepth();

    sendTrack({
      ...payload,
      kind: "view",
      id: viewId,
      content_type: contentType,
      content_id,
      page_path,
    });

    const currentViewId = viewId;
    const heartbeat = setInterval(() => {
      if (document.visibilityState !== "visible" || !viewIdRef.current) return;
      sendTrack({
        kind: "update",
        id: viewIdRef.current,
        session_id: sessionRef.current,
        visitor_id: visitorRef.current,
        time_on_page: Math.round((Date.now() - startRef.current) / 1000),
        scroll_depth: trackerRef.current?.sample() ?? 0,
      });
    }, 20000);

    const onPageHide = () => {
      if (finalizedRef.current || !viewIdRef.current) return;
      finalizedRef.current = true;
      sendTrackKeepalive({
        kind: "update",
        id: currentViewId,
        session_id: sessionRef.current,
        visitor_id: visitorRef.current,
        time_on_page: Math.round((Date.now() - startRef.current) / 1000),
        scroll_depth: trackerRef.current?.stop() ?? 0,
      });
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("pagehide", onPageHide);
      if (!enabledRef.current || finalizedRef.current) return;
      finalizedRef.current = true;
      sendTrackKeepalive({
        kind: "update",
        id: currentViewId,
        session_id: sessionRef.current,
        visitor_id: visitorRef.current,
        time_on_page: Math.round((Date.now() - startRef.current) / 1000),
        scroll_depth: trackerRef.current?.stop() ?? 0,
      });
    };
  }, [contentType, contentId, user]);
}

/**
 * One-shot page view (pages that don't use the hook). Returns the recorded
 * view id or null when tracking is disabled.
 */
export async function trackPageView(contentType = "page", contentId?: string): Promise<string | null> {
  if (!allowedToTrack()) return null;
  const { content_id, page_path } = contentId
    ? splitContentRef(contentId)
    : { content_id: null, page_path: window.location.pathname };
  const viewId = crypto.randomUUID();
  await sendTrack({
    ...trackingPayload(),
    kind: "view",
    id: viewId,
    content_type: contentType,
    content_id,
    page_path,
  });
  return viewId;
}

/** Records a resource download as a resource_download content view. */
export async function trackDownload(contentId: string): Promise<void> {
  if (!allowedToTrack()) return;
  const { content_id } = splitContentRef(contentId);
  await sendTrack({
    ...trackingPayload(),
    kind: "download",
    id: crypto.randomUUID(),
    content_type: "resource_download",
    content_id,
    page_path: null,
  });
}

/**
 * Records a conversion (newsletter / inquiry / resource_access) through
 * /api/track, linking it to the session's channel. ref_id points at the
 * newsletter_subscriber / consultation_request / resource row.
 */
export async function trackConversion(
  type: "newsletter" | "inquiry" | "resource_access",
  refId?: string | null,
  contentId?: string | null
): Promise<void> {
  if (!allowedToTrack()) return;
  const { content_id } = contentId ? splitContentRef(contentId) : { content_id: null };
  await sendTrack({
    ...trackingPayload(),
    kind: "conversion",
    type,
    ref_id: refId ?? null,
    content_id,
  });
}
