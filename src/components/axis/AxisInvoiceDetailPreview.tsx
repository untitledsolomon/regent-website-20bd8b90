import { AxRoot, AxStatusPill } from "./primitives";
import { AxIcon } from "./icons";
import { invoiceDetail } from "./data";

/**
 * A single invoice detail screen: status badge, client meta, line items with
 * totals and a Mark-as-paid action. Compact enough for narrow side panels.
 */
export function AxisInvoiceDetailPreview() {
  const inv = invoiceDetail;
  return (
    <AxRoot>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h1 className="ax-serif" style={{ fontSize: 18, fontWeight: 600 }}>{inv.ref}</h1>
          <AxStatusPill status={inv.status} />
        </div>

        <div className="ax-panel" style={{ marginBottom: 12, padding: "12px 14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 16px", fontSize: 12.5 }}>
            <div><div className="ax-caption" style={{ marginBottom: 2 }}>Client</div><div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.client}</div></div>
            <div><div className="ax-caption" style={{ marginBottom: 2 }}>Issue date</div><div>{inv.issue}</div></div>
            <div><div className="ax-caption" style={{ marginBottom: 2 }}>Due date</div><div>{inv.due}</div></div>
          </div>
        </div>

        <div className="ax-panel" style={{ overflow: "hidden" }}>
          <div style={{ overflow: "hidden" }}>
            <table className="ax-table" >
              <thead>
                <tr>
                  <th className="ax-th">Description</th>
                  <th className="ax-th">Qty</th>
                  <th className="ax-th ax-opt2" style={{ textAlign: "right" }}>Unit price</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.slice(0, 2).map((item) => (
                  <tr key={item.description} className="ax-row">
                    <td className="ax-td ax-trunc">{item.description}</td>
                    <td className="ax-td">{item.qty}</td>
                    <td className="ax-td ax-td-num ax-opt2">{item.unit}</td>
                    <td className="ax-td ax-td-num">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "8px 14px 12px", display: "flex", justifyContent: "flex-end", fontSize: 12.5 }}>
            <div >
              {[["Subtotal", inv.subtotal], ["Tax", inv.tax]].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "var(--ax-muted)" }}>
                  <span>{label}</span>
                  <span>{val}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, paddingTop: 6, marginTop: 4, borderTop: "1px solid var(--ax-border)", fontWeight: 600, color: "var(--ax-primary)" }}>
                <span>Grand total</span>
                <span className="ax-mono">{inv.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ax-noise" style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <span className="ax-btn ax-btn--primary"><AxIcon.check size={14} /> Mark as paid</span>
          <span className="ax-btn ax-btn--outline"><AxIcon.file size={14} /> View PDF</span>
        </div>
      </div>
    </AxRoot>
  );
}
