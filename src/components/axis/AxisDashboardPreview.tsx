import { AxPanel, AxStat, AxSummary } from "./primitives";
import { dashboardStats, dashboardSummary, revenueSeries, recentActivity } from "./data";

/**
 * The Axis dashboard homepage: page header, four KPI stats, summary bar,
 * revenue area chart (static SVG) and a recent-activity feed.
 */
export function AxisDashboardPreview() {
  const max = Math.max(...revenueSeries);
  const w = 600;
  const h = 150;
  const step = w / (revenueSeries.length - 1);
  const points = revenueSeries
    .map((v, i) => `${Math.round(i * step)},${Math.round(h - (v / max) * (h - 12) - 8)}`)
    .join(" ");
  const area = `0,${h} ${points} ${w},${h}`;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div>
          <h1 className="ax-serif" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Hello, Solomon!
          </h1>
          <p style={{ fontSize: 13, color: "var(--ax-muted)", marginTop: 4 }}>
            Here is what is happening across your business today.
          </p>
        </div>
        <select className="ax-input" style={{ width: 140 }} tabIndex={-1} defaultValue="This month">
          <option>This month</option>
          <option>Last 30 days</option>
          <option>This quarter</option>
          <option>All time</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 12 }}>
        {dashboardStats.map((s) => (
          <AxStat key={s.label} label={s.label} value={s.value} trend={s.trend} up={s.up} icon={s.icon} />
        ))}
      </div>

      <AxSummary items={dashboardSummary} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 12, marginTop: 12 }}>
        <AxPanel>
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Revenue overview</span>
            <span style={{ fontSize: 11, color: "var(--ax-success)" }}>▲ 12.6% vs last month</span>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Revenue area chart, this month">
              <defs>
                <linearGradient id="axRevFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ax-primary)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--ax-primary)" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0, 30, 60, 90, 120].map((y) => (
                <line key={y} x1="0" y1={y} x2={w} y2={y} stroke="var(--ax-border)" strokeDasharray="4 5" />
              ))}
              <polygon points={area} fill="url(#axRevFill)" />
              <polyline points={points} fill="none" stroke="var(--ax-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={w} cy={Math.round(h - (revenueSeries[revenueSeries.length - 1] / max) * (h - 12) - 8)} r="3.5" fill="var(--ax-teal)" />
            </svg>
          </div>
        </AxPanel>

        <AxPanel>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--ax-border)" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Recent activity</span>
          </div>
          <div style={{ padding: "6px 16px 12px" }}>
            {recentActivity.map((a) => (
              <div key={a.when} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0" }}>
                <span
                  style={{
                    width: 7, height: 7, borderRadius: 99, marginTop: 5, flexShrink: 0,
                    background:
                      a.tone === "success" ? "var(--ax-success)" : a.tone === "teal" ? "var(--ax-teal)" : "var(--ax-primary)",
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, lineHeight: 1.45, color: "var(--ax-primary)" }}>{a.text}</p>
                  <p className="ax-mono" style={{ fontSize: 10, color: "var(--ax-muted)", marginTop: 2 }}>{a.when}</p>
                </div>
              </div>
            ))}
          </div>
        </AxPanel>
      </div>
    </div>
  );
}
