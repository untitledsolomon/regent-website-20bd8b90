import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  // Device type
  let device_type = "desktop";
  if (/Mobi|Android/i.test(ua)) device_type = "mobile";
  else if (/Tablet|iPad/i.test(ua)) device_type = "tablet";

  // Browser
  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Opera|OPR/i.test(ua)) browser = "Opera";

  // OS
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
  // Use timezone as a location proxy
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const country = timezone.split("/")[0] || null;
  const city = timezone.split("/")[1]?.replace(/_/g, " ") || null;

  return { device_type, browser, os, referrer, session_id, country, city };
}

export function useTrackView(contentType: string, contentId: string | undefined) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!contentId || tracked.current) return;
    tracked.current = true;

    const payload = getTrackingPayload();
    supabase
      .from("content_views")
      .insert({ content_type: contentType, content_id: contentId, ...payload })
      .then(() => {});
  }, [contentType, contentId]);
}

export async function trackDownload(contentId: string) {
  const payload = getTrackingPayload();
  await supabase
    .from("content_views")
    .insert({ content_type: "resource_download", content_id: contentId, ...payload });
}
