import type { ReactNode } from "react";
import { MiniChain, MiniFields, MiniList, MiniProgress } from "@/components/axis/AxisMiniVisual";

/**
 * Mini visual for each "How it works" step, per module slug. Index matches
 * `module.howItWorks`.
 */
export const STEP_VISUALS: Record<string, ReactNode[]> = {
  invoicing: [
    <MiniFields key="1" rows={[["Client", "Tekowa Engineering"], ["Items", "Vehicle servicing"], ["Terms", "30 days"]]} />,
    <MiniList key="2" rows={[["INV-0043.pdf", "branded"], ["Emailed to client", "sent"]]} />,
    <MiniChain key="3" items={["Invoice sent", "Ledger updated", "Client balance updated"]} />,
    <MiniProgress key="4" label="Outstanding" value="UGX 21.7M" pct={62} note="7 invoices still open" />,
  ],
  accounting: [
    <MiniList key="1" rows={[["Office rent · UGX 1,000,000", "expense"], ["Daily sales · UGX 3,400,000", "sales"]]} />,
    <MiniChain key="2" items={["Invoice sent", "Journal entry posted", "Ledger balanced"]} />,
    <MiniChain key="3" items={["Void INV-0042", "Reversal posted", "Books stay balanced"]} />,
    <MiniFields key="4" rows={[["Total debits", "UGX 14.1M"], ["Total credits", "UGX 14.1M"], ["Out of balance", "UGX 0"]]} />,
  ],
  inventory: [
    <MiniFields key="1" rows={[["Item", "Fuel (petrol)"], ["Unit", "Litre"], ["Selling price", "UGX 5,200"]]} />,
    <MiniChain key="2" items={["Sale on INV-0043", "Stock down 40 L", "212 L on hand"]} />,
    <MiniList key="3" rows={[["Laptop · HP ProBook", "assigned"], ["Camera kit", "returned"]]} />,
    <MiniProgress key="4" label="Counted vs recorded" value="212 / 212 L" pct={100} note="Matches the record" />,
  ],
  hr: [
    <MiniFields key="1" rows={[["Name", "Naomi Alimo"], ["Role", "Field Supervisor"], ["Department", "Operations"]]} />,
    <MiniList key="2" rows={[["David Okello · 08:00 — 17:00", "shift"], ["Peter Mwangi · 07:00 — 16:00", "shift"]]} />,
    <MiniList key="3" rows={[["David Okello · in 07:56", "here"], ["Grace Nabirye", "on leave"]]} />,
    <MiniProgress key="4" label="Hours this week" value="164 h" pct={82} note="Across 15 active staff" />,
  ],
};
