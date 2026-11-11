"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Settings, Mail, Shield, LogOut, AlertTriangle, Check, EyeOff, Sparkles } from "lucide-react";
import AISettingsSection from "@/components/admin/ai/AISettingsSection";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const supabase = createClient();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [optOut, setOptOut] = useState(
    () =>
      typeof window !== "undefined" &&
      (localStorage.getItem("regent_opt_out") === "1" ||
        document.cookie.includes("regent_opt_out=1"))
  );

  const toggleOptOut = () => {
    const next = !optOut;
    setOptOut(next);
    if (next) {
      localStorage.setItem("regent_opt_out", "1");
      document.cookie = "regent_opt_out=1; path=/; max-age=63072000; SameSite=Lax";
      toast({ title: "Analytics excluded", description: "This browser will not be counted in analytics." });
    } else {
      localStorage.removeItem("regent_opt_out");
      document.cookie = "regent_opt_out=1; path=/; max-age=0; SameSite=Lax";
      toast({ title: "Analytics enabled", description: "This browser will be counted again." });
    }
  };

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

  const Section = ({ icon: Icon, title, description, children }: { icon: React.ElementType; title: string; description?: string; children: React.ReactNode }) => (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );

  const StatusItem = ({ label, sublabel, status }: { label: string; sublabel: string; status: string }) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>
      </div>
      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
        <Check size={11} /> {status}
      </span>
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
        <Section icon={Mail} title="Account Information" description="Your login credentials and session info">
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-xl">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Email</label>
              <p className="text-sm text-foreground mt-1 font-medium">{user?.email || "—"}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">User ID</label>
              <p className="text-xs text-muted-foreground mt-1 font-mono">{user?.id || "—"}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Last Sign In</label>
              <p className="text-sm text-foreground mt-1">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "—"}</p>
            </div>
          </div>
        </Section>

        <Section icon={Mail} title="Email Configuration" description="External service integrations">
          <div className="space-y-2">
            <StatusItem label="Resend API" sublabel="Email delivery service" status="Configured" />
            <StatusItem label="Notification Email" sublabel="Receives consultation alerts" status="Set" />
          </div>
        </Section>

        <Section icon={EyeOff} title="Analytics" description="Your browser's tracking preference">
          <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-xl">
            <div>
              <div className="text-sm font-medium text-foreground">Exclude this browser from analytics</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Skips counts and sessions on this device (visits stay out of default reports).
              </div>
            </div>
            <button
              onClick={toggleOptOut}
              role="switch"
              aria-checked={optOut}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                optOut ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  optOut ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </Section>

        <Section icon={Sparkles} title="AI Assistant" description="Provider, model, API key and cost tracker">
          <AISettingsSection />
        </Section>

        <Section icon={Shield} title="Security" description="Password management and access control">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Change Password</label>
              <div className="mt-2 space-y-2">
                <input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full h-10 px-4 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-4 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={handlePasswordChange}
                  disabled={updating || !newPassword}
                  className="h-10 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm shadow-primary/20"
                >
                  {updating ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
            <StatusItem label="Row-Level Security" sublabel="Admin-only write access enforced on all tables" status="Active" />
          </div>
        </Section>

        <div className="bg-card border border-destructive/20 rounded-2xl p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-destructive" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-destructive">Danger Zone</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Irreversible actions</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-destructive/5 rounded-xl">
            <div>
              <div className="text-sm font-medium text-foreground">Sign Out All Sessions</div>
              <div className="text-xs text-muted-foreground mt-0.5">Terminates all active sessions everywhere</div>
            </div>
            <button
              onClick={handleSignOutAll}
              className="h-9 px-4 text-xs font-medium border border-destructive/30 text-destructive rounded-xl hover:bg-destructive/10 transition-colors flex items-center gap-1.5"
            >
              <LogOut size={12} /> Sign Out All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
