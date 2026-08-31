"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem("regent_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("regent_session_id", sid);
  }
  return sid;
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let vid = localStorage.getItem("regent_visitor_id");
  if (!vid) {
    vid = crypto.randomUUID();
    localStorage.setItem("regent_visitor_id", vid);
  }
  return vid;
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

function getTrackingPayload() {
  const { device_type, browser, os } = parseUserAgent();
  const referrer = document.referrer || null;
  const session_id = getSessionId();
  const visitor_id = getVisitorId();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const country = timezone.split("/")[0] || null;
  const city = timezone.split("/")[1]?.replace(/_/g, " ") || null;
  return { device_type, browser, os, referrer, session_id, visitor_id, country, city };
}

async function checkIsReturning(session_id: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await (supabase as any)
    .from("known_sessions")
    .select("session_id")
    .eq("session_id", session_id)
    .maybeSingle();

  if (data) return true;

  await (supabase as any)
    .from("known_sessions")
    .insert({ session_id });

  return false;
}

function trackScrollDepth(): () => number {
  let maxDepth = 0;

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const depth = Math.round((scrollTop / docHeight) * 100);
      if (depth > maxDepth) maxDepth = depth;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", handleScroll);
    return maxDepth;
  };
}

/**
 * Low-level function to track a page view.
 * Returns the view ID so it can be updated later.
 */
export async function trackPageView(contentType: string = 'page', contentId?: string) {
  const supabase = createClient();
  const payload = getTrackingPayload();
  const is_returning = await checkIsReturning(payload.session_id);

  const finalContentId = contentId || (typeof window !== 'undefined' ? window.location.pathname : 'unknown');

  const { data } = await (supabase as any)
    .from("content_views")
    .insert({
      content_type: contentType,
      content_id: finalContentId,
      ...payload,
      is_returning,
      scroll_depth: 0,
      time_on_page: 0,
    })
    .select("id")
    .single();

  return data?.id || null;
}

export function useTrackView(contentType: string, contentId: string | undefined) {
  const supabase = createClient();
  const viewIdRef = useRef<string | null>(null);
  const lastTrackedId = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!contentId || lastTrackedId.current === contentId) return;

    // Reset tracking state for new content
    lastTrackedId.current = contentId;
    viewIdRef.current = null;
    startTimeRef.current = Date.now();

    const payload = getTrackingPayload();
    const stopScrollTracking = trackScrollDepth();

    const insertView = async () => {
      const is_returning = await checkIsReturning(payload.session_id);

      const { data } = await (supabase as any)
        .from("content_views")
        .insert({
          content_type: contentType,
          content_id: contentId,
          ...payload,
          is_returning,
          scroll_depth: 0,
          time_on_page: 0,
        })
        .select("id")
        .single();

      if (data) viewIdRef.current = data.id;
    };

    insertView();

    const heartbeatInterval = setInterval(() => {
      if (!viewIdRef.current) return;
      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
      const scrollDepth = stopScrollTracking();

      supabase
        .from("content_views")
        .update({ time_on_page: timeOnPage, scroll_depth: scrollDepth })
        .eq("id", viewIdRef.current)
        .then(() => {});
    }, 30000);

    const handleUnload = () => {
      if (!viewIdRef.current) return;
      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
      const scrollDepth = stopScrollTracking();

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content_views?id=eq.${viewIdRef.current}`;
      const body = JSON.stringify({ time_on_page: timeOnPage, scroll_depth: scrollDepth });

      fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
        },
        body,
        keepalive: true
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleUnload);

      // Final update on unmount
      if (viewIdRef.current) {
        const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
        const scrollDepth = stopScrollTracking();
        supabase
          .from("content_views")
          .update({ time_on_page: timeOnPage, scroll_depth: scrollDepth })
          .eq("id", viewIdRef.current)
          .then(() => {});
      }
    };
  }, [contentType, contentId]);
}

export async function trackDownload(contentId: string) {
  const supabase = createClient();
  const payload = getTrackingPayload();
  const is_returning = await checkIsReturning(payload.session_id);
  await supabase
    .from("content_views")
    .insert({
      content_type: "resource_download",
      content_id: contentId,
      ...payload,
      is_returning,
      scroll_depth: 0,
      time_on_page: 0,
    });
}

export async function trackConversion(conversionType: "newsletter" | "inquiry" | "resource_access") {
  const supabase = createClient();
  const session_id = getSessionId();
  const { data } = await supabase
    .from("content_views")
    .select("id")
    .eq("session_id", session_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (data) {
    await (supabase as any)
      .from("content_views")
      .update({ converted_to: conversionType })
      .eq("id", data.id);
  }
}
