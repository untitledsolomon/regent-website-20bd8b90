"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTrackView } from "@/hooks/useContentTracking";

/**
 * NavigationTracker component to handle automatic page view tracking.
 * It listens to route changes and triggers a trackPageView event.
 */
export function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // We only track generic 'page' type here.
  // Specific content detail pages (blog/case-studies/resources with a slug)
  // already have their own useTrackView calls in their Client components,
  // which pass the real content UUID. Index pages (e.g. /blog with no slug)
  // are NOT content detail pages and should still be tracked here.
  const isContentDetailPage = /^\/(blog|case-studies|resources)\/.+/.test(pathname);

  // Use the hook for generic site pages to get full engagement tracking (time on page, etc).
  // contentId here is always a path string, routed to page_path (not content_id) by
  // useContentTracking's splitContentRef — never a real content UUID.
  // We pass undefined if it's a content detail page to avoid duplicate tracking here.
  useTrackView("site_view", isContentDetailPage ? undefined : pathname);

  return null;
}
