import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { SectionHeader } from "@/components/SectionHeader";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { PageMeta } from "@/components/PageMeta";
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

const MODULES: { icon: keyof typeof Icons; title: string; description: string }[] = [
  {
    icon: "FileText",
    title: "Invoicing & Clients",
    description:
      "Create, send, and track invoices against a live client record. Every invoice ties directly into your books — no separate reconciliation step.",
  },
  {
    icon: "BarChart",
    title: "Full Ledger Accounting",
    description:
      "A proper double-entry ledger under the hood. Expenses, daily sales, and invoices all post journal entries automatically, and voiding one cleans up the other side too.",
  },
  {
    icon: "Database",
    title: "Inventory & Custody",
    description:
      "Track stock on hand, item sales, and which items are out on custody with a team member — all from the same item records your invoices use.",
  },
  {
    icon: "Building",
    title: "HR & Attendance",
    description:
      "Employee profiles, documents, shift schedules, and attendance tracking, so operations and headcount live in the same place as the money.",
  },
  {
    icon: "Shield",
    title: "Team Roles & Access",
    description:
      "Invite your team into a shared organization with role-based access, so everyone sees exactly the modules relevant to their job.",
  },
  {
    icon: "Zap",
    title: "Multi-Organization",
    description:
      "Run more than one business from a single account on the Advanced plan — useful if you operate several ventures side by side.",
  },
];

export default function AxisPage() {
  return (
    <>
      <PageMeta
        title="Axis"
        description="Regent's all-in-one business operations platform."
      />

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

      <section className="grid-bg border-b border-border">
        <div className="section-container grid gap-12 pb-20 pt-32 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-center lg:gap-20">
          <RevealOnScroll>
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                <span className="h-px w-8 bg-primary" /> Regent Product
              </div>
              <h1 className="mb-6 font-heading text-[clamp(38px,5vw,68px)] font-semibold leading-[1.03] tracking-[-0.05em] text-text-primary">
                The operating system for your business.
              </h1>
              <p className="mb-8 max-w-[600px] text-lg font-light leading-relaxed text-text-secondary">
                Axis is Regent&rsquo;s done-for-you business operations platform for teams who have outgrown spreadsheets and disconnected tools. Invoicing, accounting, inventory, and HR share the same data, so your work stays in sync.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href={AXIS_SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-[18px] py-3 font-heading text-[13px] font-medium text-primary-foreground transition-all hover:-translate-y-px hover:shadow-lg">
                  Start with Axis <Icons.ArrowRight />
                </a>
                <Link href="/axis/pricing" className="inline-flex items-center justify-center rounded-lg border border-border-strong bg-background px-[18px] py-3 font-heading text-[13px] font-medium text-text-primary transition-all hover:border-primary hover:text-primary">
                  See pricing
                </Link>
              </div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">7-day free trial · Cancel anytime</p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.12}>
            <div className="relative rounded-2xl border border-border bg-background p-3 shadow-[0_24px_80px_rgba(35,31,94,0.12)]">
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
                <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="mb-5 flex items-center justify-between text-xs font-medium"><span>Cash flow</span><span className="text-primary">This month</span></div>
                    <div className="flex h-28 items-end gap-2 border-b border-border pb-2">
                      {[35, 48, 42, 64, 56, 78, 68, 91, 74, 85].map((height, index) => <span key={index} className={`flex-1 rounded-t-sm ${index > 6 ? "bg-primary" : "bg-accent-mid/50"}`} style={{ height: `${height}%` }} />)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="mb-4 text-xs font-medium">Today&rsquo;s work</div>
                    <div className="space-y-3 text-[11px] text-text-secondary">
                      <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> 3 invoices sent</div>
                      <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 12 items in stock</div>
                      <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> 4 shifts scheduled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <div id="modules" className="section-container py-24">
        <SectionHeader
          label="What's inside"
          title="One platform, every core operation"
          subtitle="Axis modules aren't bolted together — they share the same clients, items, and ledger, so nothing falls out of sync."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((mod, i) => {
            const Icon = Icons[mod.icon];
            return (
              <RevealOnScroll key={mod.title} delay={i * 0.05}>
                <div className="h-full rounded-xl border border-border bg-surface p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_40px_rgba(35,31,94,0.08)]">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-primary">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-text-primary mb-2">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>

      <div className="border-y border-border bg-surface">
        <div className="section-container grid gap-10 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Built around your work</div>
            <h2 className="mb-4 font-heading text-3xl font-semibold leading-tight tracking-[-0.04em] text-text-primary">One record. Many teams. No hand-offs.</h2>
            <p className="max-w-md text-base leading-relaxed text-text-secondary">Clients, items, invoices, employees, and ledger entries stay connected as your team gets work done.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['01', 'Shared client records', 'Invoices and accounts start from the same source of truth.'],
              ['02', 'Automatic journal entries', 'Daily sales and expenses post to the ledger as work happens.'],
              ['03', 'Role-based access', 'Every team member sees the modules relevant to their job.'],
              ['04', 'Growing organizations', 'Run more than one business from a single account on Advanced.'],
            ].map(([number, title, description]) => (
              <div key={number} className="rounded-lg border border-border bg-background p-5">
                <div className="mb-4 font-mono text-[10px] text-primary">{number}</div>
                <h3 className="mb-2 font-heading text-sm font-semibold text-text-primary">{title}</h3>
                <p className="text-xs leading-relaxed text-text-secondary">{description}</p>
              </div>
            ))}
          </div>
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

      <div className="section-container py-12 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-text-secondary mb-4">Trusted by</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <span className="text-text-secondary">Trevix</span>
            <span className="text-text-secondary">Next Level</span>
            <span className="text-text-secondary">Excom</span>
            <span className="text-text-secondary">Etihad</span>
          </div>
        </div>
      </div>
    </>
  );
}
