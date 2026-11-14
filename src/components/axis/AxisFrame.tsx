import type { ReactNode } from "react";

/**
 * Window chrome for a live Axis app preview: the site's framed look (rounded
 * border + soft shadow + browser-style top bar) around a rendered app screen.
 * Equivalent of `ScreenshotFrame`, but the payload is a React element instead
 * of a next/image screenshot.
 *
 * - `compact` (default): the calm feature-row widget. Content-sized, capped
 *   width, secondary chrome stripped by `.ax-compact` in axis-preview.css.
 * - `compact={false}`: the full-width hero window. Pass `height` (a Tailwind
 *   class) to crop it, and `fade` to dissolve the cropped bottom edge.
 */
export function AxisFrame({
  children,
  caption,
  className = "",
  height = "",
  compact = true,
  fade = false,
}: {
  children: ReactNode;
  caption?: string;
  className?: string;
  height?: string;
  compact?: boolean;
  fade?: boolean;
}) {
  const mask = fade
    ? { WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)", maskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)" }
    : undefined;
  return (
    <figure className={`${height} ${compact ? "ax-compact mx-auto w-full max-w-[700px]" : ""} ${className}`}>
      <div
        className={`flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background ${
          compact ? "shadow-[0_10px_40px_rgba(35,31,94,0.07)]" : "shadow-[0_30px_90px_rgba(35,31,94,0.14)]"
        }`}
        style={mask}
      >
        {/* Browser-style top bar */}
        <div className="flex shrink-0 items-center gap-1.5 border-b border-border bg-surface px-3.5 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-text-muted/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-text-muted/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-text-muted/30" />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full">{children}</div>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
