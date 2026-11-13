import { AxRoot, AxStatusPill } from "./primitives";
import { ledgerEntries, formatMoney } from "./data";

/**
 * Ledger screen, "Journal Entries" tab: auto-posted entries from invoices,
 * payments and expenses, with a balanced debits/credits summary bar.
 */
export function AxisLedgerPreview() {
  return (
    <AxRoot>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div>
            <h1 className="ax-serif" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>General Ledger</h1>
            <p style={{ fontSize: 13, color: "var(--ax-muted)", marginTop: 4 }}>
              Every invoice, payment and expense posts a journal entry automatically.
            </p>
          </div>
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
          <div style={{ overflowX: "auto" }}>
            <table className="ax-table" style={{ minWidth: 620 }}>
              <thead>
                <tr>
                  <th className="ax-th">Date</th>
                  <th className="ax-th">Reference</th>
                  <th className="ax-th">Description</th>
                  <th className="ax-th">Status</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((e) => (
                  <tr key={`${e.ref}-${e.date}`} className="ax-row">
                    <td className="ax-td" style={{ color: "var(--ax-muted)", whiteSpace: "nowrap" }}>{e.date}</td>
                    <td className="ax-td" style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{e.ref}</td>
                    <td className="ax-td">{e.description}</td>
                    <td className="ax-td"><AxStatusPill status={e.status} /></td>
                    <td className="ax-td ax-td-num" style={{ color: e.amount.startsWith("−") || e.amount.startsWith("-") ? "var(--ax-danger)" : "var(--ax-success)", fontWeight: 500, whiteSpace: "nowrap" }}>
                      {e.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 16px", fontSize: 12, color: "var(--ax-muted)", borderTop: "1px solid var(--ax-border)" }}>
            Void a document and the other side of the entry cleans up automatically.
          </div>
        </div>
      </div>
    </AxRoot>
  );
}
