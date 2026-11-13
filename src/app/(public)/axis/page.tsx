import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { SectionHeader } from "@/components/SectionHeader";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AXIS_SIGNUP_URL } from "@/lib/axis";
import { AxisFrame } from "@/components/axis/AxisFrame";
import Image from "next/image";
import { AxisInvoicingPreview } from "@/components/axis/AxisInvoicingPreview";
import { AxisQuotationsPreview } from "@/components/axis/AxisQuotationsPreview";
import { AxisLedgerPreview } from "@/components/axis/AxisLedgerPreview";
import { AxisInventoryPreview } from "@/components/axis/AxisInventoryPreview";

export const metadata: Metadata = {
  title: { absolute: "Axis by Regent: Business Management Software" },
  description:
    "Axis by Regent is cloud-based ERP and accounting software: quotations, invoices, job orders, delivery notes, ledger accounting and inventory in one system for growing businesses. Try it free for 7 days.",
  openGraph: {
    title: "Axis by Regent: Business Management Software",
    description:
      "Axis by Regent is cloud-based ERP and accounting software: quotations, invoices, job orders, delivery notes, ledger accounting and inventory in one system for growing businesses. Try it free for 7 days.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axis by Regent: Business Management Software",
    description:
      "Axis by Regent is cloud-based ERP and accounting software: quotations, invoices, job orders, delivery notes, ledger accounting and inventory in one system for growing businesses. Try it free for 7 days.",
  },
  alternates: {
    canonical: "/axis",
  },
};

export default function AxisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Axis by Regent",
    alternateName: "Axis",
    url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.regentplatform.com") + "/axis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Axis by Regent is cloud-based ERP and accounting software: quotations, invoices, job orders, delivery notes, ledger accounting and inventory in one system for growing businesses. Try it free for 7 days.",
    offers: {
      "@type": "Offer",
      url:
        (process.env.NEXT_PUBLIC_SITE_URL || "https://www.regentplatform.com") +
        "/axis/pricing",
    },
    brand: {
      "@type": "Organization",
      name: "Regent",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      

      {/* Hero — light split layout matching the rest of the site */}
      <section className="grid-bg relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(79,70,229,0.10),transparent_70%)]" aria-hidden="true" />
        <div className="hidden border-b border-border bg-background/90 backdrop-blur md:block">
          <div className="section-container flex h-12 items-center justify-between">
            <Link href="/axis" className="font-heading text-sm font-semibold tracking-[-0.02em] text-text-primary">Axis<span className="text-primary">.</span></Link>
            <nav className="flex items-center gap-6 text-xs text-text-secondary" aria-label="Axis navigation">
              <a href="#modules" className="transition-colors hover:text-text-primary">Modules</a>
              <Link href="/axis/pricing" className="transition-colors hover:text-text-primary">Pricing</Link>
              <a href={AXIS_SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="rounded-md bg-text-primary px-3 py-1.5 font-medium text-background transition-transform hover:-translate-y-px">Try Axis</a>
            </nav>
          </div>
        </div>

        <div className="section-container relative pb-24 pt-28">
          <RevealOnScroll>
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                <span className="h-px w-8 bg-primary" /> Regent Product <span className="h-px w-8 bg-primary" />
              </div>
              <h1 className="mb-6 font-heading text-[clamp(36px,5vw,60px)] font-semibold leading-[1.05] tracking-[-0.04em] text-text-primary">
                One system for your{" "}
                <span className="font-['Instrument_Serif'] text-[1.12em] font-normal italic text-primary">entire business.</span>
              </h1>
              <p className="mx-auto mb-8 max-w-[560px] text-lg font-light leading-relaxed text-text-secondary">
                Axis is the business operating system from Regent for growing businesses that have outgrown spreadsheets. Invoicing, accounting, inventory, and HR share the same data, so your work stays in sync.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href={AXIS_SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-[18px] py-3 font-heading text-[13px] font-medium text-primary-foreground transition-all hover:-translate-y-px hover:shadow-lg">
                  Start your free trial <Icons.ArrowRight />
                </a>
                <Link href="/axis/pricing" className="inline-flex items-center justify-center rounded-lg border border-border-strong bg-background px-[18px] py-3 font-heading text-[13px] font-medium text-text-primary transition-all hover:border-primary hover:text-primary">
                  See pricing
                </Link>
              </div>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">7-day free trial · No credit card required</p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Hero visual — the real Axis dashboard */}
      <div className="section-container -mt-14 pb-24">
        <RevealOnScroll delay={0.08}>
          <figure className="relative mx-auto max-w-6xl">
            <div className="absolute -inset-x-6 -top-6 bottom-0 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/10 to-transparent blur-2xl" aria-hidden="true" />
            <div className="overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-[0_40px_120px_rgba(35,31,94,0.18)]">
              <div className="overflow-hidden rounded-xl border border-border">
                <Image
                  src="/axis/axis-dashboard.webp"
                  alt="The Axis dashboard: revenue, active clients, outstanding invoices, net profit, a revenue chart, recent activity and inventory status"
                  width={1866}
                  height={928}
                  priority
                  sizes="(min-width: 1152px) 1120px, 100vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </figure>
        </RevealOnScroll>
      </div>

      <div id="modules" className="section-container py-24">
        <SectionHeader
          label="What's inside"
          title="One platform, every core operation"
          subtitle="Axis modules aren't bolted together — they share the same clients, items, and ledger, so nothing falls out of sync."
        />

        {/* Row 1 — Invoicing: text left, screenshot right */}
        <div className="grid gap-12 border-b border-border py-16 lg:grid-cols-[0.9fr_1.15fr] lg:items-center">
          <RevealOnScroll direction="left">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-primary">
                <Icons.FileText size={18} />
              </div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">01 — Invoicing & Clients</div>
              <h3 className="mb-4 font-heading text-2xl font-semibold text-text-primary">Get paid without the busywork</h3>
              <p className="mb-6 max-w-md text-base leading-relaxed text-text-secondary">
                Create, send, and track invoices against a live client record. Every invoice ties directly into your books — no separate reconciliation step.
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Branded PDF invoices in one click</li>
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Auto-linked to client &amp; ledger</li>
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Payment status tracking</li>
              </ul>
            </div>
          </RevealOnScroll>

          {/* Rendered Axis app — invoices list screen */}
          <RevealOnScroll direction="right" delay={0.1}>
            <AxisFrame>
              <AxisInvoicingPreview />
            </AxisFrame>
          </RevealOnScroll>
        </div>

        {/* Row — Orders workflow: quotation -> invoice -> job order -> delivery */}
        <div className="grid gap-12 border-b border-border py-16 lg:grid-cols-[0.9fr_1.15fr] lg:items-center">
          <RevealOnScroll direction="left">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-primary">
                <Icons.FileText size={18} />
              </div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">Orders — Quotations, Job Orders &amp; Delivery</div>
              <h3 className="mb-4 font-heading text-2xl font-semibold text-text-primary">Follow every order from quote to delivery</h3>
              <p className="mb-6 max-w-md text-base leading-relaxed text-text-secondary">
                Send a quotation, invoice the client, track the job internally and record what was delivered. Each document links to the next, so you can trace any order end to end.
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Quotations sent to clients, the same way as invoices</li>
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Internal job orders with your own status stages</li>
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Delivery forms, including partial deliveries</li>
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Cost and margin tracking per job (Pro and above)</li>
              </ul>
            </div>
          </RevealOnScroll>

          {/* Rendered Axis app — quotations / orders screen */}
          <RevealOnScroll direction="right" delay={0.1}>
            <AxisFrame>
              <AxisQuotationsPreview />
            </AxisFrame>
          </RevealOnScroll>
        </div>

        {/* Row 2 — Ledger: screenshot left, text right */}
        <div className="grid gap-12 border-b border-border py-16 lg:grid-cols-[1.15fr_0.9fr] lg:items-center">
          {/* Rendered Axis app — general ledger / journal entries screen */}
          <RevealOnScroll direction="left" delay={0.1} className="order-2 lg:order-1">
            <AxisFrame>
              <AxisLedgerPreview />
            </AxisFrame>
          </RevealOnScroll>

          <RevealOnScroll direction="right" className="order-1 lg:order-2">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-primary">
                <Icons.BarChart size={18} />
              </div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">02 — Full Ledger Accounting</div>
              <h3 className="mb-4 font-heading text-2xl font-semibold text-text-primary">A real double-entry ledger, not a spreadsheet</h3>
              <p className="mb-6 max-w-md text-base leading-relaxed text-text-secondary">
                Expenses, daily sales, and invoices all post journal entries automatically, and voiding one cleans up the other side too.
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Auto-posted journal entries</li>
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Chart of accounts built in</li>
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Void one side, clean up the other</li>
              </ul>
            </div>
          </RevealOnScroll>
        </div>

        {/* Row 3 — Inventory: text left, screenshot right */}
        <div className="grid gap-12 border-b border-border py-16 lg:grid-cols-[0.9fr_1.15fr] lg:items-center">
          <RevealOnScroll direction="left">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-primary">
                <Icons.Database size={18} />
              </div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">03 — Inventory &amp; Custody</div>
              <h3 className="mb-4 font-heading text-2xl font-semibold text-text-primary">Know what&rsquo;s on hand and who has it</h3>
              <p className="mb-6 max-w-md text-base leading-relaxed text-text-secondary">
                Track stock on hand, item sales, and which items are out on custody with a team member — all from the same item records your invoices use.
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Live stock counts</li>
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Custody handoff tracking</li>
                <li className="flex items-center gap-2"><Icons.Check size={14} /> Shared item records with invoicing</li>
              </ul>
            </div>
          </RevealOnScroll>

          {/* Rendered Axis app — inventory / stock list screen */}
          <RevealOnScroll direction="right" delay={0.1}>
            <AxisFrame>
              <AxisInventoryPreview />
            </AxisFrame>
          </RevealOnScroll>
        </div>

        {/* Closing trio — lighter features, no full row needed each */}
        <div className="grid gap-6 py-16 sm:grid-cols-3">
          {[
            { icon: "Building" as const, title: "HR & Attendance", description: "Employee profiles, shifts, and attendance alongside the money." },
            { icon: "Shield" as const, title: "Team Roles & Access", description: "Role-based access so everyone sees only what's relevant to their job." },
            { icon: "Zap" as const, title: "Multi-Organization", description: "Run more than one business from a single account on Advanced." },
          ].map((mod, i) => {
            const Icon = Icons[mod.icon];
            return (
              <RevealOnScroll key={mod.title} delay={i * 0.05}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_40px_rgba(35,31,94,0.08)]">
                  <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light text-primary">
                    <Icon size={16} />
                  </div>
                  <h3 className="mb-2 font-heading text-sm font-semibold text-text-primary">{mod.title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{mod.description}</p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* Explore each Axis module — add-only link row for module coverage */}
        <div className="border-t border-border pt-10">
          <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">Explore each Axis module</div>
          <div className="flex flex-wrap gap-3">
            <Link href="/axis/invoicing" className="rounded-full border border-border bg-surface px-4 py-2 font-heading text-[12px] font-medium text-text-primary transition-all hover:border-primary hover:text-primary">Axis Invoicing</Link>
            <Link href="/axis/accounting" className="rounded-full border border-border bg-surface px-4 py-2 font-heading text-[12px] font-medium text-text-primary transition-all hover:border-primary hover:text-primary">Axis Accounting</Link>
            <Link href="/axis/inventory" className="rounded-full border border-border bg-surface px-4 py-2 font-heading text-[12px] font-medium text-text-primary transition-all hover:border-primary hover:text-primary">Axis Inventory</Link>
            <Link href="/axis/hr" className="rounded-full border border-border bg-surface px-4 py-2 font-heading text-[12px] font-medium text-text-primary transition-all hover:border-primary hover:text-primary">Axis HR</Link>
          </div>
        </div>
      </div>

      <div className="border-y border-border bg-surface">
        <div className="section-container py-20">
          <RevealOnScroll>
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Built around your work</div>
              <h2 className="mb-4 font-heading text-3xl font-semibold leading-tight tracking-[-0.04em] text-text-primary">One record. Many teams. No hand-offs.</h2>
              <p className="mx-auto mb-14 max-w-md text-base leading-relaxed text-text-secondary">Clients, items, invoices, employees, and ledger entries stay connected as your team gets work done.</p>
            </div>
          </RevealOnScroll>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['01', 'Shared client records', 'Invoices and accounts start from the same source of truth.'],
              ['02', 'Automatic journal entries', 'Daily sales and expenses post to the ledger as work happens.'],
              ['03', 'Role-based access', 'Every team member sees the modules relevant to their job.'],
              ['04', 'Growing organizations', 'Run more than one business from a single account on Advanced.'],
            ].map(([number, title, description], i) => (
              <RevealOnScroll key={number} delay={i * 0.06}>
                <div className="flex h-full flex-col rounded-xl border border-border bg-background p-5">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface font-mono text-xs font-medium text-primary">
                    {number}
                  </div>
                  <h3 className="mb-1 font-heading text-sm font-semibold text-text-primary">{title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>

      {/* Get started in 3 steps */}
      <div className="border-y border-border bg-surface">
        <div className="section-container py-24">
          <SectionHeader
            label="Getting started"
            title="Up and running in 3 simple steps"
            subtitle="No setup call and no data migration project. Create your organisation and start working the same day."
            center
          />
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              { n: "01", title: "Create your organisation", body: "Sign up, name your business and set your currency, tax rates and invoice branding.", visual: (
                <div className="space-y-2">
                  {["Business name", "Currency", "Default tax rate"].map((f, i) => (
                    <div key={f} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-[11px]">
                      <span className="text-text-muted">{f}</span>
                      <span className="font-medium text-text-primary">{["Regent Workspace", "UGX", "18% VAT"][i]}</span>
                    </div>
                  ))}
                </div>
              ) },
              { n: "02", title: "Add clients and items", body: "Import or add the clients you bill and the items you sell. Invoices and stock share the same records.", visual: (
                <div className="space-y-2">
                  {[["Tekowa Engineering", "Client"], ["Juba Logistics", "Client"], ["Fuel (petrol)", "Item"]].map(([name, kind]) => (
                    <div key={name} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-[11px]">
                      <span className="font-medium text-text-primary">{name}</span>
                      <span className="rounded-full bg-accent-light px-2 py-0.5 font-mono text-[9px] text-primary">{kind}</span>
                    </div>
                  ))}
                </div>
              ) },
              { n: "03", title: "Send your first invoice", body: "Create it, send a branded PDF and watch it post to your ledger and your client's balance.", visual: (
                <div className="rounded-md border border-border bg-background p-3 text-[11px]">
                  <div className="mb-2 flex items-center justify-between"><span className="font-medium text-text-primary">INV-0001</span><span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] text-emerald-600">sent</span></div>
                  <div className="flex justify-between text-text-muted"><span>Tekowa Engineering</span><span className="font-mono text-text-primary">UGX 4,200,000</span></div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full w-2/3 rounded-full bg-primary" /></div>
                </div>
              ) },
            ].map((step, i) => (
              <RevealOnScroll key={step.n} delay={i * 0.06}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-background p-6">
                  <div className="mb-6 rounded-xl border border-border bg-surface p-4">{step.visual}</div>
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">Step {step.n}</div>
                  <h3 className="mb-2 font-heading text-base font-semibold text-text-primary">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{step.body}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing preview cards */}
      <div className="section-container py-24">
        <SectionHeader
          label="Pricing"
          title="Simple pricing for every stage"
          subtitle="Every plan includes a 7-day free trial. See the full breakdown on the pricing page."
          center
        />
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { name: "Starter", blurb: "For teams getting off spreadsheets.", features: ["Quotations, invoices & client management", "Job orders & delivery forms", "Core financial tracking & ledger", "Basic reports", "1 user"] },
            { name: "Pro", blurb: "For growing teams that need more.", features: ["Everything in Starter", "Advanced reports & analytics", "Inventory tracking", "Job cost & margin tracking", "Up to 5 users"], featured: true },
            { name: "Advanced", blurb: "For teams running complex operations.", features: ["Everything in Pro", "Employee management", "Custom email domain", "Third-party connections", "Up to 20 users"] },
          ].map((plan) => (
            <RevealOnScroll key={plan.name}>
              <div className={`relative flex h-full flex-col rounded-xl border p-7 ${plan.featured ? "border-primary bg-surface shadow-[0_16px_40px_rgba(35,31,94,0.1)]" : "border-border bg-background"}`}>
                {plan.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-primary-foreground">Most popular</span>
                )}
                <h3 className="mb-1 font-heading text-lg font-semibold text-text-primary">{plan.name}</h3>
                <p className="mb-6 text-sm text-text-secondary">{plan.blurb}</p>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Icons.Check size={16} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/axis/pricing" className={`text-center font-heading text-[13px] font-medium rounded-lg px-[18px] py-3 transition-all ${plan.featured ? "bg-primary text-primary-foreground hover:-translate-y-px hover:shadow-lg" : "bg-text-primary text-background hover:-translate-y-px hover:shadow-lg"}`}>
                  See full pricing
                </Link>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      <div className="section-container py-24">
        <SectionHeader
          label="FAQ"
          title="Common questions"
          subtitle="If something's not covered here, ask us directly before you start a trial."
          center
        />
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {[
              ["What is Axis?", "Axis is cloud-based ERP and accounting software built by Regent. It brings quotations, invoices, job orders, delivery forms, ledger accounting and inventory into one system, so your records stay in sync."],
              ["How do I get started?", "Sign up for a 7-day free trial, no credit card required and no setup call needed. You can create your organisation and start adding clients and invoices straight away."],
              ["Which plan do I need?", "Starter covers quotations, invoicing, job orders, delivery forms and core accounting for one user. Pro adds inventory, advanced reports, job costing and up to 5 users. Advanced adds employee management, custom email domains, integrations and up to 20 users."],
              ["Do you help with setup?", "Yes — Regent can help configure Axis for your business beyond what's self-serve. Reach out through the support form and we'll scope it with you."],
            ].map(([q, a], i) => (
              <AccordionItem key={q} value={`faq-${i}`} className="rounded-xl border border-border bg-surface px-6">
                <AccordionTrigger className="py-5 text-left font-heading text-[15px] font-medium text-text-primary hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent forceMount className="pb-5 text-sm leading-[1.7] text-text-secondary">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div className="section-container border-t border-border py-24">
        <RevealOnScroll>
          <div className="mx-auto max-w-4xl rounded-2xl bg-text-primary px-7 py-12 text-center text-background md:px-14 md:py-16">
            <h2 className="mb-4 font-heading text-2xl font-semibold tracking-[-0.02em] text-background md:text-3xl">
              Every plan starts with a 7-day free trial
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-background/70">
              No setup calls required to get started. See the plans, pick what
              fits your team, and cancel anytime.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={AXIS_SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-[18px] py-3 font-heading text-[13px] font-medium text-primary-foreground transition-all hover:-translate-y-px hover:shadow-lg">
                Sign up for Axis <Icons.ArrowRight />
              </a>
              <Link href="/axis/pricing" className="inline-flex items-center rounded-lg border border-background/20 px-[18px] py-3 font-heading text-[13px] font-medium text-background transition-all hover:border-background/60">
                View plans
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </>
  );
}
