import { AxRoot, AxStatusPill } from "./primitives";
import { AxIcon } from "./icons";
import { quotations } from "./data";

/**
 * Quotations screen: the app's quotes list — the marketing page's "Orders"
 * story shown as a real app element (quotation → invoice → job order).
 */
export function AxisQuotationsPreview() {
  return (
    <AxRoot>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <h1 className="ax-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Quotations</h1>
          <span className="ax-btn ax-btn--primary"><AxIcon.plus size={14} /> New quotation</span>
        </div>

        <div className="ax-summarybar">
          <span className="ax-summary-item"><span>Total</span><b>{qs(9_010_000)}</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>Accepted</span><b style={{ color: "var(--ax-success)" }}>{qs(2_750_000)}</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>Awaiting response</span><b style={{ color: "var(--ax-warning)" }}>{qs(5_620_000)}</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>Converted</span><b>{qs(640_000)}</b></span>
        </div>

        <div className="ax-panel" style={{ marginTop: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="ax-table" style={{ minWidth: 320 }}>
              <thead>
                <tr>
                  <th className="ax-th">Quotation #</th>
                  <th className="ax-th">Client</th>
                  <th className="ax-th">Issue date</th>
                  <th className="ax-th">Valid until</th>
                  <th className="ax-th">Status</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {quotations.slice(0, 3).map((q) => (
                  <tr key={q.ref} className="ax-row">
                    <td className="ax-td" style={{ fontWeight: 500 }}>{q.ref}</td>
                    <td className="ax-td ax-trunc">{q.client}</td>
                    <td className="ax-td" style={{ color: "var(--ax-muted)", whiteSpace: "nowrap" }}>{q.issue}</td>
                    <td className="ax-td" style={{ color: "var(--ax-muted)", whiteSpace: "nowrap" }}>{q.valid}</td>
                    <td className="ax-td"><AxStatusPill status={q.status} /></td>
                    <td className="ax-td ax-td-num" style={{ fontWeight: 500 }}>{q.amount}</td>
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

function qs(v: number): string {
  return v >= 1_000_000 ? `UGX ${(v / 1_000_000).toFixed(1)}M` : `UGX ${Math.round(v / 1_000)}K`;
}
