import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Icons } from "@/components/Icons";
import { SectionHeader } from "@/components/SectionHeader";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { PageMeta } from "@/components/PageMeta";
import { getAxisPricing, type AxisPlanPricing } from "@/lib/paddle-pricing";

export const metadata: Metadata = {
  title: "Axis Pricing",
  description:
    "Simple, transparent pricing for Axis — Regent's business operations platform. Every plan includes a 7-day free trial.",
  openGraph: {
    title: "Axis Pricing | Regent",
    description:
      "Simple, transparent pricing for Axis — Regent's business operations platform. Every plan includes a 7-day free trial.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axis Pricing | Regent",
    description:
      "Simple, transparent pricing for Axis — Regent's business operations platform. Every plan includes a 7-day free trial.",
  },
  alternates: {
    canonical: "/pricing",
  },
};

const PLAN_FEATURES: Record<AxisPlanPricing["planId"], string[]> = {
  starter: [
    "Invoicing & client management",
    "Core financial tracking",
    "1 organization",
    "Email support",
  ],
  pro: [
    "Everything in Starter",
    "Full double-entry ledger & reports",
    "Inventory & custody tracking",
    "Employee management",
    "Priority support",
  ],
  advanced: [
    "Everything in Pro",
    "Advanced analytics & reporting",
    "Multiple organizations",
    "Dedicated onboarding",
    "Priority support with SLA",
  ],
};

async function getClientIp(): Promise<string | undefined> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim();
}

const PLAN_ORDER: AxisPlanPricing["planId"][] = ["starter", "pro", "advanced"];

const FALLBACK_PLANS: AxisPlanPricing[] = PLAN_ORDER.map((planId) => ({
  planId,
  name: planId.charAt(0).toUpperCase() + planId.slice(1),
  monthly: null,
  yearly: null,
}));


function PlanCard({ plan, featured }: { plan: AxisPlanPricing; featured: boolean }) {
  const monthlyTotal = plan.monthly?.formattedTotal ?? "Contact us";
  const yearlyTotal = plan.yearly?.formattedTotal;

  return (
    <div
      className={`rounded-xl border p-8 flex flex-col ${
        featured
          ? "border-primary bg-surface shadow-lg relative"
          : "border-border bg-background"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-8 font-mono text-[11px] tracking-[0.08em] uppercase bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
          Most Popular
        </span>
      )}
      <h3 className="font-heading text-xl font-semibold text-text-primary mb-1">{plan.name}</h3>

      <div className="mt-4 mb-1">
        <span className="font-heading text-4xl font-bold tracking-[-0.02em] text-text-primary">
          {monthlyTotal}
        </span>
        {plan.monthly && <span className="text-text-secondary text-sm">/month</span>}
      </div>
      {yearlyTotal && (
        <p className="text-sm text-text-muted mb-6">{yearlyTotal} billed annually</p>
      )}
      {!yearlyTotal && <div className="mb-6" />}

      <ul className="space-y-3 mb-8 flex-1">
        {PLAN_FEATURES[plan.planId].map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="mt-0.5 text-primary shrink-0">
              <Icons.Check size={16} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href="https://app.axis.example.com/signup"
        className={`text-center font-heading text-[13px] font-medium tracking-[-0.01em] rounded-lg px-[18px] py-3 transition-all ${
          featured
            ? "bg-primary text-primary-foreground hover:shadow-lg hover:-translate-y-px"
            : "bg-text-primary text-background hover:shadow-lg hover:-translate-y-px"
        }`}
      >
        Start 7-day free trial
      </Link>
    </div>
  );
}

export default async function PricingPage() {
  const ip = await getClientIp();

  let plans: AxisPlanPricing[] = [];
  let pricingUnavailable = false;
  try {
    plans = await getAxisPricing(ip);
  } catch (err) {
    // If Paddle is unreachable or misconfigured, fail soft rather than
    // 500ing the whole page — show the plan/feature breakdown without
    // live prices and point people to start a trial to see current rates.
    console.error("Failed to fetch Axis pricing from Paddle", err);
    pricingUnavailable = true;
    plans = FALLBACK_PLANS;
  }

  return (
    <>
      <PageMeta
        title="Axis Pricing"
        description="Simple, transparent pricing for Axis. Every plan includes a 7-day free trial."
      />
      <div className="section-container py-24">
        <SectionHeader
          label="Pricing"
          title="Simple pricing for every stage"
          subtitle="Every Axis plan includes a 7-day free trial. Cancel anytime. Prices shown reflect your location and are billed in your local currency where available."
          center
        />

        <RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-4">
            {plans.map((plan) => (
              <PlanCard key={plan.planId} plan={plan} featured={plan.planId === "pro"} />
            ))}
          </div>
        </RevealOnScroll>

        {pricingUnavailable && (
          <p className="text-center text-sm text-text-muted mt-8">
            We&rsquo;re having trouble loading live pricing right now. Start a free trial to
            see current rates, or check back shortly.
          </p>
        )}

        <div className="text-center mt-16 text-sm text-text-muted max-w-lg mx-auto">
          <p>
            All plans are billed in USD, GBP, EUR, or AUD depending on your location. Taxes
            calculated at checkout where applicable. See our{" "}
            <Link href="/refund-policy" className="text-primary hover:underline">
              refund policy
            </Link>{" "}
            for details on trials, cancellations, and refunds.
          </p>
        </div>
      </div>
    </>
  );
}
