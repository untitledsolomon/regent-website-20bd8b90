"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import {
  LayoutDashboard, FileText, BarChart3, FolderOpen, Mail, MessageSquare,
  Briefcase, LogOut, ExternalLink, ChevronRight, Menu, X, Settings,
  BookOpen, Activity, PanelLeftClose, PanelLeft,
  ClipboardList, Search, Bell, Grid, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const contentNavItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Leads", path: "/admin/inquiries", icon: MessageSquare },
  { label: "Analytics", path: "/admin/analytics", icon: Activity },
  { label: "Users", path: "/admin/users", icon: User },
  { label: "Blog Posts", path: "/admin/posts", icon: FileText },
  { label: "Case Studies", path: "/admin/case-studies", icon: BarChart3 },
  { label: "Resources", path: "/admin/resources", icon: FolderOpen },
  { label: "Careers", path: "/admin/careers", icon: Briefcase },
  { label: "Applications", path: "/admin/applications", icon: ClipboardList },
  { label: "Subscribers", path: "/admin/subscribers", icon: Mail },
];

const utilityNavItems = [
  { label: "Settings", path: "/admin/settings", icon: Settings },
  { label: "Documentation", path: "/admin/documentation", icon: BookOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleSignOut = async () => { await signOut(); router.push("/admin/login"); };
  const initials = user?.email?.slice(0, 2).toUpperCase() || "AD";

  const NavItem = ({ item }: { item: typeof contentNavItems[0] }) => {
    const isActive = item.exact
      ? pathname === item.path
      : pathname.startsWith(item.path);
    const Icon = item.icon;
    return (
      <Link
        href={item.path}
        className={cn(
          "flex items-center gap-3 rounded-lg text-sm transition-all duration-200 group relative py-2 px-3",
          isActive
            ? "bg-primary/5 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
        )}
        <Icon size={18} className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors")} />
        {!collapsed && <span className="flex-1">{item.label}</span>}
        {isActive && !collapsed && <div className="w-1 h-1 rounded-full bg-primary" />}
      </Link>
    );
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full bg-card">
      {/* Brand */}
      <div className={cn("h-16 flex items-center border-b border-border px-6", collapsed && !mobile && "justify-center px-0")}>
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight text-foreground">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">L</div>
          {!collapsed && (
            <span>LeadEngine</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {contentNavItems.map(item => <NavItem key={item.path} item={item} />)}
      </nav>

      {/* Footer Utility */}
      <div className="px-3 pb-4 space-y-1">
        {utilityNavItems.map(item => <NavItem key={item.path} item={item} />)}

        <div className="pt-4 mt-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg text-sm text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all py-2 px-3",
              collapsed && "justify-center"
            )}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-background flex overflow-hidden">
      {/* Sidebar - desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out shrink-0 z-30",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 w-[260px] bg-card border-r border-border flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent mobile />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-20">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search analytics..."
                className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-6 mr-4">
              <Link href="/admin/campaigns" className="text-sm font-medium text-muted-foreground hover:text-foreground">New Campaign</Link>
              <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl px-5">Add Lead</Button>
            </div>

            <button className="p-2 text-muted-foreground hover:text-foreground relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
            </button>

            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Grid size={20} />
            </button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 ml-2 hover:opacity-80 transition-opacity">
                  <Avatar className="h-9 w-9 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl mt-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin User</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
