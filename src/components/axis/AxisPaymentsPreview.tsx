import { AxRoot } from "./primitives";

/** Payment progress per invoice: a quiet bar of paid vs total. */
const ROWS = [
  { ref: "INV-0043", client: "Tekowa Engineering", paid: 4_200_000, total: 4_200_000, note: "Paid in full" },
  { ref: "INV-0041", client: "Kampala Hardware", paid: 700_000, total: 1_240_000, note: "Partly paid" },
  { ref: "INV-0038", client: "Nile Traders", paid: 0, total: 2_130_000, note: "Overdue 6 days" },
];
const fmt = (n: number) => `UGX ${n.toLocaleString("en-US")}`;

export function AxisPaymentsPreview() {
  return (
    <AxRoot>
      <div style={{ padding: 18 }}>
        <h1 className="ax-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 14 }}>Payments</h1>
        <div className="ax-panel" style={{ overflow: "hidden" }}>
          {ROWS.map((r, i) => {
            const pct = Math.round((r.paid / r.total) * 100);
            return (
              <div key={r.ref} style={{ padding: "11px 14px", borderTop: i ? "1px solid var(--ax-border)" : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 600 }}>{r.ref} <span style={{ fontWeight: 400, color: "var(--ax-muted)" }}>· {r.client}</span></span>
                  <span className="ax-mono" style={{ whiteSpace: "nowrap" }}>{fmt(r.total)}</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: "var(--ax-border)", margin: "8px 0 5px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: pct === 100 ? "var(--ax-success, #2f7d5b)" : "var(--ax-primary)" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--ax-muted)" }}>{r.note}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AxRoot>
  );
}
