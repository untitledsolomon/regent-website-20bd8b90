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
  // Specific content pages (blog, case studies, resources)
  // already have their own useTrackView calls in their Client components.
  const isContentPage = pathname.startsWith('/blog/') ||
                        pathname.startsWith('/case-studies/') ||
                        pathname.startsWith('/resources/');

  // Use the hook for generic site pages to get full engagement tracking (time on page, etc)
  // We pass undefined if it's a content page to avoid duplicate tracking here.
  useTrackView("site_view", isContentPage ? undefined : pathname);

  return null;
}
