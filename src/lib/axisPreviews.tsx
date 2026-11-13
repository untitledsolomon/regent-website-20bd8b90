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
export type AxisPreviewSet = { hero: ReactNode; features: ReactNode[] };

export const MODULE_PREVIEWS: Record<string, AxisPreviewSet> = {
  invoicing: {
    hero: <AxisInvoicingPreview />,
    features: [<AxisInvoiceDetailPreview key="invoice-detail" />, <AxisInvoicingPreview key="invoices-list" />],
  },
  accounting: {
    hero: <AxisLedgerPreview />,
    features: [<AxisAccountsPreview key="chart-of-accounts" />, <AxisLedgerPreview key="ledger" />],
  },
  inventory: {
    hero: <AxisInventoryPreview />,
    features: [<AxisCustodyPreview key="custody" />, <AxisInventoryPreview key="stock-list" />],
  },
  hr: {
    hero: <AxisHRPreview />,
    features: [
      <AxisHRPreview key="employees" />,
      <AxisShiftsPreview key="shifts" />,
      <AxisAttendancePreview key="attendance" />,
    ],
  },
};
