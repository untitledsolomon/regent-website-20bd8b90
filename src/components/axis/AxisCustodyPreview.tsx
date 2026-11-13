import { AxRoot, AxStatusPill } from "./primitives";
import { AxIcon } from "./icons";
import { custody } from "./data";

/**
 * Asset custody screen: which items are out with whom and when they come back.
 */
export function AxisCustodyPreview() {
  return (
    <AxRoot>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div>
            <h1 className="ax-serif" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>Asset Custody</h1>
            <p style={{ fontSize: 13, color: "var(--ax-muted)", marginTop: 4 }}>
              Know which items are on loan, and to whom, directly from the stock records.
            </p>
          </div>
          <span className="ax-btn ax-btn--outline"><AxIcon.plus size={14} /> Issue item</span>
        </div>

        <div className="ax-summarybar">
          <span className="ax-summary-item"><span>Assigned</span><b>14 items</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>Due soon</span><b style={{ color: "var(--ax-warning)" }}>3 items</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>Available</span><b>22 items</b></span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
          {custody.map((c) => (
            <div className="ax-panel" key={c.asset} style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--ax-primary-soft)", color: "var(--ax-primary)" }}>
                  <AxIcon.package size={15} />
                </span>
                <AxStatusPill status={c.status === "due" ? "due" : c.status === "assigned" ? "assigned" : "available"} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{c.asset}</div>
              <div style={{ fontSize: 12, color: "var(--ax-muted)" }}>
                <div>Held by: <span style={{ color: "var(--ax-primary)" }}>{c.assignee}</span></div>
                <div style={{ marginTop: 2 }}>{c.due}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AxRoot>
  );
}
