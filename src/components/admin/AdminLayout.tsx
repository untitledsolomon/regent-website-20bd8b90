import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, FileText, BarChart3, FolderOpen, Mail, MessageSquare, Briefcase, LogOut, ExternalLink, ChevronRight, Menu, X, Settings, BookOpen, Activity } from "lucide-react";

const contentNavItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Analytics", path: "/admin/analytics", icon: Activity },
  { label: "Blog Posts", path: "/admin/posts", icon: FileText },
  { label: "Case Studies", path: "/admin/case-studies", icon: BarChart3 },
  { label: "Resources", path: "/admin/resources", icon: FolderOpen },
  { label: "Careers", path: "/admin/careers", icon: Briefcase },
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

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || "AD";

  const SidebarContent = () => (
    <>
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent-mid to-primary/40" />

      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border">
        <Link to="/" className="flex items-center gap-2 font-heading font-semibold text-lg tracking-[-0.03em] text-text-primary">
          Regent<span className="text-primary">.</span>
          <span className="text-[10px] font-mono tracking-wider uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
            CMS
          </span>
        </Link>
        {/* Close button on mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
        >
          <X size={18} className="text-text-muted" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 mt-2 overflow-y-auto">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-3 mb-2">Content</p>
        {contentNavItems.map(item => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary font-medium shadow-sm shadow-primary/5"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={18} className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-primary/50" />}
            </Link>
          );
        })}

        <div className="my-3 mx-3 border-t border-border" />
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-3 mb-2">System</p>
        {utilityNavItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary font-medium shadow-sm shadow-primary/5"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={18} className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-primary/50" />}
            </Link>
          );
        })}
      </nav>

      {/* View Site Link */}
      <div className="px-3 mb-2">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:bg-surface hover:text-text-secondary transition-all duration-200 group"
        >
          <ExternalLink size={18} className="text-text-muted group-hover:text-text-secondary transition-colors" />
          <span>View Site</span>
        </Link>
      </div>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-mid flex items-center justify-center text-[11px] font-semibold text-primary-foreground shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-text-muted truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-40 lg:hidden">
        <Link to="/" className="flex items-center gap-2 font-heading font-semibold text-lg tracking-[-0.03em] text-text-primary">
          Regent<span className="text-primary">.</span>
          <span className="text-[10px] font-mono tracking-wider uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
            CMS
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
        >
          <Menu size={20} className="text-text-primary" />
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - mobile (overlay) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-card border-r border-border flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - desktop (static) */}
      <aside className="hidden lg:flex w-[260px] bg-card border-r border-border flex-col shrink-0 relative overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-surface pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
