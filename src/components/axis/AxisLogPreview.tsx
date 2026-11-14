import { AxRoot } from "./primitives";

/** A quiet activity log: what happened, to what, and the change. */
export type LogRow = { title: string; detail: string; delta?: string; when: string };

export function AxisLogPreview({ title, rows }: { title: string; rows: LogRow[] }) {
  return (
    <AxRoot>
      <div style={{ padding: 18 }}>
        <h1 className="ax-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 14 }}>{title}</h1>
        <div className="ax-panel" style={{ overflow: "hidden" }}>
          {rows.map((r, i) => (
            <div key={`${r.title}-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderTop: i ? "1px solid var(--ax-border)" : 0 }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 600 }}>{r.title}</span>
                <span style={{ display: "block", fontSize: 11, color: "var(--ax-muted)", marginTop: 1 }}>{r.detail}</span>
              </span>
              {r.delta && <span className="ax-mono" style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{r.delta}</span>}
              <span style={{ fontSize: 11, color: "var(--ax-muted)", whiteSpace: "nowrap", minWidth: 52, textAlign: "right" }}>{r.when}</span>
            </div>
          ))}
        </div>
      </div>
    </AxRoot>
  );
}
