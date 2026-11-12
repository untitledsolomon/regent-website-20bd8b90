import Image from 'next/image'
import type { Screen } from '@/lib/screens'

/**
 * A framed product screenshot: rounded border, subtle browser-style top bar
 * and an optional caption. Rendered with next/image (explicit width/height,
 * alt required). `priority` preloads the image and is meant for the first
 * hero visual; every other slot lazy-loads.
 *
 * When `shot` is null the frame renders nothing, so a page with empty
 * screenshot arrays is just the text layout — no gaps, no placeholders.
 */
export function ScreenshotFrame({
  shot,
  priority = false,
  className = '',
}: {
  shot: Screen | null
  priority?: boolean
  className?: string
}) {
  if (!shot) return null

  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-[0_24px_70px_rgba(35,31,94,0.1)]">
        {/* Browser-style top bar */}
        <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-text-muted/40" />
          <span className="h-2 w-2 rounded-full bg-text-muted/40" />
          <span className="h-2 w-2 rounded-full bg-text-muted/40" />
        </div>
        <Image
          src={shot.src}
          alt={shot.alt}
          width={shot.width ?? 1200}
          height={shot.height ?? 675}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className="h-auto w-full"
        />
      </div>
      {shot.caption && (
        <figcaption className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
          {shot.caption}
        </figcaption>
      )}
    </figure>
  )
}
