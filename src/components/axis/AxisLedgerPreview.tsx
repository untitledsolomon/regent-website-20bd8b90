import { AxRoot, AxStatusPill } from "./primitives";
import { ledgerEntries, formatMoney } from "./data";

/**
 * Ledger screen, "Journal Entries" tab: auto-posted entries from invoices,
 * payments and expenses, with a balanced debits/credits summary bar.
 */
export function AxisLedgerPreview({ rows: limit = 4 }: { rows?: number } = {}) {
  return (
    <AxRoot>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <h1 className="ax-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>General Ledger</h1>
          <span style={{ display: "flex", gap: 4, fontSize: 12, fontWeight: 500 }}>
            <span style={{ padding: "6px 12px", borderRadius: "0.5rem 0 0 0.5rem", background: "var(--ax-primary)", color: "#fff" }}>Journal Entries</span>
            <span style={{ padding: "6px 12px", borderRadius: "0 0.5rem 0.5rem 0", border: "1px solid var(--ax-border)", color: "var(--ax-muted)", background: "#fff" }}>Account Ledger</span>
          </span>
        </div>

        <div className="ax-summarybar">
          <span className="ax-summary-item"><span>Total debits</span><b>{formatMoney(14_130_000)}</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>Total credits</span><b>{formatMoney(14_130_000)}</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>Out of balance</span><b style={{ color: "var(--ax-success)" }}>Balanced</b></span>
        </div>

        <div className="ax-panel" style={{ marginTop: 12, overflow: "hidden" }}>
          <div style={{ overflow: "hidden" }}>
            <table className="ax-table" >
              <thead>
                <tr>
                  <th className="ax-th ax-opt">Date</th>
                  <th className="ax-th">Reference</th>
                  <th className="ax-th">Description</th>
                  <th className="ax-th ax-opt">Status</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.slice(1, 1 + limit).map((e) => (
                  <tr key={`${e.ref}-${e.date}`} className="ax-row">
                    <td className="ax-td ax-opt" style={{ color: "var(--ax-muted)", whiteSpace: "nowrap" }}>{e.date}</td>
                    <td className="ax-td" style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{e.ref}</td>
                    <td className="ax-td ax-trunc">{e.description}</td>
                    <td className="ax-td ax-opt"><AxStatusPill status={e.status} /></td>
                    <td className="ax-td ax-td-num" style={{ color: e.amount.startsWith("−") || e.amount.startsWith("-") ? "var(--ax-danger)" : "var(--ax-success)", fontWeight: 500, whiteSpace: "nowrap" }}>
                      {e.amount}
                    </td>
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
