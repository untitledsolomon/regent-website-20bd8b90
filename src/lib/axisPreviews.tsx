import type { ReactNode } from "react";
import { AxisInvoicingPreview } from "@/components/axis/AxisInvoicingPreview";
import { AxisInvoiceDetailPreview } from "@/components/axis/AxisInvoiceDetailPreview";
import { AxisLedgerPreview } from "@/components/axis/AxisLedgerPreview";
import { AxisAccountsPreview } from "@/components/axis/AxisAccountsPreview";
import { AxisInventoryPreview } from "@/components/axis/AxisInventoryPreview";
import { AxisCustodyPreview } from "@/components/axis/AxisCustodyPreview";
import { AxisHRPreview } from "@/components/axis/AxisHRPreview";
import { AxisFlowPreview } from "@/components/axis/AxisFlowPreview";
import { AxisPaymentsPreview } from "@/components/axis/AxisPaymentsPreview";
import { AxisLogPreview } from "@/components/axis/AxisLogPreview";
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
    hero: <AxisInvoicingPreview rows={6} />,
    active: "Invoices",
    float: { title: "INV-0043 paid", detail: "UGX 4,200,000 · Tekowa Engineering", tone: "success" },
    features: [
      <AxisInvoiceDetailPreview key="invoice-detail" />,
      <AxisFlowPreview key="quote-flow" title="Quotation to invoice" steps={[
        { label: "QUO-0121 accepted", detail: "Juba Logistics", meta: "UGX 2,750,000" },
        { label: "Convert to invoice", detail: "Same lines, same client, nothing retyped" },
        { label: "INV-0044 sent", detail: "Branded PDF goes to the client" },
      ]} />,
      <AxisFlowPreview key="links" title="Linked on send" steps={[
        { label: "INV-0043 sent", detail: "Tekowa Engineering", meta: "UGX 4,200,000" },
        { label: "Client balance", detail: "Tekowa Engineering owes UGX 4,200,000" },
        { label: "Ledger entry", detail: "Receivables up, sales revenue up" },
      ]} />,
      <AxisPaymentsPreview key="payments" />,
      <AxisInventoryPreview key="items" />,
    ],
  },
  accounting: {
    hero: <AxisLedgerPreview rows={5} />,
    active: "General Ledger",
    sidebarOffset: 120,
    float: { title: "Entry posted", detail: "Debits and credits balance", tone: "primary" },
    features: [
      <AxisLedgerPreview key="ledger" />,
      <AxisAccountsPreview key="chart-of-accounts" />,
      <AxisFlowPreview key="invoice-posts" title="Invoice to ledger" steps={[
        { label: "INV-0043 sent", detail: "Tekowa Engineering", meta: "UGX 4,200,000" },
        { label: "Journal entry posted", detail: "Debit receivables, credit sales revenue" },
        { label: "Reports updated", detail: "Profit and balances move straight away" },
      ]} />,
      <AxisFlowPreview key="void" title="Voiding an invoice" steps={[
        { label: "INV-0042 voided", detail: "Juba Logistics", meta: "UGX 2,750,000" },
        { label: "Reversal posted", detail: "The linked journal entry is voided too" },
        { label: "Books stay balanced", detail: "Debits and credits still match" },
      ]} />,
      <AxisFlowPreview key="hub" title="One ledger" steps={[
        { label: "Invoices", detail: "Posted when sent" },
        { label: "Expenses and daily sales", detail: "Posted when recorded" },
        { label: "General ledger", detail: "One place to read and reconcile everything" },
      ]} />,
    ],
  },
  inventory: {
    hero: <AxisInventoryPreview rows={6} />,
    active: "Inventory",
    float: { title: "Low stock", detail: "Cement (50kg) · 48 left", tone: "warning" },
    features: [
      <AxisInventoryPreview key="stock-list" />,
      <AxisCustodyPreview key="custody" />,
      <AxisFlowPreview key="shared-items" title="One item record" steps={[
        { label: "Fuel (petrol)", detail: "Added once in inventory", meta: "UGX 5,200" },
        { label: "Used on INV-0043", detail: "Picked from the same list when invoicing" },
        { label: "212 L on hand", detail: "Stock reflects the sale" },
      ]} />,
      <AxisLogPreview key="moves" title="Stock movements" rows={[
        { title: "Fuel (petrol)", detail: "Sold on INV-0043", delta: "−40 L", when: "Today" },
        { title: "Cement (50kg)", detail: "Received on PO-0002", delta: "+120", when: "Yesterday" },
        { title: "Laptop · HP ProBook", detail: "Issued on custody", delta: "−1", when: "9 Nov" },
      ]} />,
      <AxisLogPreview key="history" title="Cement (50kg) history" rows={[
        { title: "Item created", detail: "Opening stock added", delta: "+200", when: "2 Sep" },
        { title: "Sold", detail: "INV-0036", delta: "−32", when: "21 Oct" },
        { title: "Price updated", detail: "UGX 46,000 to UGX 48,000", when: "3 Nov" },
        { title: "Counted", detail: "Matches the record", when: "10 Nov" },
      ]} />,
    ],
  },
  hr: {
    hero: <AxisHRPreview rows={5} />,
    active: "Employees",
    sidebarOffset: 330,
    float: { title: "Grace Nabirye", detail: "On leave until 19 Nov", tone: "warning" },
    features: [
      <AxisHRPreview key="employees" />,
      <AxisShiftsPreview key="shifts" />,
      <AxisAttendancePreview key="attendance" />,
      <AxisFlowPreview key="money" title="People and the books" steps={[
        { label: "Naomi Alimo", detail: "Field Supervisor · Operations" },
        { label: "Shifts and attendance", detail: "Recorded against her profile" },
        { label: "Reports", detail: "Hours sit alongside invoicing and expenses" },
      ]} />,
    ],
  },
};
