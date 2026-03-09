import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Mail, Shield, Key, LogOut, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters required.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleSignOutAll = async () => {
    await supabase.auth.signOut({ scope: "global" });
    toast({ title: "Signed out everywhere", description: "All sessions have been terminated." });
  };

  const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
      <h3 className="font-heading text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon size={16} className="text-primary" /> {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[800px]">
      <div className="mb-8">
        <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Settings size={22} className="text-primary" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and application preferences.</p>
      </div>

      <div className="space-y-4">
        {/* General */}
        <Section icon={Mail} title="Account Information">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <p className="text-sm text-foreground mt-1 font-medium">{user?.email || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</label>
              <p className="text-xs text-muted-foreground mt-1 font-mono">{user?.id || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Sign In</label>
              <p className="text-sm text-foreground mt-1">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "—"}
              </p>
            </div>
          </div>
        </Section>

        {/* Email Configuration */}
        <Section icon={Mail} title="Email Configuration">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="text-sm font-medium text-foreground">Resend API</div>
                <div className="text-xs text-muted-foreground mt-0.5">Email delivery service</div>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">Configured</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="text-sm font-medium text-foreground">Notification Email</div>
                <div className="text-xs text-muted-foreground mt-0.5">Receives consultation alerts</div>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">Set</span>
            </div>
          </div>
        </Section>

        {/* Security */}
        <Section icon={Shield} title="Security">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Change Password</label>
              <div className="mt-2 space-y-2">
                <input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={handlePasswordChange}
                  disabled={updating || !newPassword}
                  className="h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="text-sm font-medium text-foreground">Row-Level Security</div>
                <div className="text-xs text-muted-foreground mt-0.5">Admin-only write access enforced on all tables</div>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">Active</span>
            </div>
          </div>
        </Section>

        {/* Danger Zone */}
        <div className="bg-card border border-destructive/30 rounded-xl p-5 sm:p-6">
          <h3 className="font-heading text-sm font-semibold text-destructive mb-4 flex items-center gap-2">
            <AlertTriangle size={16} /> Danger Zone
          </h3>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-destructive/5 rounded-lg">
              <div>
                <div className="text-sm font-medium text-foreground">Sign Out All Sessions</div>
                <div className="text-xs text-muted-foreground mt-0.5">Terminates all active sessions everywhere</div>
              </div>
              <button
                onClick={handleSignOutAll}
                className="h-8 px-3 text-xs font-medium border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={12} className="inline mr-1.5" /> Sign Out All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
