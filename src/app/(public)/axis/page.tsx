import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { SectionHeader } from "@/components/SectionHeader";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { PageMeta } from "@/components/PageMeta";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AXIS_SIGNUP_URL } from "@/lib/axis";

export const metadata: Metadata = {
  title: "Axis — Business Operations Platform",
  description:
    "Axis is Regent's all-in-one business operations platform: invoicing, ledger accounting, inventory, and HR in one system built for growing businesses.",
  openGraph: {
    title: "Axis | Regent",
    description:
      "Axis is Regent's all-in-one business operations platform: invoicing, ledger accounting, inventory, and HR in one system built for growing businesses.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axis | Regent",
    description:
      "Axis is Regent's all-in-one business operations platform: invoicing, ledger accounting, inventory, and HR in one system built for growing businesses.",
  },
  alternates: {
    canonical: "/axis",
  },
};

export default function AxisPage() {
  return (
    <>
      <PageMeta
        title="Axis"
        description="Regent's all-in-one business operations platform."
      />

      {/* Hero — light split layout matching the rest of the site */}
      <section className="grid-bg relative overflow-hidden border-b border-border">
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
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-5 flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                <span className="h-px w-8 bg-primary" /> Regent Product <span className="h-px w-8 bg-primary" />
              </div>
              <h1 className="mb-6 font-heading text-[clamp(36px,5vw,60px)] font-semibold leading-[1.05] tracking-[-0.04em] text-text-primary">
                A system to support{" "}
                <span className="rounded-md bg-accent-light px-2 text-primary">running your business.</span>
              </h1>
              <p className="mx-auto mb-8 max-w-[560px] text-lg font-light leading-relaxed text-text-secondary">
                Axis is Regent&rsquo;s done-for-you operations platform for teams who&rsquo;ve outgrown spreadsheets. Invoicing, accounting, inventory, and HR share the same data, so your work stays in sync.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href={AXIS_SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-[18px] py-3 font-heading text-[13px] font-medium text-primary-foreground transition-all hover:-translate-y-px hover:shadow-lg">
                  Start with Axis <Icons.ArrowRight />
                </a>
                <Link href="/axis/pricing" className="inline-flex items-center justify-center rounded-lg border border-border-strong bg-background px-[18px] py-3 font-heading text-[13px] font-medium text-text-primary transition-all hover:border-primary hover:text-primary">
                  See pricing
                </Link>
              </div>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">7-day free trial · Cancel anytime</p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Screenshot showcase — floating device frames, staggered like the reference layouts */}
      <div className="section-container -mt-14 pb-24">
        <RevealOnScroll delay={0.08}>
          <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-2xl border border-border bg-background p-3 shadow-[0_30px_90px_rgba(35,31,94,0.14)]">
              <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
                <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2 font-heading text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-primary" /> Axis workspace</div>
                  <span className="font-mono text-[10px] text-text-muted">MON · 09:41</span>
                </div>
                <div className="mb-5 grid grid-cols-3 gap-3">
                  {["Revenue", "Outstanding", "Stock value"].map((label, index) => (
                    <div key={label} className="rounded-lg border border-border bg-background p-3">
                      <div className="mb-2 text-[10px] text-text-muted">{label}</div>
                      <div className="font-heading text-sm font-semibold text-text-primary">{["$42.8k", "$8.4k", "$19.2k"][index]}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="mb-5 flex items-center justify-between text-xs font-medium"><span>Cash flow</span><span className="text-primary">This month</span></div>
                  <div className="flex h-24 items-end gap-2 border-b border-border pb-2">
                    {[35, 48, 42, 64, 56, 78, 68, 91, 74, 85].map((height, index) => <span key={index} className={`flex-1 rounded-t-sm ${index > 6 ? "bg-primary" : "bg-accent-mid/50"}`} style={{ height: `${height}%` }} />)}
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary floating panel, positioned like the offset detail-card in the reference */}
            <div className="rounded-2xl border border-border bg-background p-3 shadow-[0_30px_90px_rgba(35,31,94,0.14)] sm:mt-10">
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-4 text-xs font-medium text-text-primary">Today&rsquo;s work</div>
                <div className="space-y-3 text-[11px] text-text-secondary">
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> 3 invoices sent</div>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 12 items in stock</div>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> 4 shifts scheduled</div>
                </div>
                <div className="mt-5 rounded-lg border border-border bg-background p-3">
                  <div className="mb-2 text-[10px] text-text-muted">Team</div>
                  <div className="flex -space-x-2">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="h-7 w-7 rounded-full border-2 border-background bg-accent-light" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      <div id="modules" className="section-container py-24">
        <SectionHeader
          label="What's inside"
          title="One platform, every core operation"
          subtitle="Axis modules aren't bolted together — they share the same clients, items, and ledger, so nothing falls out of sync."
        />

        {/* Row 1 — Invoicing: text left, screenshot right */}
        <div className="grid gap-12 border-b border-border py-16 lg:grid-cols-2 lg:items-center">
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

          {/* TODO: swap for a real product screenshot (Invoice detail view) */}
          <RevealOnScroll direction="right" delay={0.1}>
            <div className="rounded-2xl border border-border bg-background p-3 shadow-[0_24px_70px_rgba(35,31,94,0.1)]">
              <div className="rounded-xl border border-border bg-surface p-5">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <span className="font-heading text-sm font-semibold text-text-primary">Invoice #1042</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-600">Paid</span>
                </div>
                <div className="space-y-3 text-xs text-text-secondary">
                  <div className="flex justify-between"><span>Client</span><span className="text-text-primary">Retail Co.</span></div>
                  <div className="flex justify-between"><span>Amount</span><span className="text-text-primary">$4,200.00</span></div>
                  <div className="flex justify-between"><span>Due</span><span className="text-text-primary">Sep 12, 2026</span></div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* Row 2 — Ledger: screenshot left, text right */}
        <div className="grid gap-12 border-b border-border py-16 lg:grid-cols-2 lg:items-center">
          {/* TODO: swap for a real product screenshot (Journal entries / ledger view) */}
          <RevealOnScroll direction="left" delay={0.1} className="order-2 lg:order-1">
            <div className="rounded-2xl border border-border bg-background p-3 shadow-[0_24px_70px_rgba(35,31,94,0.1)]">
              <div className="rounded-xl border border-border bg-surface p-5">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <span className="font-heading text-sm font-semibold text-text-primary">Journal entries</span>
                  <span className="font-mono text-[10px] text-text-muted">Auto-posted</span>
                </div>
                <div className="space-y-2">
                  {[
                    ["Invoice #1042 — Client A", "+$4,200"],
                    ["Daily sales — retail", "+$1,180"],
                    ["Office supplies", "−$96"],
                  ].map(([label, amt]) => (
                    <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5 text-xs">
                      <span className="text-text-primary">{label}</span>
                      <span className={`font-mono ${amt.startsWith("+") ? "text-emerald-600" : "text-text-secondary"}`}>{amt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
        <div className="grid gap-12 border-b border-border py-16 lg:grid-cols-2 lg:items-center">
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

          {/* TODO: swap for a real product screenshot (Inventory / stock overview) */}
          <RevealOnScroll direction="right" delay={0.1}>
            <div className="rounded-2xl border border-border bg-background p-3 shadow-[0_24px_70px_rgba(35,31,94,0.1)]">
              <div className="rounded-xl border border-border bg-surface p-5">
                <div className="mb-4 text-sm font-semibold text-text-primary">Stock overview</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <div className="text-text-muted">On hand</div>
                    <div className="font-semibold text-text-primary">312 units</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <div className="text-text-muted">In custody</div>
                    <div className="font-semibold text-text-primary">18 units</div>
                  </div>
                </div>
              </div>
            </div>
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
            { name: "Starter", blurb: "For teams getting off spreadsheets.", features: ["Invoicing & client management", "Core financial tracking & ledger", "Basic reports", "1 organization"] },
            { name: "Pro", blurb: "For growing teams that need more.", features: ["Everything in Starter", "Advanced reports & analytics", "Inventory tracking", "Priority support"], featured: true },
            { name: "Advanced", blurb: "For teams running complex operations.", features: ["Everything in Pro", "Employee management", "Custom email domain", "Third-party connections"] },
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
              ["What is Axis?", "Axis is Regent's business operations platform — invoicing, ledger accounting, inventory, and HR in one system, set up and supported by Regent for your team."],
              ["How do I get started?", "Start a 7-day free trial from the pricing page, no setup call required. Pick the plan that fits your team and cancel anytime during the trial."],
              ["Which plan do I need?", "Starter covers invoicing and core accounting. Pro adds inventory tracking and advanced reports. Advanced adds employee management, custom email domains, and integrations."],
              ["Do you help with setup?", "Yes — Regent can help configure Axis for your business beyond what's self-serve. Reach out through the support form and we'll scope it with you."],
            ].map(([q, a], i) => (
              <AccordionItem key={q} value={`faq-${i}`} className="rounded-xl border border-border bg-surface px-6">
                <AccordionTrigger className="py-5 text-left font-heading text-[15px] font-medium text-text-primary hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-[1.7] text-text-secondary">
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
