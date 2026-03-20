"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Download, Trash2, Users } from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
}

export default function SubscriberList() {
  const supabase = createClient();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading subscribers", variant: "destructive" });
    } else {
      setSubscribers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) {
      toast({ title: "Error removing subscriber", variant: "destructive" });
    } else {
      setSubscribers(prev => prev.filter(s => s.id !== id));
      toast({ title: "Subscriber removed" });
    }
  };

  const exportCSV = () => {
    const header = "Email,Source,Subscribed Date\n";
    const rows = subscribers.map(s =>
      `"${s.email}","${s.source || ""}","${format(new Date(s.created_at), "yyyy-MM-dd HH:mm")}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-10">
        <div className="h-10 w-48 bg-card border border-border rounded-lg animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary flex items-center gap-3">
            <Mail size={24} className="text-primary" />
            Subscribers
          </h1>
          <p className="text-sm text-text-muted mt-1">Manage your newsletter audience</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={subscribers.length === 0}
          className="inline-flex items-center gap-2 h-10 px-5 bg-card border border-border text-text-secondary rounded-lg text-sm font-medium hover:border-primary/30 hover:text-text-primary transition-all disabled:opacity-50"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stat */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8 inline-flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
          <Users size={20} className="text-primary" />
        </div>
        <div>
          <div className="text-3xl font-heading font-semibold text-text-primary tracking-tight">{subscribers.length}</div>
          <div className="text-sm text-text-secondary font-medium">Total subscribers</div>
        </div>
      </div>

      {/* Table */}
      {subscribers.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-primary" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-text-primary mb-1">No subscribers yet</h3>
          <p className="text-sm text-text-muted">Subscribers will appear here when people sign up via the site.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 font-medium text-text-muted text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 font-medium text-text-muted text-xs uppercase tracking-wider">Source</th>
                <th className="text-left px-6 py-4 font-medium text-text-muted text-xs uppercase tracking-wider">Date</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscribers.map(sub => (
                <tr key={sub.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4 text-text-primary font-medium">{sub.email}</td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {sub.source || "direct"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-muted">{format(new Date(sub.created_at), "MMM d, yyyy")}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="p-2 rounded-lg text-text-muted hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
