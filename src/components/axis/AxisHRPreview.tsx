import { AxRoot, AxStatusPill, AxAvatar, AxSummary } from "./primitives";
import { employees, employeeSummary } from "./data";

/**
 * Employees (HR) screen: headcount summary and the staff directory table with
 * statuses — alongside the money, all in one system.
 */
export function AxisHRPreview() {
  return (
    <AxRoot>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <h1 className="ax-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Employees</h1>
          <span className="ax-btn" style={{ color: "var(--ax-primary)", background: "#fff", border: "1px solid var(--ax-border-strong)" }}>+ Add employee</span>
        </div>

        <AxSummary items={employeeSummary} />

        <div className="ax-panel" style={{ marginTop: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="ax-table" style={{ minWidth: 360 }}>
              <thead>
                <tr>
                  <th className="ax-th">Employee</th>
                  <th className="ax-th">Role & department</th>
                  <th className="ax-th">Hire date</th>
                  <th className="ax-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 4).map((e) => (
                  <tr key={e.name} className="ax-row">
                    <td className="ax-td">
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <AxAvatar initials={e.initials} />
                        <span className="ax-trunc" style={{ fontWeight: 500 }}>{e.name}</span>
                      </span>
                    </td>
                    <td className="ax-td">
                      <span style={{ display: "block", fontWeight: 500 }}>{e.role}</span>
                      <span style={{ fontSize: 11, color: "var(--ax-muted)" }}>{e.department}</span>
                    </td>
                    <td className="ax-td" style={{ color: "var(--ax-muted)" }}>{e.hired}</td>
                    <td className="ax-td"><AxStatusPill status={e.status} /></td>
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
