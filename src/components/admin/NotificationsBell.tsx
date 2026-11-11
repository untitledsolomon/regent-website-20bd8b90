"use client";

// Real notification center for the admin topbar. Shows live counts for new
// consultation requests, unread AI insights and failed newsletter sends, with a
// "seen" marker kept in localStorage so the red dot clears once the menu opens.
// Data is cached via React Query like the rest of the admin.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell, MessageSquare, Sparkles, AlertTriangle, Inbox, CheckCheck, Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const SEEN_KEY = "admin-notifications-seen-at";

interface NotifState {
  newLeads: Array<{ id: string; name: string; email: string; created_at: string }>;
  insights: Array<{ id: string; title: string; category: string; target_url: string | null }>;
  failedSends: Array<{ id: string; subject: string; failed_count: number; sent_at: string }>;
  loading: boolean;
}

export default function NotificationsBell() {
  const supabase = createClient();
  const [seenAt, setSeenAt] = useState<number>(0);
  const [open, setOpen] = useState(false);

  // Read the "seen" marker on the client only (localStorage is not available
  // during server rendering).
  useEffect(() => {
    setSeenAt(Number(localStorage.getItem(SEEN_KEY)) || 0);
  }, []);

  const query = useQuery({
    queryKey: ["admin", "notifications"],
    staleTime: 30_000,
    queryFn: async (): Promise<NotifState> => {
      const [leadsRes, insightsRes, sendsRes] = await Promise.all([
        (supabase as any)
          .from("consultation_requests")
          .select("id, name, email, created_at")
          .eq("status", "new")
          .order("created_at", { ascending: false })
          .limit(5),
        (supabase as any)
          .from("ai_insights")
          .select("id, title, category, target_url")
          .is("dismissed_at", null)
          .order("generated_at", { ascending: false })
          .limit(3),
        (supabase as any)
          .from("newsletter_sends")
          .select("id, subject, failed_count, sent_at")
          .gt("failed_count", 0)
          .order("sent_at", { ascending: false })
          .limit(3),
      ]);
      return {
        newLeads: (leadsRes.data ?? []) as NotifState["newLeads"],
        insights: (insightsRes.data ?? []) as NotifState["insights"],
        failedSends: (sendsRes.data ?? []) as NotifState["failedSends"],
        loading: false,
      };
    },
  });

  const data = query.data;

  const items = useMemo(() => {
    const out: Array<{ id: string; title: string; body?: string; href: string; tone: "lead" | "insight" | "error"; }> = [];
    for (const l of data?.newLeads ?? []) {
      out.push({
        id: `lead-${l.id}`,
        title: `New lead: ${l.name}`,
        body: l.email,
        href: `/admin/inquiries/${l.id}`,
        tone: "lead",
      });
    }
    for (const i of data?.insights ?? []) {
      out.push({
        id: `insight-${i.id}`,
        title: i.title,
        href: i.target_url || "/admin",
        tone: "insight",
      });
    }
    for (const s of data?.failedSends ?? []) {
      out.push({
        id: `send-${s.id}`,
        title: `${s.failed_count} failed in "${s.subject}"`,
        body: `Campaign ${formatDistanceToNow(new Date(s.sent_at), { addSuffix: true })}`,
        href: "/admin/emails",
        tone: "error",
      });
    }
    return out;
  }, [data]);

  const hasUnseen = items.some((it) => {
    if (it.id.startsWith("lead-")) {
      const lead = data?.newLeads.find((l) => `lead-${l.id}` === it.id);
      return lead ? new Date(lead.created_at).getTime() > seenAt : false;
    }
    if (it.id.startsWith("send-")) {
      const send = data?.failedSends.find((s) => `send-${s.id}` === it.id);
      return send ? new Date(send.sent_at).getTime() > seenAt : false;
    }
    // Insights have no timestamp fetched; treat as unseen only on first load.
    return false;
  });

  const openAndMarkSeen = () => {
    setOpen(true);
    setSeenAt(Date.now());
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  };

  return (
    <DropdownMenu open={open} onOpenChange={(o) => (o ? openAndMarkSeen() : setOpen(false))}>
      <DropdownMenuTrigger asChild>
        <button className="p-2 text-muted-foreground hover:text-foreground relative" aria-label="Notifications">
          <Bell size={20} />
          {hasUnseen && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card animate-pulse" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl mt-2 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          <button
            type="button"
            onClick={() => setSeenAt(Date.now())}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto p-1.5">
          {query.isLoading && !data ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              <Loader2 size={16} className="animate-spin mr-2" /> Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Inbox size={24} className="opacity-40" />
              <p className="text-sm">All caught up</p>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((it) => (
                <Link
                  key={it.id}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl p-2.5 hover:bg-muted/60 transition-colors",
                    it.tone === "error" && "text-destructive"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    it.tone === "lead" && "bg-primary/10 text-primary",
                    it.tone === "insight" && "bg-amber-500/10 text-amber-600",
                    it.tone === "error" && "bg-rose-500/10 text-rose-600"
                  )}>
                    {it.tone === "lead" && <MessageSquare size={15} />}
                    {it.tone === "insight" && <Sparkles size={15} />}
                    {it.tone === "error" && <AlertTriangle size={15} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground leading-snug">{it.title}</div>
                    {it.body && <div className="text-xs text-muted-foreground truncate">{it.body}</div>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <Link
          href="/admin/inquiries"
          onClick={() => setOpen(false)}
          className="block text-center text-xs font-medium text-primary py-2.5 hover:bg-muted/50 rounded-b-xl"
        >
          View all leads
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
