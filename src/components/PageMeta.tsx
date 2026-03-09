import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  jsonLd?: Record<string, unknown>;
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function PageMeta({ title, description, ogTitle, ogDescription, ogImage, ogType, canonical, jsonLd }: PageMetaProps) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const url = window.location.href;

    setMeta("description", description);
    setMeta("og:title", ogTitle || title, true);
    setMeta("og:description", ogDescription || description, true);
    setMeta("og:type", ogType || "website", true);
    setMeta("og:url", url, true);
    if (ogImage) setMeta("og:image", ogImage, true);

    // Twitter cards
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", ogTitle || title);
    setMeta("twitter:description", ogDescription || description);
    if (ogImage) setMeta("twitter:image", ogImage);

    // Canonical
    let canonicalEl = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", canonical || url);

    // JSON-LD
    let scriptEl = document.querySelector("script[data-page-jsonld]") as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.setAttribute("type", "application/ld+json");
        scriptEl.setAttribute("data-page-jsonld", "true");
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    return () => {
      document.title = prevTitle;
      // Clean up JSON-LD on unmount
      const el = document.querySelector("script[data-page-jsonld]");
      if (el) el.remove();
    };
  }, [title, description, ogTitle, ogDescription, ogImage, ogType, canonical, jsonLd]);

  return null;
}
