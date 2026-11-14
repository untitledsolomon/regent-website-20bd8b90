import { AxRoot, AxPill } from "./primitives";
import { inventoryItems, inventorySummary } from "./data";

/**
 * Inventory screen: amber low-stock banner, summary bar and the stock list
 * with low-stock rows highlighted.
 */
export function AxisInventoryPreview() {
  return (
    <AxRoot>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <h1 className="ax-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Inventory</h1>
          <span className="ax-btn ax-btn--primary">+ Add item</span>
        </div>

        <div className="ax-summarybar">
          {inventorySummary.map((s, i) => (
            <span key={s.label} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <span className="ax-divider" style={{ marginRight: 20 }} />}
              <span className="ax-summary-item">
                <span>{s.label}</span>
                <b style={s.tone === "warning" ? { color: "var(--ax-warning)" } : undefined}>{s.value}</b>
              </span>
            </span>
          ))}
        </div>

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, background: "var(--ax-warning-soft)", border: "1px solid rgba(156,116,31,0.35)", color: "var(--ax-warning)", fontSize: 12, padding: "8px 14px", borderRadius: "0.6rem" }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--ax-warning)", flexShrink: 0 }} />
          3 items are running low — restock before they affect deliveries.
        </div>

        <div className="ax-panel" style={{ marginTop: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="ax-table" style={{ minWidth: 320 }}>
              <thead>
                <tr>
                  <th className="ax-th">Item</th>
                  <th className="ax-th">Category</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>On hand</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Cost</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Selling</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.slice(0, 4).map((item) => (
                  <tr key={item.sku} className={`ax-row${item.low ? " ax-row--low" : ""}`}>
                    <td className="ax-td ax-trunc" style={{ fontWeight: 500 }}>{item.name}</td>
                    <td className="ax-td"><AxPill tone="muted">{item.category}</AxPill></td>
                    <td className="ax-td ax-td-num">
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {item.qty}
                        {item.low && <AxPill tone="warning">low</AxPill>}
                      </span>
                    </td>
                    <td className="ax-td ax-td-num" style={{ color: "var(--ax-muted)" }}>{item.cost}</td>
                    <td className="ax-td ax-td-num" style={{ fontWeight: 500 }}>{item.selling}</td>
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
