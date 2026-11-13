import { AxRoot } from "./primitives";
import { chartOfAccounts } from "./data";

/** Chart of Accounts screen: coded accounts with indent for child accounts. */
export function AxisAccountsPreview() {
  return (
    <AxRoot>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <h1 className="ax-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Chart of Accounts</h1>
          <span className="ax-btn ax-btn--outline">+ Add account</span>
        </div>

        <div className="ax-summarybar">
          <span className="ax-summary-item"><span>Total assets</span><b>{bal(12_090_000)}</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>Total liabilities</span><b>{bal(1_980_000)}</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>Revenue</span><b>{bal(18_400_000)}</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>Expenses</span><b>{bal(9_120_000)}</b></span>
        </div>

        <div className="ax-panel" style={{ marginTop: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="ax-table" style={{ minWidth: 320 }}>
              <thead>
                <tr>
                  <th className="ax-th">Code</th>
                  <th className="ax-th">Account</th>
                  <th className="ax-th">Type</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {chartOfAccounts.slice(0, 5).map((a) => (
                  <tr key={a.code} className="ax-row">
                    <td className="ax-td ax-mono" style={{ color: "var(--ax-muted)" }}>{a.code}</td>
                    <td className="ax-td ax-trunc" style={{ fontWeight: 500, maxWidth: 190, paddingLeft: a.indent ? 40 : 12, paddingRight: 12 }}>
                      {a.indent ? "↳ " : ""}{a.name}
                    </td>
                    <td className="ax-td">
                      <span style={{ padding: "2px 10px", borderRadius: 999, border: "1px solid var(--ax-border)", fontSize: 11 }}>{a.category}</span>
                    </td>
                    <td className="ax-td ax-td-num" style={{ fontWeight: 500 }}>{a.balance}</td>
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

function bal(v: number): string {
  return v >= 1_000_000 ? `UGX ${(v / 1_000_000).toFixed(1)}M` : `UGX ${Math.round(v / 1_000)}K`;
}
