"use client";

// "Add Lead" dialog in the admin topbar. Inserts a consultation request so the
// lead shows up in the normal Leads inbox with all its tooling (reply, triage,
// status). One small, real form instead of a dead button.

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const FIELD = "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all";

export default function AddLeadDialog() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", industry: "", size: "", budget: "", message: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await (supabase as any).from("consultation_requests").insert({
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim(),
        industry: form.industry.trim() || null,
        size: form.size.trim() || null,
        budget: form.budget.trim() || null,
        message: form.message.trim() || null,
        status: "new",
      });
      if (error) throw error;
      toast({ title: "Lead added", description: `${form.name.trim()} is now in the leads inbox.` });
      setForm({ name: "", company: "", email: "", industry: "", size: "", budget: "", message: "" });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "consultations"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    } catch (err) {
      toast({ title: "Failed to add lead", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl px-5">
          <Plus size={15} className="mr-1.5" /> Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Add a lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
              <input value={form.name} onChange={set("name")} className={FIELD} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
              <input type="email" value={form.email} onChange={set("email")} className={FIELD} placeholder="jane@company.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Company</label>
              <input value={form.company} onChange={set("company")} className={FIELD} placeholder="Company Inc." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Industry</label>
              <input value={form.industry} onChange={set("industry")} className={FIELD} placeholder="SaaS" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Company size</label>
              <input value={form.size} onChange={set("size")} className={FIELD} placeholder="1–10" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Budget</label>
              <input value={form.budget} onChange={set("budget")} className={FIELD} placeholder="Not disclosed" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
            <textarea
              value={form.message}
              onChange={set("message")}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all resize-none"
              placeholder="What are they asking for?"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl" disabled={saving}>
              {saving ? <Loader2 size={15} className="animate-spin mr-1.5" /> : <Plus size={15} className="mr-1.5" />}
              Add lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
