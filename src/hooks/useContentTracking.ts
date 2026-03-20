"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

function getSessionId(): string {
  let sid = sessionStorage.getItem("regent_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("regent_session_id", sid);
  }
  return sid;
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
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const country = timezone.split("/")[0] || null;
  const city = timezone.split("/")[1]?.replace(/_/g, " ") || null;
  return { device_type, browser, os, referrer, session_id, country, city };
}

async function checkIsReturning(session_id: string): Promise<boolean> {
  const supabase = createClient();
  // Check if this session has been seen before
  const { data } = await (supabase as any)
    .from("known_sessions")
    .select("session_id")
    .eq("session_id", session_id)
    .maybeSingle();

  if (data) return true;

  // First time — record it
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

export function useTrackView(contentType: string, contentId: string | undefined) {
  const supabase = createClient();
  const tracked = useRef(false);
  const viewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!contentId || tracked.current) return;
    tracked.current = true;
    startTimeRef.current = Date.now();

    const payload = getTrackingPayload();
    const stopScrollTracking = trackScrollDepth();

    // Insert initial view record
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

    // On page unload, update with final time_on_page and scroll_depth
    const handleUnload = () => {
      if (!viewIdRef.current) return;
      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
      const scrollDepth = stopScrollTracking();

      // Use sendBeacon for reliability on page unload
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content_views?id=eq.${viewIdRef.current}`;
      const body = JSON.stringify({ time_on_page: timeOnPage, scroll_depth: scrollDepth });
      navigator.sendBeacon(
        url,
        new Blob([body], { type: "application/json" })
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      // Also update on component unmount (SPA navigation)
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

// Call this after a successful newsletter signup or inquiry submission
// Pass the session_id so we can attribute the conversion
export async function trackConversion(conversionType: "newsletter" | "inquiry") {
  const supabase = createClient();
  const session_id = getSessionId();
  // Update the most recent view from this session
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