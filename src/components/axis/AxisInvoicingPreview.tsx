import { AxRoot, AxStatusPill } from "./primitives";
import { AxIcon } from "./icons";
import { invoices } from "./data";

/**
 * The Axis invoices list screen: summary bar, filter toolbar and the invoices
 * table with status pills. Faithful to the app's Invoices page.
 */
const FILTERS = ["All", "Paid", "Sent", "Partial", "Overdue", "Draft"];

export function AxisInvoicingPreview() {
  const total = invoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + parseAmount(i.amount), 0);

  return (
    <AxRoot>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div>
            <h1 className="ax-serif" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>Invoices</h1>
            <p style={{ fontSize: 13, color: "var(--ax-muted)", marginTop: 4 }}>Create, send and track invoices against your clients.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="ax-btn ax-btn--outline"><AxIcon.download size={14} /> Export CSV</span>
            <span className="ax-btn ax-btn--primary"><AxIcon.plus size={14} /> New invoice</span>
          </div>
        </div>

        <AxSummaryBar />

        <div className="ax-panel" style={{ marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", padding: "12px 16px", borderBottom: "1px solid var(--ax-border)" }}>
            {FILTERS.map((f) => (
              <span
                key={f}
                style={{
                  padding: "4px 12px", borderRadius: 999, fontSize: 12, cursor: "default",
                  fontWeight: 500,
                  color: f === "All" ? "#fff" : "var(--ax-primary)",
                  background: f === "All" ? "var(--ax-primary)" : "var(--ax-muted-soft)",
                  border: f === "All" ? "none" : "1px solid var(--ax-border)",
                }}
              >
                {f}
              </span>
            ))}
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <select className="ax-input" defaultValue="All time" tabIndex={-1}>
                <option>All time</option>
                <option>This month</option>
                <option>Last 30 days</option>
              </select>
              <span className="ax-search"><AxIcon.search size={13} /><span style={{ fontSize: 12 }}>Search invoices…</span></span>
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="ax-table" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th className="ax-th">Invoice #</th>
                  <th className="ax-th">Client</th>
                  <th className="ax-th">Issue date</th>
                  <th className="ax-th">Due date</th>
                  <th className="ax-th">Status</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.ref} className="ax-row">
                    <td className="ax-td" style={{ fontWeight: 500 }}>{inv.ref}</td>
                    <td className="ax-td">{inv.client}</td>
                    <td className="ax-td" style={{ color: "var(--ax-muted)" }}>{inv.issue}</td>
                    <td className="ax-td" style={{ color: "var(--ax-muted)" }}>{inv.due}</td>
                    <td className="ax-td"><AxStatusPill status={inv.status} /></td>
                    <td className="ax-td ax-td-num" style={{ fontWeight: 500 }}>{inv.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", fontSize: 12, color: "var(--ax-muted)" }}>
            <span>Showing {invoices.length} of 24 invoices</span>
            <span className="ax-mono">Total invoiced {fmt(total)} · Paid {fmt(paid)}</span>
          </div>
        </div>
      </div>
    </AxRoot>
  );
}

function AxSummaryBar() {
  return (
    <div className="ax-summarybar">
      <span className="ax-summary-item"><span>Total invoiced</span><b>{fmt(20_140_000)}</b></span>
      <span className="ax-divider" />
      <span className="ax-summary-item"><span>Paid</span><b style={{ color: "var(--ax-success)" }}>{fmt(12_480_000)}</b></span>
      <span className="ax-divider" />
      <span className="ax-summary-item"><span>Outstanding</span><b style={{ color: "var(--ax-warning)" }}>{fmt(5_250_000)}</b></span>
      <span className="ax-divider" />
      <span className="ax-summary-item"><span>Overdue</span><b style={{ color: "var(--ax-danger)" }}>{fmt(1_640_000)}</b></span>
    </div>
  );
}

function parseAmount(text: string): number {
  return Number(text.replace(/[^0-9.-]/g, ""));
}

function fmt(v: number): string {
  if (v >= 1_000_000) return `UGX ${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  return `UGX ${Math.round(v / 1_000)}K`;
}
