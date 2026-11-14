import { AxRoot, AxStatusPill, AxAvatar } from "./primitives";
import { shifts } from "./data";

/**
 * Shifts roster: today's schedule at a glance, straight from the employee
 * records.
 */
export function AxisShiftsPreview() {
  return (
    <AxRoot>
      <div style={{ padding: 18 }}>
        <div style={{ marginBottom: 10 }}>
          <h1 className="ax-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Today's shifts</h1>
        </div>

        <div className="ax-summarybar">
          <span className="ax-summary-item"><span>Scheduled</span><b>12 staff</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>Checked in</span><b style={{ color: "var(--ax-success)" }}>9 staff</b></span>
          <span className="ax-divider" />
          <span className="ax-summary-item"><span>On leave</span><b style={{ color: "var(--ax-warning)" }}>2 staff</b></span>
        </div>

        <div className="ax-panel" style={{ marginTop: 12, overflow: "hidden" }}>
          {shifts.map((s, i) => (
            <div
              key={s.name}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "9px 12px",
                borderBottom: i < shifts.length - 1 ? "1px solid var(--ax-border)" : "none",
              }}
            >
              <AxAvatar initials={s.initials} size={26} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 10.5, color: "var(--ax-muted)" }}>{s.role} · {s.time}</div>
              </div>
              <AxStatusPill status={s.status} />
            </div>
          ))}
        </div>
      </div>
    </AxRoot>
  );
}
