import type { ReactNode } from "react";
import { AxisInvoicingPreview } from "@/components/axis/AxisInvoicingPreview";
import { AxisInvoiceDetailPreview } from "@/components/axis/AxisInvoiceDetailPreview";
import { AxisLedgerPreview } from "@/components/axis/AxisLedgerPreview";
import { AxisAccountsPreview } from "@/components/axis/AxisAccountsPreview";
import { AxisInventoryPreview } from "@/components/axis/AxisInventoryPreview";
import { AxisCustodyPreview } from "@/components/axis/AxisCustodyPreview";
import { AxisHRPreview } from "@/components/axis/AxisHRPreview";
import { AxisShiftsPreview } from "@/components/axis/AxisShiftsPreview";
import { AxisAttendancePreview } from "@/components/axis/AxisAttendancePreview";

/**
 * Live UI previews for the Axis module pages. Mirrors the `MODULE_SCREENS`
 * slot convention: `hero` fills the hero visual, `features[0..n]` fill the
 * alternating feature rows in order. A module with no entry (or a shorter
 * feature list) simply renders those rows as text-only.
 */
export type AxisPreviewSet = {
  hero: ReactNode;
  /** Sidebar item highlighted in the hero's app window. */
  active: string;
  /** Pixels to scroll the hero sidebar so `active` stays visible. */
  sidebarOffset?: number;
  /** One quiet floating status card that overlaps the hero window. */
  float: { title: string; detail: string; tone: "success" | "warning" | "primary" };
  features: ReactNode[];
};

export const MODULE_PREVIEWS: Record<string, AxisPreviewSet> = {
  invoicing: {
    hero: <AxisInvoicingPreview />,
    active: "Invoices",
    float: { title: "INV-0043 paid", detail: "UGX 4,200,000 · Tekowa Engineering", tone: "success" },
    features: [<AxisInvoiceDetailPreview key="invoice-detail" />, <AxisInvoicingPreview key="invoices-list" />],
  },
  accounting: {
    hero: <AxisLedgerPreview />,
    active: "General Ledger",
    sidebarOffset: 120,
    float: { title: "Entry posted", detail: "Debits and credits balance", tone: "primary" },
    features: [<AxisAccountsPreview key="chart-of-accounts" />, <AxisLedgerPreview key="ledger" />],
  },
  inventory: {
    hero: <AxisInventoryPreview />,
    active: "Inventory",
    float: { title: "Low stock", detail: "Cement (50kg) · 48 left", tone: "warning" },
    features: [<AxisCustodyPreview key="custody" />, <AxisInventoryPreview key="stock-list" />],
  },
  hr: {
    hero: <AxisHRPreview />,
    active: "Employees",
    sidebarOffset: 330,
    float: { title: "Grace Nabirye", detail: "On leave until 19 Nov", tone: "warning" },
    features: [
      <AxisHRPreview key="employees" />,
      <AxisShiftsPreview key="shifts" />,
      <AxisAttendancePreview key="attendance" />,
    ],
  },
};
