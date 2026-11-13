import type { ReactNode } from "react";

/**
 * Window chrome for a live Axis app preview: the site's framed look (rounded
 * border + soft shadow + browser-style top bar) around a rendered app screen.
 * Equivalent of `ScreenshotFrame`, but the payload is a React element instead
 * of a next/image screenshot.
 *
 * The frame pins a fixed height (a Tailwind class via `height`) so every
 * preview keeps screenshot-style proportions instead of growing to the
 * screen's natural height. Content wider than the frame scrolls horizontally;
 * content taller than the frame is clipped at the bottom, like a real app
 * window. `className` positions the frame in the layout without changing its
 * height.
 */
export function AxisFrame({
  children,
  caption,
  className = "",
  height = "h-[380px] sm:h-[440px]",
}: {
  children: ReactNode;
  caption?: string;
  className?: string;
  height?: string;
}) {
  return (
    <figure className={`${height} ${className}`}>
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-[0_24px_70px_rgba(35,31,94,0.1)]">
        {/* Browser-style top bar */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-text-muted/40" />
          <span className="h-2 w-2 rounded-full bg-text-muted/40" />
          <span className="h-2 w-2 rounded-full bg-text-muted/40" />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full min-w-[320px] overflow-x-auto">{children}</div>
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
