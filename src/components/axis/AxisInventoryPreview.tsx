import { AxRoot, AxPill } from "./primitives";
import { inventoryItems, inventorySummary } from "./data";

/**
 * Inventory screen: amber low-stock banner, summary bar and the stock list
 * with low-stock rows highlighted.
 */
export function AxisInventoryPreview() {
  return (
    <AxRoot>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div>
            <h1 className="ax-serif" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>Inventory</h1>
            <p style={{ fontSize: 13, color: "var(--ax-muted)", marginTop: 4 }}>
              Live stock counts, shared with the same item records your invoices use.
            </p>
          </div>
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

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, background: "var(--ax-warning-soft)", border: "1px solid rgba(156,116,31,0.35)", color: "var(--ax-warning)", fontSize: 12, padding: "9px 14px", borderRadius: "0.6rem" }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--ax-warning)", flexShrink: 0 }} />
          3 items are running low — restock before they affect deliveries.
        </div>

        <div className="ax-panel" style={{ marginTop: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--ax-border)", flexWrap: "wrap" }}>
            {["All", "Low stock", "Archived"].map((f, i) => (
              <span key={f} style={{
                padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500,
                color: i === 0 ? "#fff" : "var(--ax-primary)",
                background: i === 0 ? "var(--ax-primary)" : "var(--ax-muted-soft)",
                border: i === 0 ? "none" : "1px solid var(--ax-border)",
              }}>
                {f}
              </span>
            ))}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="ax-table" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th className="ax-th">Item</th>
                  <th className="ax-th">SKU</th>
                  <th className="ax-th">Category</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Qty</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Cost</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Selling</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => (
                  <tr key={item.sku} className={`ax-row${item.low ? " ax-row--low" : ""}`}>
                    <td className="ax-td" style={{ fontWeight: 500 }}>{item.name}</td>
                    <td className="ax-td ax-mono" style={{ color: "var(--ax-muted)" }}>{item.sku}</td>
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
          <div style={{ padding: "10px 16px", fontSize: 12, color: "var(--ax-muted)", borderTop: "1px solid var(--ax-border)" }}>
            Every item links to invoices, quotations and custody — change it once, it updates everywhere.
          </div>
        </div>
      </div>
    </AxRoot>
  );
}
