import { AxRoot } from "./primitives";

/**
 * A short chain of linked records, e.g. Invoice -> Client balance -> Ledger.
 * Used where a feature is about records connecting rather than a table.
 */
export type FlowStep = { label: string; detail: string; meta?: string };

export function AxisFlowPreview({ title, steps }: { title: string; steps: FlowStep[] }) {
  return (
    <AxRoot>
      <div style={{ padding: 18 }}>
        <h1 className="ax-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 14 }}>{title}</h1>
        <div style={{ position: "relative" }}>
          <span aria-hidden="true" style={{ position: "absolute", left: 11, top: 14, bottom: 14, width: 1, background: "var(--ax-border)" }} />
          {steps.map((s, i) => (
            <div key={s.label} style={{ position: "relative", display: "flex", gap: 14, paddingBottom: i === steps.length - 1 ? 0 : 14 }}>
              <span
                style={{
                  position: "relative", zIndex: 1, flexShrink: 0, width: 23, height: 23, borderRadius: 999,
                  background: "var(--ax-card, #fff)", border: "1px solid var(--ax-border)", color: "var(--ax-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600,
                }}
              >
                {i + 1}
              </span>
              <div className="ax-panel" style={{ flex: 1, minWidth: 0, padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 12.5, fontWeight: 600 }}>{s.label}</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--ax-muted)", marginTop: 1 }}>{s.detail}</span>
                </span>
                {s.meta && <span className="ax-mono" style={{ fontSize: 11, color: "var(--ax-muted)", whiteSpace: "nowrap" }}>{s.meta}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AxRoot>
  );
}
