import Link from 'next/link'
import { AXIS_SIGNUP_URL } from '@/lib/axis'
import { AXIS_MODULES, type AxisModule } from '@/lib/axisModules'
import { MODULE_SCREENS } from '@/lib/screens'
import { MODULE_PREVIEWS } from '@/lib/axisPreviews'
import { ScreenshotFrame } from '@/components/ScreenshotFrame'
import { AxisFrame } from '@/components/axis/AxisFrame'
import { AxisAppShell } from '@/components/axis/AxisAppShell'
import { STEP_VISUALS } from '@/lib/axisSteps'
import { Icons } from '@/components/Icons'
import { SectionHeader } from '@/components/SectionHeader'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

function HeroText({ module }: { module: AxisModule }) {
  return (
    <>
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
    </>
  )
}

export function AxisModulePage({ module }: { module: AxisModule }) {
  const siblings = AXIS_MODULES.filter((m) => m.slug !== module.slug)
  const shots = MODULE_SCREENS[module.slug] ?? []
  const heroShot = shots[0] ?? null
  const featureShots = shots.slice(1)
  const previews = MODULE_PREVIEWS[module.slug]
  const heroElement = previews?.hero ?? null
  const featureElements = previews?.features ?? []

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: module.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero — text left, screenshot slot right on desktop (below on mobile) */}
      <section className="grid-bg border-b border-border">
        <div className="section-container pb-20 pt-[120px]">
          {heroShot || heroElement ? (
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <HeroText module={module} />
              </div>
              <div className="lg:pl-6">
                {heroElement && previews ? (
                  <div className="relative">
                    <div className="absolute -inset-x-4 -inset-y-6 -z-10 rounded-[2rem] bg-primary/10 blur-3xl" aria-hidden="true" />
                    <AxisFrame compact={false}>
                      <AxisAppShell active={previews.active} sidebarOffset={previews.sidebarOffset}>
                        {heroElement}
                      </AxisAppShell>
                    </AxisFrame>
                    <div className="absolute -bottom-8 -left-9 hidden items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-[0_12px_40px_rgba(35,31,94,0.12)] sm:flex">
                      <span className={`h-2 w-2 rounded-full ${previews.float.tone === 'success' ? 'bg-emerald-500' : previews.float.tone === 'warning' ? 'bg-amber-500' : 'bg-primary'}`} />
                      <span>
                        <span className="block font-heading text-[12px] font-semibold text-text-primary">{previews.float.title}</span>
                        <span className="block text-[11px] text-text-muted">{previews.float.detail}</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <ScreenshotFrame shot={heroShot} priority />
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl">
              <HeroText module={module} />
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface py-20">
        <div className="section-container max-w-5xl">
          <div className="mb-12 max-w-2xl">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
              How it works
            </div>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
              How Axis {module.name} works day to day.
            </h2>
          </div>
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {module.howItWorks.map((step, index) => (
              <li key={step.title} className="flex h-full flex-col rounded-2xl border border-border bg-background p-5">
                {STEP_VISUALS[module.slug]?.[index] && (
                  <div className="mb-5 rounded-xl border border-border bg-surface p-3">{STEP_VISUALS[module.slug][index]}</div>
                )}
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                  Step {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold text-text-primary">{step.title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What it replaces */}
      <section className="py-20">
        <div className="section-container max-w-4xl">
          <div className="rounded-2xl border border-border bg-surface p-8 md:p-12">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">What it replaces</div>
            <h2 className="mb-4 font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
              The busywork {module.name} removes.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary">{module.whatItReplaces}</p>
          </div>
        </div>
      </section>

      {/* Features — alternating rows with optional per-row screenshot slot */}
      <section className="border-y border-border py-20">
        <div className="section-container max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
              What Axis {module.name} does
            </div>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
              {module.name} without the busywork.
            </h2>
          </div>
          <div>
            {module.features.map((feature, index) => {
              const Icon = Icons[feature.icon]
              const shot = featureShots[index] ?? null
              const element = featureElements[index] ?? null
              const hasVisual = Boolean(shot || element)
              const flip = index % 2 === 1
              const text = (
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-primary">
                    <Icon size={18} />
                  </div>
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                    {String(index + 1).padStart(2, '0')} — Axis {module.name}
                  </div>
                  <h3 className={`mb-3 font-heading text-2xl font-semibold text-text-primary ${hasVisual ? 'max-w-md' : ''}`}>
                    {feature.title}
                  </h3>
                  <p className="mb-6 max-w-md text-base leading-relaxed text-text-secondary">{feature.body}</p>
                </div>
              )

              return hasVisual ? (
                <div key={feature.title} className="grid grid-cols-1 gap-10 border-t border-border py-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                  <div className={flip ? 'lg:order-2' : ''}>{text}</div>
                  <div className={flip ? 'lg:order-1' : ''}>
                    {element ? (
                      <AxisFrame>{element}</AxisFrame>
                    ) : (
                      <ScreenshotFrame shot={shot} />
                    )}
                  </div>
                </div>
              ) : (
                <div key={feature.title} className="border-t border-border py-10">
                  {text}
                </div>
              )
            })}
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
              Built for growing small businesses off spreadsheets.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary">{module.whoFor}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-background py-20">
        <div className="section-container max-w-3xl">
          <SectionHeader
            label="FAQ"
            title={`Questions about Axis ${module.name}.`}
            subtitle="If something's not covered here, ask us directly before you start a trial."
          />
          <Accordion type="single" collapsible className="space-y-3">
            {module.faq.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`faq-${i}`}
                className="rounded-xl border border-border bg-surface px-6"
              >
                <AccordionTrigger className="py-5 text-left font-heading text-[15px] font-medium text-text-primary hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent
                  forceMount
                  className="pb-5 text-sm leading-[1.7] text-text-secondary"
                >
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
            How {module.name} connects to the other Axis modules
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {siblings.map((sibling) => (
              <Link
                key={sibling.slug}
                href={`/axis/${sibling.slug}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-4 font-heading text-[13px] font-medium text-text-primary transition-all hover:border-primary hover:text-primary"
              >
                <span className="text-primary"><Icons.ArrowRight size={16} /></span>
                Axis {sibling.name}
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/axis" className="font-heading text-[12px] font-medium text-text-secondary transition-colors hover:text-primary">
              All of Axis →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
