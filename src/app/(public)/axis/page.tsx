import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/Icons";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { PageMeta } from "@/components/PageMeta";
import { SectionHeader } from "@/components/SectionHeader";
import { AXIS_SIGNUP_URL } from "@/lib/axis";
import { FAQAccordion } from "./faq-accordion";

export const metadata: Metadata = {
  title: "Axis — Accounting software",
  description:
    "Axis is accounting software built for small businesses in East Africa — invoicing, a real ledger, and reports that make sense, in one place.",
  openGraph: {
    title: "Axis | Regent",
    description:
      "Axis is accounting software built for small businesses in East Africa — invoicing, a real ledger, and reports that make sense, in one place.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axis | Regent",
    description:
      "Axis is accounting software built for small businesses in East Africa — invoicing, a real ledger, and reports that make sense, in one place.",
  },
  alternates: {
    canonical: "/axis",
  },
};

const MODULES = [
  {
    number: "01",
    title: "Invoicing & clients",
    description: "Create, send, and track invoices against a real client list — with statuses that update the moment a payment lands.",
    size: "large",
  },
  {
    number: "02",
    title: "Core ledger",
    description: "A real chart of accounts and journal entries, not just a spreadsheet pretending to be one.",
    size: "small",
  },
  {
    number: "03",
    title: "Reports",
    description: "Profit & loss, cash flow, and trend reports that stay current as you work — no month-end scramble.",
    size: "small",
  },
  {
    number: "04",
    title: "Inventory",
    description: "Track stock levels and cost of goods alongside your finances — not in a separate tool.",
    size: "medium",
  },
  {
    number: "05",
    title: "Employees & HR",
    description: "Staff records, shifts, and attendance, feeding straight into your payroll expense line.",
    size: "medium",
  },
];

export default function AxisPage() {
  return (
    <>
      <PageMeta
        title="Axis"
        description="Accounting software built for small businesses in East Africa."
      />

      {/* Navigation */}
      <div className="hidden border-b border-border bg-background/90 backdrop-blur md:block">
        <div className="section-container flex h-12 items-center justify-between">
          <Link href="/axis" className="font-heading text-sm font-semibold tracking-[-0.02em] text-text-primary">
            Axis<span className="text-primary">.</span>
          </Link>
          <nav className="flex items-center gap-8 text-xs text-text-secondary" aria-label="Axis navigation">
            <a href="#modules" className="transition-colors hover:text-text-primary">
              Modules
            </a>
            <Link href="/axis/pricing" className="transition-colors hover:text-text-primary">
              Pricing
            </Link>
            <a href="#faq" className="transition-colors hover:text-text-primary">
              FAQ
            </a>
          </nav>
          <a
            href={AXIS_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-text-primary px-3 py-1.5 font-medium text-background transition-colors hover:bg-text-primary/90"
          >
            Start free trial
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-[52%_48%]">
          {/* Left: Copy */}
          <div className="relative flex flex-col justify-center px-6 py-16 md:px-10 lg:py-24">
            <RevealOnScroll>
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 font-mono text-[11px] font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                7-day free trial, no card required
              </div>
              <h1 className="max-w-lg text-[42px] font-semibold leading-[1.06] tracking-[-0.02em] text-text-primary md:text-[52px]">
                Run your books without hiring a bookkeeper.
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-text-secondary">
                Axis is accounting software built for small businesses in East Africa — invoicing, a real ledger, and reports that make sense, in one place.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={AXIS_SIGNUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-text-primary px-5 py-3 font-heading text-[14px] font-semibold text-background transition-all hover:-translate-y-px"
                >
                  Start your free trial
                </a>
                <a href="#modules" className="rounded-md border border-border bg-background px-5 py-3 font-heading text-[14px] font-semibold text-text-primary transition-all hover:border-primary">
                  See what&rsquo;s inside
                </a>
              </div>
              <p className="mt-6 text-sm text-text-secondary">
                Starting at <span className="font-semibold text-text-primary">$25/month</span> — cancel anytime.
              </p>
            </RevealOnScroll>
          </div>

          {/* Right: Product Mockup */}
          <div className="relative flex items-center justify-center bg-text-primary px-6 py-16 lg:py-0">
            <RevealOnScroll delay={0.12}>
              <div className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-3 shadow-lg">
                <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
                  <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2 font-heading text-sm font-semibold">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Dashboard
                    </div>
                    <span className="font-mono text-[10px] text-text-muted">This month</span>
                  </div>
                  <div className="mb-5 grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="mb-2 font-mono text-[9px] text-text-muted">Revenue</div>
                      <div className="font-heading text-sm font-semibold text-text-primary">UGX 18.4M</div>
                      <div className="mt-0.5 font-mono text-[10px] text-primary">+12.4%</div>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="mb-2 font-mono text-[9px] text-text-muted">Outstanding</div>
                      <div className="font-heading text-sm font-semibold text-text-primary">UGX 3.1M</div>
                      <div className="mt-0.5 font-mono text-[10px] text-text-muted">6 invoices</div>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="mb-2 font-mono text-[9px] text-text-muted">Net margin</div>
                      <div className="font-heading text-sm font-semibold text-text-primary">34%</div>
                      <div className="mt-0.5 font-mono text-[10px] text-text-muted">vs 31% last</div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="section-container py-20 md:py-28">
        <div className="mb-14 max-w-2xl">
          <div className="font-mono text-[12px] font-medium text-primary">What&rsquo;s inside</div>
          <h2 className="mt-3 font-heading text-[32px] font-semibold leading-[1.1] tracking-[-0.015em] text-text-primary md:text-[38px]">
            Everything your finance function actually needs.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            No bloated feature list. Each module maps to something you already do by hand today.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* Large card */}
          <RevealOnScroll className="md:col-span-4 md:row-span-2" delay={0}>
            <div className="group h-full rounded-xl border border-border bg-surface p-7 transition-all hover:-translate-y-1">
              <div className="font-mono text-[11px] text-text-muted">01</div>
              <h3 className="mt-3 font-heading text-lg font-semibold text-text-primary">Invoicing & clients</h3>
              <p className="mt-2 max-w-sm text-base leading-relaxed text-text-secondary">
                Create, send, and track invoices against a real client list — with statuses that update the moment a payment lands.
              </p>
              <div className="mt-6 space-y-2 rounded-lg border border-border bg-background p-4 font-mono text-[12px]">
                <div className="flex items-center justify-between py-1">
                  <span className="text-text-primary">Next Level Store</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Paid</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-text-primary">Meridian Traders</span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">Sent</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-text-primary">Coastline Retail</span>
                  <span className="rounded-full bg-border px-2 py-0.5 text-[10px] font-medium text-text-muted">Draft</span>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Small cards */}
          <RevealOnScroll className="md:col-span-2" delay={0.05}>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="font-mono text-[11px] text-text-muted">02</div>
              <h3 className="mt-3 font-heading text-base font-semibold text-text-primary">Core ledger</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                A real chart of accounts and journal entries, not just a spreadsheet pretending to be one.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="md:col-span-2" delay={0.1}>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="font-mono text-[11px] text-text-muted">03</div>
              <h3 className="mt-3 font-heading text-base font-semibold text-text-primary">Reports</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Profit & loss, cash flow, and trend reports that stay current as you work.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="md:col-span-3" delay={0.15}>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="font-mono text-[11px] text-text-muted">04</div>
              <h3 className="mt-3 font-heading text-base font-semibold text-text-primary">Inventory</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Track stock levels and cost of goods alongside your finances.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="md:col-span-3" delay={0.2}>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="font-mono text-[11px] text-text-muted">05</div>
              <h3 className="mt-3 font-heading text-base font-semibold text-text-primary">Employees & HR</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Staff records, shifts, and attendance, feeding into payroll expense.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-container py-20 md:py-28">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl">
            <div className="font-mono text-center text-[12px] font-medium text-primary">FAQ</div>
            <h2 className="mt-3 text-center font-heading text-[30px] font-semibold leading-[1.15] tracking-[-0.015em] text-text-primary md:text-[34px]">
              Questions, answered.
            </h2>

            <div className="mt-10 border-y border-border">
              <FAQAccordion />
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-background py-20 md:py-28">
        <RevealOnScroll>
          <div className="section-container mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-[32px] font-semibold leading-[1.15] tracking-[-0.015em] text-text-primary md:text-[38px]">
              Stop reconciling by hand. Start today.
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={AXIS_SIGNUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-text-primary px-6 py-3 font-heading text-[14px] font-semibold text-background transition-all hover:-translate-y-px"
              >
                Start your free trial
              </a>
              <a href="/contact" className="rounded-md border border-border bg-background px-6 py-3 font-heading text-[14px] font-semibold text-text-primary transition-all hover:border-primary">
                Talk to us
              </a>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
