import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ScreenshotFrame } from '@/components/ScreenshotFrame'
import { SERVICES_SCREENS } from '@/lib/screens'

const description =
  'Regent Technologies architects and builds enterprise systems and custom software development for organizations in Uganda and beyond.'

export const metadata: Metadata = {
  title: { absolute: 'Custom Software & Enterprise Systems | Regent Technologies' },
  description,
  openGraph: {
    title: 'Custom Software & Enterprise Systems | Regent Technologies',
    description,
    type: 'website',
    url: '/services/custom-software-development-uganda',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Software & Enterprise Systems | Regent Technologies',
    description,
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/services/custom-software-development-uganda',
  },
}

const faq = [
  {
    question: 'What is custom software development?',
    answer:
      'Custom software development is building software around the specific way an organization works — its data, its workflows, and the rules it operates by — rather than forcing the organization to fit a generic product.',
  },
  {
    question: 'Does Regent develop custom software in Uganda?',
    answer:
      'Yes. Regent Technologies is based in Kampala, Uganda, and designs and builds custom software and enterprise systems for organizations in Uganda and the wider region.',
  },
  {
    question: 'What kinds of systems does Regent build?',
    answer:
      'Regent builds enterprise systems that connect data, workflows and intelligence across an organization — record systems, operations tools, integrations between systems, and the infrastructure that runs them.',
  },
  {
    question: 'Is Axis the only system Regent builds?',
    answer:
      'No. Axis is one system Regent has built and operates. Beyond Axis, Regent designs and builds custom software tailored to the way each organization operates.',
  },
  {
    question: 'How does Regent approach a new custom system?',
    answer:
      'Regent starts from how the organization actually operates — the data it holds and the workflows that move work between teams — and builds a system around that, connected end to end and built to last.',
  },
  {
    question: 'How do I get started with Regent?',
    answer:
      'Book a discovery call. Regent will work with you to understand the work your organization does and where a custom-built system would serve it.',
  },
]

export default function CustomSoftwareDevelopmentPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  const whatWeBuild = [
    {
      item: 'Enterprise systems',
      body: 'Systems that connect an organization’s data, workflows and intelligence into one coherent whole — the record systems and operations tools a business runs on.',
    },
    {
      item: 'Internal systems',
      body: 'The tools an organization operates on day to day: the shared records, approvals and workflows that keep teams from running on separate spreadsheets.',
    },
    {
      item: 'Web applications',
      body: 'Fast, dependable web apps built around real work — applications people actually use, maintained in production long after launch.',
    },
    {
      item: 'AI-powered tools',
      body: 'Intelligence layered onto real operations — where structured data and trained models make decisions easier, not where AI is bolted on for its own sake.',
    },
  ]

  const principles = [
    {
      title: 'Connected data',
      body: 'One source of truth across the organization — every department works against the same records, so nothing falls out of sync.',
    },
    {
      title: 'Connected workflows',
      body: 'Work moves between teams and systems without manual handoffs, so the people doing the work feel the system pulling its weight.',
    },
    {
      title: 'Built to last',
      body: 'Systems are engineered for the long term and operated in production — not shipped as a prototype and abandoned.',
    },
    {
      title: 'Custom, not templated',
      body: 'Every system is built around the way the organization actually operates, not reshaped to fit a generic platform.',
    },
  ]

  const heroShot = SERVICES_SCREENS[0] ?? null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Breadcrumbs items={[{ name: 'Services', href: '/services/custom-software-development-uganda' }]} />

      {/* Hero */}
      <section className="grid-bg border-b border-border">
        <div className="section-container max-w-4xl pb-20 pt-[120px]">
          <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
            <span className="h-px w-8 bg-primary" /> Custom Software & Enterprise Systems
          </div>
          <h1 className="mb-6 font-heading text-[clamp(38px,5vw,64px)] font-semibold leading-[1.04] tracking-[-0.05em] text-text-primary">
            Custom Software and Enterprise Systems
          </h1>
          <p className="max-w-2xl text-lg font-light leading-relaxed text-text-secondary">
            Regent Technologies architects and builds enterprise systems that connect data, workflows and intelligence
            across organizations — and provides custom software development for organizations in Uganda and beyond.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-heading text-[13px] font-medium text-primary-foreground transition-all hover:-translate-y-px hover:shadow-lg"
            >
              Book a Discovery Call →
            </Link>
            <Link
              href="/axis"
              className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-6 py-3 font-heading text-[13px] font-medium text-text-primary hover:border-primary hover:text-primary"
            >
              Explore Axis
            </Link>
          </div>
        </div>
      </section>

      {/* Opening statement */}
      <section className="py-20">
        <div className="section-container max-w-4xl">
          <p className="max-w-2xl font-heading text-2xl font-semibold leading-snug tracking-[-0.02em] text-text-primary md:text-3xl">
            Most software starts from what a product can do. Regent starts from how an organization actually works —
            the data it holds, the workflow that moves work between teams, and the intelligence that turns both into
            decisions.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary">
            That is the difference between buying software and having systems built. Custom software development, done
            properly, means the system fits the operation instead of the operation reshaping itself around the software.
            Regent designs, builds and operates the systems an organization runs on.
          </p>
        </div>
      </section>

      {/* Wide visual slot */}
      <section className="border-y border-border bg-surface py-20">
        <div className="section-container max-w-5xl">
          <ScreenshotFrame shot={heroShot} className="mx-auto w-full" />
        </div>
      </section>

      {/* What Regent builds */}
      <section className="py-20">
        <div className="section-container max-w-4xl">
          <div className="mb-12 max-w-2xl">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">What Regent builds</div>
            <h2 className="mb-4 font-heading text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
              Systems, not software in a box.
            </h2>
            <p className="text-lg font-light leading-relaxed text-text-secondary">
              Regent is an enterprise systems builder. The systems it designs and builds are the records, tools and
              integrations an organization runs on — delivered through custom software development tailored to how that
              organization works.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {whatWeBuild.map((item) => (
              <div key={item.item} className="rounded-xl border border-border bg-surface p-7">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{item.item}</div>
                <p className="text-sm leading-relaxed text-text-secondary">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="border-y border-border bg-surface py-20">
        <div className="section-container max-w-4xl">
          <div className="mb-12 max-w-2xl">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">How Regent approaches building systems</div>
            <h2 className="mb-4 font-heading text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
              Built around the work.
            </h2>
            <p className="text-lg font-light leading-relaxed text-text-secondary">
              Regent builds systems the way it runs its own — starting from the work, connecting it end to end, and
              keeping it running. A few principles hold across every system:
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {principles.map((principle) => (
              <div key={principle.title} className="rounded-xl border border-border bg-background p-7">
                <div className="mb-3 font-heading text-base font-semibold text-text-primary">{principle.title}</div>
                <p className="text-sm leading-relaxed text-text-secondary">{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Axis */}
      <section className="py-20">
        <div className="section-container max-w-4xl">
          <div className="rounded-2xl border border-primary/15 bg-accent-light p-8 md:p-12">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">One system, in production</div>
            <h2 className="mb-4 font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
              Axis — a system Regent built and operates.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary">
              Axis is a business operating system Regent has built and currently operates — one record of clients,
              items and ledger shared across invoicing, accounting, inventory and HR for growing small businesses. It
              is a working example of how Regent builds systems: single source of truth, shared records, nothing out of
              sync. A system is not finished when it ships; it is finished when the organization runs on it. Axis is
              that — running in production, in daily use, and evolving as the businesses using it grow.
            </p>
            <Link
              href="/axis"
              className="mt-6 inline-flex items-center gap-2 font-heading text-[13px] font-medium text-primary transition-all hover:gap-3"
            >
              Explore Axis →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-surface py-20">
        <div className="section-container max-w-3xl">
          <div className="mb-10">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">FAQ</div>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
              Questions about custom software and enterprise systems.
            </h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {faq.map((item) => (
              <div key={item.question} className="py-6">
                <h3 className="mb-2 font-heading text-base font-semibold text-text-primary">{item.question}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="section-container max-w-4xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
            Talk to Regent about the systems your organization runs on.
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base font-light leading-relaxed text-text-secondary">
            Whether you need an enterprise system built end to end or custom software development, Regent starts from
            the work and builds around it.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-heading text-[15px] font-medium text-primary-foreground transition-all hover:-translate-y-px hover:shadow-lg"
          >
            Book a Discovery Call →
          </Link>
        </div>
      </section>
    </>
  )
}
