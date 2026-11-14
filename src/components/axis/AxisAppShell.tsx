import type { ReactNode } from "react";
import { AxRoot, AxSidebar, AxTopbar } from "./primitives";

/**
 * Faithful reproduction of the Axis app shell: white sidebar + topbar around
 * the module content. The sidebar collapses below 920px (like the app's mobile
 * drawer) so the preview still reads as a screen in narrow columns.
 */
export function AxisAppShell({
  active,
  org = "Regent Workspace",
  sidebarOffset = 0,
  children,
}: {
  active?: string;
  /** Pixels to scroll the sidebar up, so a low nav item (e.g. Employees) stays in view. */
  sidebarOffset?: number;
  org?: string;
  children: ReactNode;
}) {
  return (
    <AxRoot>
      <div className="ax-shell">
        <div className="ax-shell-sidebar">
          <div style={{ position: "absolute", inset: 0, marginTop: -sidebarOffset }}>
            <AxSidebar active={active} />
          </div>
        </div>
        <div className="ax-shell-main">
          <AxTopbar org={org} />
          <div className="ax-shell-content">{children}</div>
        </div>
      </div>
    </AxRoot>
  );
}
