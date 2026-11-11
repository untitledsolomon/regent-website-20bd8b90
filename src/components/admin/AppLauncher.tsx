"use client";

// The grid button beside the notification bell. A compact app switcher: quick
// links to the main admin sections, so the button does something instead of
// sitting dead in the topbar.

import Link from "next/link";
import {
  LayoutDashboard, MessageSquare, Activity, Sparkles, Mail, Settings,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const APPS = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Leads", path: "/admin/inquiries", icon: MessageSquare },
  { label: "Analytics", path: "/admin/analytics", icon: Activity },
  { label: "Assistant", path: "/admin/assistant", icon: Sparkles },
  { label: "Emails", path: "/admin/emails", icon: Mail },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AppLauncher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 text-muted-foreground hover:text-foreground" aria-label="Jump to a section">
          {/* Grid icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl mt-2 p-2">
        <div className="grid grid-cols-2 gap-1">
          {APPS.map((app) => (
            <Link
              key={app.path}
              href={app.path}
              className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            >
              <app.icon size={18} className="text-muted-foreground" />
              {app.label}
            </Link>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
