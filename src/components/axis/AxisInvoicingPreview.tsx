import { AxRoot, AxStatusPill } from "./primitives";
import { AxIcon } from "./icons";
import { invoices } from "./data";

/**
 * The Axis invoices list screen: filter toolbar and the invoices table with
 * status pills (summary bar omitted to keep the widget compact). Faithful to the app's Invoices page.
 */
const FILTERS = ["All", "Paid", "Sent", "Partial", "Overdue", "Draft"];

export function AxisInvoicingPreview() {
  const rows = invoices.slice(0, 3);

  return (
    <AxRoot>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <h1 className="ax-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Invoices</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="ax-btn ax-btn--outline"><AxIcon.download size={14} /> Export CSV</span>
            <span className="ax-btn ax-btn--primary"><AxIcon.plus size={14} /> New invoice</span>
          </div>
        </div>

        <div className="ax-panel">
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
              <span className="ax-search"><AxIcon.search size={13} /><span style={{ fontSize: 12 }}>Search invoices…</span></span>
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="ax-table" style={{ minWidth: 320 }}>
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
                {rows.map((inv) => (
                  <tr key={inv.ref} className="ax-row">
                    <td className="ax-td" style={{ fontWeight: 500 }}>{inv.ref}</td>
                    <td className="ax-td ax-trunc">{inv.client}</td>
                    <td className="ax-td" style={{ color: "var(--ax-muted)", whiteSpace: "nowrap" }}>{inv.issue}</td>
                    <td className="ax-td" style={{ color: "var(--ax-muted)", whiteSpace: "nowrap" }}>{inv.due}</td>
                    <td className="ax-td"><AxStatusPill status={inv.status} /></td>
                    <td className="ax-td ax-td-num" style={{ fontWeight: 500 }}>{inv.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AxRoot>
  );
}
