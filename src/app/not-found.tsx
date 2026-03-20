import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-[480px] w-full text-center">

        {/* Eyebrow */}
        <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-6">
          404 ERROR
        </div>

        {/* Large number */}
        <div className="font-heading text-[clamp(80px,18vw,160px)] font-semibold tracking-[-0.06em] leading-none text-foreground/10 select-none mb-4">
          404
        </div>

        <h1 className="font-heading text-[clamp(22px,3vw,32px)] font-semibold tracking-[-0.03em] leading-[1.2] text-foreground mb-4">
          Page not found
        </h1>

        <p className="text-[15px] text-muted-foreground leading-[1.7] mb-10">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="font-heading text-[13px] font-medium bg-foreground text-background rounded-lg px-6 py-3 inline-flex items-center gap-2 hover:opacity-90 hover:-translate-y-px transition-all"
          >
            ← Back to Home
          </Link>
          <Link
            href="/blog"
            className="font-heading text-[13px] font-medium text-foreground border border-border rounded-lg px-6 py-3 inline-flex items-center gap-2 hover:bg-muted transition-all"
          >
            Read the Blog
          </Link>
        </div>

      </div>
    </div>
  )
}