import type { AxisPlanPricing } from "@/lib/paddle-pricing";
import { Fragment } from "react";
import { Icons } from "@/components/Icons";

/**
 * QuickBooks-style plan comparison table for /axis/pricing: feature rows
 * grouped by category, a column per plan with the live price in the header,
 * and the featured (Pro) column highlighted.
 */

const PLAN_COLUMNS: AxisPlanPricing["planId"][] = ["starter", "pro", "advanced"];

type Cell = boolean | string;

const PLAN_COMPARISON: { category: string; rows: { label: string; values: [Cell, Cell, Cell] }[] }[] = [
  {
    category: "Core business",
    rows: [
      { label: "Quotations & client management", values: [true, true, true] },
      { label: "Job orders & delivery forms", values: [true, true, true] },
      { label: "Invoices with branded PDF", values: [true, true, true] },
      { label: "Organizations", values: ["1", "1", "Multi-org"] },
      { label: "Users", values: ["1", "Up to 5", "Up to 20"] },
    ],
  },
  {
    category: "Accounting & reporting",
    rows: [
      { label: "Double-entry ledger with chart of accounts", values: [true, true, true] },
      { label: "Auto-posted journal entries", values: [true, true, true] },
      { label: "Basic reports (trial balance)", values: [true, true, true] },
      { label: "Advanced reports & analytics", values: [false, true, true] },
      { label: "Job cost & margin tracking", values: [false, true, true] },
    ],
  },
  {
    category: "Inventory & jobs",
    rows: [
      { label: "Inventory tracking", values: [false, true, true] },
      { label: "Asset custody & lifecycle", values: [false, true, true] },
      { label: "Shared item records with invoicing", values: [true, true, true] },
    ],
  },
  {
    category: "People & access",
    rows: [
      { label: "Employee management", values: [false, false, true] },
      { label: "Shifts & attendance", values: [false, false, true] },
      { label: "Role-based team access", values: [true, true, true] },
    ],
  },
  {
    category: "Support & commitment",
    rows: [
      { label: "Email support", values: [true, true, true] },
      { label: "Priority support", values: [false, true, false] },
      { label: "Priority support with SLA", values: [false, false, true] },
      { label: "7-day free trial, no card required", values: [true, true, true] },
    ],
  },
];

function CellMark({ value, featured }: { value: Cell; featured: boolean }) {
  if (value === true) {
    return (
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
          featured ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        <Icons.Check size={13} />
      </span>
    );
  }
  if (value === false) {
    return <span className="text-text-muted">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-[13px] text-text-primary">
      {value}
    </span>
  );
}

export function AxisPricingTable({ plans }: { plans: AxisPlanPricing[] }) {
  const byId = new Map(plans.map((p) => [p.planId, p]));

  return (
    <div className="mt-20" id="compare">
      <div className="mb-8 text-center">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
          Compare plans
        </div>
        <h2 className="mx-auto max-w-xl font-heading text-3xl font-semibold tracking-[-0.04em] text-text-primary">
          Every tier, feature by feature.
        </h2>
      </div>

      <div className="mx-auto max-w-5xl overflow-x-auto rounded-2xl border border-border bg-background">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="w-1/3 px-6 py-5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                Feature
              </th>
              {PLAN_COLUMNS.map((planId) => {
                const plan = byId.get(planId);
                const featured = planId === "pro";
                return (
                  <th key={planId} className={`px-6 py-5 text-center ${featured ? "bg-primary/5" : ""}`}>
                    {featured && (
                      <div className="mb-2 inline-block rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-primary-foreground">
                        Most Popular
                      </div>
                    )}
                    <div className="font-heading text-sm font-semibold text-text-primary">
                      {plan ? plan.name : planId.charAt(0).toUpperCase() + planId.slice(1)}
                    </div>
                    <div className="mt-1 font-heading text-2xl font-bold text-text-primary">
                      {plan?.monthly?.formattedTotal ?? "—"}
                      {plan?.monthly && <span className="text-sm font-normal text-text-muted">/mo</span>}
                    </div>
                    {plan?.yearly && (
                      <div className="mt-0.5 text-[11px] text-text-muted">
                        {plan.yearly.formattedTotal} billed annually
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARISON.map((group) => (
              <Fragment key={group.category}>
                <tr key={group.category} className="border-t border-border bg-surface">
                  <td
                    colSpan={4}
                    className="px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary"
                  >
                    {group.category}
                  </td>
                </tr>
                {group.rows.map((row, i) => (
                  <tr key={row.label} className="border-b border-border last:border-b-0 odd:bg-background even:bg-surface/60">
                    <td className="px-6 py-3.5 text-sm text-text-primary">{row.label}</td>
                    {row.values.map((value, j) => {
                      const featured = PLAN_COLUMNS[j] === "pro";
                      return (
                        <td key={j} className={`px-6 py-3.5 text-center ${featured ? "bg-primary/5" : ""}`}>
                          <CellMark value={value} featured={featured && value === true} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mx-auto mt-6 max-w-xl text-center text-sm text-text-muted">
        Not sure which plan fits? Start the free trial on Starter and upgrade as your team
        grows — every plan is billed monthly or yearly and you can cancel anytime.
      </p>
    </div>
  );
}
