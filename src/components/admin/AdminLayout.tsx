import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import {
  LayoutDashboard, FileText, BarChart3, FolderOpen, Mail, MessageSquare,
  Briefcase, LogOut, ExternalLink, ChevronRight, Menu, X, Settings,
  BookOpen, Activity, PanelLeftClose, PanelLeft,
  ClipboardList,
} from "lucide-react";

const contentNavItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Analytics", path: "/admin/analytics", icon: Activity },
  { label: "Blog Posts", path: "/admin/posts", icon: FileText },
  { label: "Case Studies", path: "/admin/case-studies", icon: BarChart3 },
  { label: "Resources", path: "/admin/resources", icon: FolderOpen },
  { label: "Careers", path: "/admin/careers", icon: Briefcase },
  { label: "Applications", path: "/admin/applications", icon: ClipboardList },
  { label: "Subscribers", path: "/admin/subscribers", icon: Mail },
  { label: "Inquiries", path: "/admin/inquiries", icon: MessageSquare },
];

const utilityNavItems = [
  { label: "Settings", path: "/admin/settings", icon: Settings },
  { label: "Documentation", path: "/admin/documentation", icon: BookOpen },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSignOut = async () => { await signOut(); navigate("/admin/login"); };
  const initials = user?.email?.slice(0, 2).toUpperCase() || "AD";

  const NavItem = ({ item }: { item: typeof contentNavItems[0] }) => {
    const isActive = item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={`flex items-center gap-3 rounded-lg text-sm transition-all duration-200 group relative ${
          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
        } ${
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
        )}
        <Icon size={18} className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"} />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {isActive && <ChevronRight size={14} className="text-primary/50" />}
          </>
        )}
      </Link>
    );
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent-mid to-primary/40" />

      {/* Brand */}
      <div className={`h-16 flex items-center border-b border-border ${collapsed && !mobile ? "justify-center px-2" : "justify-between px-5"}`}>
        {collapsed && !mobile ? (
          <Link to="/" className="font-heading font-bold text-lg text-primary">R</Link>
        ) : (
          <Link to="/" className="flex items-center gap-2 font-heading font-semibold text-lg tracking-[-0.03em] text-foreground">
            Regent<span className="text-primary">.</span>
            <span className="text-[10px] font-mono tracking-wider uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
              CMS
            </span>
          </Link>
        )}
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 mt-2 overflow-y-auto">
        {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-3 mb-2">Content</p>}
        {contentNavItems.map(item => <NavItem key={item.path} item={item} />)}

        <div className={`my-3 border-t border-border ${collapsed ? "mx-1" : "mx-3"}`} />
        {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-3 mb-2">System</p>}
        {utilityNavItems.map(item => <NavItem key={item.path} item={item} />)}
      </nav>

      {/* View Site */}
      <div className={`px-3 mb-2 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <Link to="/" target="_blank" title="View Site" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink size={16} />
          </Link>
        ) : (
          <Link to="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 group">
            <ExternalLink size={16} />
            <span>View Site</span>
          </Link>
        )}
      </div>

      {/* Footer: theme toggle + collapse */}
      {!mobile && (
        <div className={`px-3 pb-2 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          <ThemeToggle />
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Expand sidebar"
            >
              <PanelLeft size={16} />
            </button>
          )}
        </div>
      )}
      {mobile && (
        <div className="px-3 pb-2 flex items-center justify-between">
          <ThemeToggle />
        </div>
      )}

      {/* User section */}
      <div className={`border-t border-border ${collapsed ? "p-2" : "p-4"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center mb-2" : "mb-3"}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-mid flex items-center justify-center text-[11px] font-semibold text-primary-foreground shrink-0 ring-2 ring-primary/20">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          title={collapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center gap-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 ${
            collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
          }`}
        >
          <LogOut size={16} />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 z-40 lg:hidden">
        <Link to="/" className="flex items-center gap-2 font-heading font-semibold text-lg tracking-[-0.03em] text-foreground">
          Regent<span className="text-primary">.</span>
          <span className="text-[10px] font-mono tracking-wider uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">CMS</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
            <Menu size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - mobile */}
      <aside className={`fixed top-0 left-0 bottom-0 w-[280px] bg-card border-r border-border flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarContent mobile />
      </aside>

      {/* Sidebar - desktop */}
      <aside className={`hidden lg:flex bg-card/50 backdrop-blur-xl border-r border-border flex-col shrink-0 relative overflow-hidden transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[260px]"
      }`}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
