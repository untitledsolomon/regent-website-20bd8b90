import type { ReactNode } from "react";
import { AxIcon } from "./icons";
import { NAV_GROUPS } from "./data";

/**
 * Reusable building blocks for the Axis app previews. All are server-rendered
 * static markup styled by `axis-preview.css`; nothing here needs client JS.
 */

export function AxRoot({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`ax-root ${className}`}>{children}</div>;
}

export function AxPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`ax-panel ${className}`}>{children}</div>;
}

export function AxWordmark({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span
      className="ax-serif"
      style={{ fontWeight: 600, fontSize: size === "sm" ? 14 : 18, letterSpacing: "-0.01em" }}
    >
      AXIS
    </span>
  );
}

export function AxAvatar({ initials, size = 24 }: { initials: string; size?: number }) {
  return (
    <span
      className="ax-avatar"
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.42) }}
    >
      {initials}
    </span>
  );
}

export type AxPillTone = "success" | "navy" | "teal" | "warning" | "danger" | "muted";

export function AxPill({ tone, children }: { tone: AxPillTone; children: ReactNode }) {
  return <span className={`ax-pill ax-pill--${tone}`}>{children}</span>;
}

const PILL_TONE: Record<string, AxPillTone> = {
  paid: "success",
  sent: "navy",
  partial: "warning",
  overdue: "danger",
  voided: "muted",
  posted: "navy",
  accepted: "success",
  converted: "teal",
  awaiting: "warning",
  active: "success",
  "on-leave": "warning",
  assigned: "navy",
  due: "warning",
  available: "muted",
  here: "success",
  low: "warning",
};

export function AxStatusPill({ status }: { status: string }) {
  return <AxPill tone={PILL_TONE[status] ?? "muted"}>{status.replace("-", " ")}</AxPill>;
}

export function AxStat({
  label,
  value,
  sub,
  trend,
  up,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  up?: boolean;
  icon?: keyof typeof AxIcon;
}) {
  const Icon = icon ? AxIcon[icon] : null;
  return (
    <div className="ax-stat">
      <div
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}
      >
        <span style={{ fontSize: 12, color: "var(--ax-muted)", fontWeight: 500 }}>{label}</span>
        {Icon && (
          <span className="ax-icon-tile">
            <Icon size={13} />
          </span>
        )}
      </div>
      <div className="ax-kpi">{value}</div>
      {trend ? (
        <div
          style={{ fontSize: 11, marginTop: 6, color: up ? "var(--ax-success)" : "var(--ax-muted)" }}
        >
          {up && <span style={{ marginRight: 3 }}>▲</span>}
          <span style={{ fontWeight: 500 }}>{trend}</span>
          {sub && <span style={{ color: "var(--ax-muted)" }}> · {sub}</span>}
        </div>
      ) : (
        <div style={{ fontSize: 11, marginTop: 6, color: "var(--ax-muted)" }}>{sub}</div>
      )}
    </div>
  );
}

const TONE_COLOR: Record<AxPillTone, string> = {
  success: "var(--ax-success)",
  navy: "var(--ax-primary)",
  teal: "var(--ax-teal)",
  warning: "var(--ax-warning)",
  danger: "var(--ax-danger)",
  muted: "var(--ax-muted)",
};

export function AxSummary({
  items,
}: {
  items: readonly { label: string; value: string; tone?: AxPillTone }[];
}) {
  return (
    <div className="ax-summarybar">
      {items.map((item, i) => (
        <span
          key={item.label}
          style={{ display: "flex", alignItems: "center", gap: i === 0 ? 0 : 16 }}
        >
          {i > 0 && <span className="ax-divider" style={{ marginRight: 16 }} />}
          <span className="ax-summary-item" style={{ gap: 7 }}>
            <span>{item.label}</span>
            <b style={item.tone ? { color: TONE_COLOR[item.tone] } : undefined}>{item.value}</b>
          </span>
        </span>
      ))}
    </div>
  );
}

export function AxTopbar({ org, searchPlaceholder = "Search here…" }: { org: string; searchPlaceholder?: string }) {
  return (
    <div className="ax-topbar">
      <span className="ax-search" style={{ flex: "0 1 260px", minWidth: 90 }}>
        <AxIcon.search size={13} />
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
          {searchPlaceholder}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--ax-muted)", border: "1px solid var(--ax-border)", borderRadius: 4, padding: "0 4px" }}>
          ⌘K
        </span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
        <span style={{ position: "relative", color: "var(--ax-muted)", display: "inline-flex" }}>
          <AxIcon.bell size={16} />
          <span
            style={{
              position: "absolute", top: -1, right: -1, width: 7, height: 7, borderRadius: 99,
              background: "var(--ax-danger)",
            }}
          />
        </span>
        <AxIcon.help size={16} />
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AxAvatar initials={org.slice(0, 2).toUpperCase()} />
          <AxIcon.chevron size={13} />
        </span>
      </span>
    </div>
  );
}

export function AxSidebar({ active }: { active?: string }) {
  return (
    <div className="ax-sidebar" aria-hidden="true">
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "14px 16px 10px" }}>
        <span
          style={{
            width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center",
            background: "var(--ax-primary)", color: "#f7f9fb",
          }}
        >
          <AxWordmark size="sm" />
        </span>
        <span style={{ lineHeight: 1 }}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ax-primary)" }}>Regent Workspace</span>
          <span className="ax-caption" style={{ fontSize: 9 }}>Axis Business Hub</span>
        </span>
        <span style={{ marginLeft: "auto", color: "var(--ax-muted)" }}>
          <AxIcon.chevron size={13} />
        </span>
      </div>

      <div style={{ marginTop: 4 }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="ax-nav-group">{group.title}</div>
            {group.items.map((item) => {
              const Icon = AxIcon[item.icon];
              return (
                <div key={item.label} className={`ax-nav-item${item.label === active ? " ax-nav-item--active" : ""}`}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", borderTop: "1px solid var(--ax-border)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <AxAvatar initials="SK" size={28} />
        <span style={{ lineHeight: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ax-primary)", whiteSpace: "nowrap" }}>Solomon Kimani</span>
          <span style={{ fontSize: 10, color: "var(--ax-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
            admin@regentplatform.com
          </span>
        </span>
        <span style={{ marginLeft: "auto", color: "var(--ax-muted)" }}>
          <AxIcon.logOut size={15} />
        </span>
      </div>
    </div>
  );
}
