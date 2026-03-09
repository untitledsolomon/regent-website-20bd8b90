import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, FileText, BarChart3, FolderOpen, Mail, MessageSquare, Briefcase, LogOut, ExternalLink, ChevronRight } from "lucide-react";

const navItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Blog Posts", path: "/admin/posts", icon: FileText },
  { label: "Case Studies", path: "/admin/case-studies", icon: BarChart3 },
  { label: "Resources", path: "/admin/resources", icon: FolderOpen },
  { label: "Careers", path: "/admin/careers", icon: Briefcase },
  { label: "Subscribers", path: "/admin/subscribers", icon: Mail },
  { label: "Inquiries", path: "/admin/inquiries", icon: MessageSquare },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || "AD";

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-[260px] bg-card border-r border-border flex flex-col shrink-0 relative overflow-hidden">
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 mt-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted px-3 mb-2">Content</p>
          {navItems.map(item => {
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
                    : "text-text-secondary hover:bg-surface hover:text-text-primary"
                }`}
              >
                <Icon size={18} className={isActive ? "text-primary" : "text-text-muted group-hover:text-text-secondary transition-colors"} />
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
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-surface">
        <Outlet />
      </main>
    </div>
  );
}
