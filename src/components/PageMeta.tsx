'use client';

import { useEffect } from "react";

interface PageMetaProps {
  /** Deprecated and ignored: titles, descriptions, OG tags and canonicals come from the
   *  server-side Next.js `metadata` / `generateMetadata` exports so crawlers see one version. */
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  jsonLd?: Record<string, unknown>;
}

/** Injects page-level JSON-LD only. Does not touch title, description, OG or canonical tags. */
export function PageMeta({ jsonLd }: PageMetaProps) {
  useEffect(() => {
    if (!jsonLd) return;
    const el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("data-page-jsonld", "true");
    el.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(el);
    return () => el.remove();
  }, [jsonLd]);

  return null;
}
