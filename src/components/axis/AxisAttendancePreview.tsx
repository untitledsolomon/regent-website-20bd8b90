import { AxRoot, AxStatusPill, AxAvatar } from "./primitives";

/**
 * Attendance log: who checked in and out today, with hours worked.
 */
const LOG = [
  { name: "David Okello", initials: "DO", in: "07:56", out: "17:04", hours: "9h 08m", status: "here" },
  { name: "Peter Mwangi", initials: "PM", in: "06:48", out: "—", hours: "5h 12m", status: "here" },
  { name: "Naomi Alimo", initials: "NA", in: "08:12", out: "—", hours: "3h 48m", status: "here" },
  { name: "Grace Nabirye", initials: "GN", in: "—", out: "—", hours: "—", status: "on-leave" },
] as const;

export function AxisAttendancePreview() {
  return (
    <AxRoot>
      <div style={{ padding: 18 }}>
        <div style={{ marginBottom: 12 }}>
          <h1 className="ax-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Attendance</h1>
        </div>
        <div className="ax-panel" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="ax-table" style={{ minWidth: 320 }}>
              <thead>
                <tr>
                  <th className="ax-th">Employee</th>
                  <th className="ax-th">In</th>
                  <th className="ax-th">Out</th>
                  <th className="ax-th" style={{ textAlign: "right" }}>Hours</th>
                  <th className="ax-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {LOG.map((r) => (
                  <tr key={r.name} className="ax-row">
                    <td className="ax-td">
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <AxAvatar initials={r.initials} />
                        <span className="ax-trunc" style={{ fontWeight: 500 }}>{r.name}</span>
                      </span>
                    </td>
                    <td className="ax-td ax-td-num" style={{ color: "var(--ax-muted)" }}>{r.in}</td>
                    <td className="ax-td ax-td-num" style={{ color: "var(--ax-muted)" }}>{r.out}</td>
                    <td className="ax-td ax-td-num" style={{ fontWeight: 500 }}>{r.hours}</td>
                    <td className="ax-td"><AxStatusPill status={r.status} /></td>
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
