import type { ReactNode } from "react";

/**
 * Tiny illustrative visuals for the "How it works" step cards, in the same
 * quiet style as the "3 simple steps" cards on the main Axis page.
 */
const row = "flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-[11px]";

export function MiniFields({ rows }: { rows: [string, string][] }): ReactNode {
  return (
    <div className="space-y-2">
      {rows.map(([k, v]) => (
        <div key={k} className={row}>
          <span className="text-text-muted">{k}</span>
          <span className="truncate font-medium text-text-primary">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniList({ rows }: { rows: [string, string][] }): ReactNode {
  return (
    <div className="space-y-2">
      {rows.map(([name, tag]) => (
        <div key={name} className={row}>
          <span className="truncate font-medium text-text-primary">{name}</span>
          <span className="shrink-0 rounded-full bg-accent-light px-2 py-0.5 font-mono text-[9px] text-primary">{tag}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniChain({ items }: { items: string[] }): ReactNode {
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={it}>
          <div className={row}><span className="font-medium text-text-primary">{it}</span></div>
          {i < items.length - 1 && <div className="mx-auto h-2 w-px bg-border" aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}

export function MiniProgress({ label, value, pct, note }: { label: string; value: string; pct: number; note: string }): ReactNode {
  return (
    <div className="rounded-md border border-border bg-background p-3 text-[11px]">
      <div className="mb-1 text-text-muted">{label}</div>
      <div className="mb-3 font-mono text-sm font-semibold text-text-primary">{value}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
      <div className="mt-2 text-text-muted">{note}</div>
    </div>
  );
}
