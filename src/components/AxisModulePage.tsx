import Link from 'next/link'
import { AXIS_SIGNUP_URL } from '@/lib/axis'
import { AXIS_MODULES, type AxisModule } from '@/lib/axisModules'

export function AxisModulePage({ module }: { module: AxisModule }) {
  const siblings = AXIS_MODULES.filter((m) => m.slug !== module.slug)

  return (
    <>
      {/* Hero */}
      <section className="grid-bg border-b border-border">
        <div className="section-container max-w-4xl pb-20 pt-[120px]">
          <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
            <span className="h-px w-8 bg-primary" /> Axis · {module.name}
          </div>
          <h1 className="mb-6 font-heading text-[clamp(38px,5vw,60px)] font-semibold leading-[1.04] tracking-[-0.05em] text-text-primary">
            {module.h1}
          </h1>
          <p className="max-w-2xl text-lg font-light leading-relaxed text-text-secondary">{module.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={AXIS_SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-[18px] py-3 font-heading text-[13px] font-medium text-primary-foreground transition-all hover:-translate-y-px hover:shadow-lg"
            >
              Start your free trial →
            </a>
            <Link
              href="/axis/pricing"
              className="inline-flex items-center justify-center rounded-lg border border-border-strong px-[18px] py-3 font-heading text-[13px] font-medium text-text-primary transition-all hover:border-primary hover:text-primary"
            >
              See Axis pricing
            </Link>
          </div>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
            Part of Axis by Regent · 7-day free trial, no credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="section-container max-w-4xl">
          <div className="mb-12 max-w-2xl">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
              What Axis {module.name} does
            </div>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
              {module.name} without the busywork.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {module.features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-surface p-7">
                <div className="mb-3 font-heading text-base font-semibold text-text-primary">{feature.title}</div>
                <p className="text-sm leading-relaxed text-text-secondary">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One system */}
      <section className="border-y border-border bg-surface py-20">
        <div className="section-container max-w-4xl">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">One system, one source of truth</div>
          <h2 className="mb-4 font-heading text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
            Axis modules share the same clients, items and ledger.
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-text-secondary">{module.connects}</p>
        </div>
      </section>

      {/* Who it is for */}
      <section className="py-20">
        <div className="section-container max-w-4xl">
          <div className="rounded-2xl border border-border bg-surface p-8 md:p-12">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">Who it is for</div>
            <h2 className="mb-4 font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
              Built for small businesses growing off spreadsheets.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary">{module.whoFor}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-surface py-20">
        <div className="section-container max-w-3xl">
          <div className="mb-10">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">FAQ</div>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
              Questions about Axis {module.name}.
            </h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {module.faq.map((item) => (
              <div key={item.q} className="py-6">
                <h3 className="mb-2 font-heading text-base font-semibold text-text-primary">{item.q}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + cross-links */}
      <section className="section-container border-t border-border py-24">
        <div className="mx-auto mb-14 max-w-4xl rounded-2xl bg-text-primary px-7 py-12 text-center text-background md:px-14 md:py-14">
          <h2 className="mb-4 font-heading text-2xl font-semibold tracking-[-0.02em] text-background md:text-3xl">
            Try Axis {module.name} free for 7 days
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-background/70">
            No setup calls required. See the plans, pick what fits your team, and cancel anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={AXIS_SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-[18px] py-3 font-heading text-[13px] font-medium text-primary-foreground transition-all hover:-translate-y-px hover:shadow-lg"
            >
              Sign up for Axis →
            </a>
            <Link
              href="/axis/pricing"
              className="inline-flex items-center rounded-lg border border-background/20 px-[18px] py-3 font-heading text-[13px] font-medium text-background transition-all hover:border-background/60"
            >
              View Axis pricing
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            Explore the other Axis modules
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {siblings.map((sibling) => (
              <Link
                key={sibling.slug}
                href={`/axis/${sibling.slug}`}
                className="rounded-full border border-border bg-surface px-4 py-2 font-heading text-[12px] font-medium text-text-primary transition-all hover:border-primary hover:text-primary"
              >
                Axis {sibling.name}
              </Link>
            ))}
            <Link
              href="/axis"
              className="rounded-full border border-border-strong px-4 py-2 font-heading text-[12px] font-medium text-text-primary transition-all hover:border-primary hover:text-primary"
            >
              All of Axis
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
