import { AxRoot, AxStatusPill, AxAvatar } from "./primitives";
import { shifts } from "./data";

/**
 * Shift & attendance panel: today's roster at a glance, straight from the
 * employee records.
 */
export function AxisAttendancePreview() {
  return (
    <AxRoot>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 className="ax-serif" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>Today's shifts</h1>
          <p style={{ fontSize: 13, color: "var(--ax-muted)", marginTop: 4 }}>
            Friday, 13 November 2026 · attendance across 4 shifts
          </p>
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
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                borderBottom: i < shifts.length - 1 ? "1px solid var(--ax-border)" : "none",
              }}
            >
              <AxAvatar initials={s.initials} size={30} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "var(--ax-muted)" }}>{s.role} · {s.time}</div>
              </div>
              <AxStatusPill status={s.status} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "var(--ax-muted)" }}>
          Attendance marks post straight to the payroll-ready timesheet each week.
        </div>
      </div>
    </AxRoot>
  );
}
