import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Building2, Send, Save, Clock, User, DollarSign, Users } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
type ConsultationStatus = "new" | "viewed" | "replied" | "closed";

interface Consultation {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  industry: string | null;
  size: string | null;
  budget: string | null;
  message: string | null;
  status: ConsultationStatus;
  admin_notes: string | null;
  replied_at: string | null;
  replied_by: string | null;
  created_at: string;
}

const statusColors: Record<ConsultationStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  viewed: "bg-yellow-100 text-yellow-700",
  replied: "bg-emerald-100 text-emerald-700",
  closed: "bg-muted text-muted-foreground",
};

export default function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState<ConsultationStatus>("new");
  const [saving, setSaving] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("consultation_requests")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        toast({ title: "Not found", variant: "destructive" });
        navigate("/admin/inquiries");
        return;
      }
      setItem(data as Consultation);
      setAdminNotes(data.admin_notes || "");
      setStatus(data.status as ConsultationStatus);

      // Auto-mark as viewed if new
      if (data.status === "new") {
        await supabase.from("consultation_requests").update({ status: "viewed" }).eq("id", id);
        setStatus("viewed");
      }
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    const { error } = await supabase.from("consultation_requests").update({
      admin_notes: adminNotes || null,
      status,
    }).eq("id", id);
    if (error) {
      toast({ title: "Error saving", variant: "destructive" });
    } else {
      toast({ title: "Saved" });
    }
    setSaving(false);
  };

  const handleReply = async () => {
    if (!id || !item || !replySubject.trim() || !replyBody.trim()) {
      toast({ title: "Please fill in subject and message", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("reply-consultation", {
        body: {
          consultation_id: id,
          to_email: item.email,
          to_name: item.name,
          subject: replySubject.trim(),
          body: replyBody.trim(),
        },
      });
      if (error) throw error;
      toast({ title: "Reply sent", description: `Email sent to ${item.email}` });
      setReplyOpen(false);
      setReplySubject("");
      setReplyBody("");
      setStatus("replied");
      setItem(prev => prev ? { ...prev, status: "replied", replied_at: new Date().toISOString() } : prev);
    } catch (err) {
      toast({ title: "Failed to send", description: "Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-10">
        <div className="h-8 w-48 bg-card border border-border rounded-lg animate-pulse mb-8" />
        <div className="h-64 bg-card border border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate("/admin/inquiries")} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-4 sm:mb-6">
        <ArrowLeft size={16} /> Back to Inquiries
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-text-primary">{item.name}</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1"><Building2 size={14} /> {item.company}</span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
          </p>
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value as ConsultationStatus)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer ${statusColors[status]} self-start`}
        >
          <option value="new">New</option>
          <option value="viewed">Viewed</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Contact Info */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3 sm:mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={15} className="text-text-muted shrink-0" />
            <a href={`mailto:${item.email}`} className="text-primary hover:underline truncate">{item.email}</a>
          </div>
          {item.phone && (
            <div className="flex items-center gap-3 text-sm">
              <User size={15} className="text-text-muted shrink-0" />
              <span className="text-text-secondary">{item.phone}</span>
            </div>
          )}
          {item.industry && (
            <div className="flex items-center gap-3 text-sm">
              <Building2 size={15} className="text-text-muted shrink-0" />
              <span className="text-text-secondary">{item.industry}</span>
            </div>
          )}
          {item.size && (
            <div className="flex items-center gap-3 text-sm">
              <Users size={15} className="text-text-muted shrink-0" />
              <span className="text-text-secondary">{item.size}</span>
            </div>
          )}
          {item.budget && (
            <div className="flex items-center gap-3 text-sm">
              <DollarSign size={15} className="text-text-muted shrink-0" />
              <span className="text-text-secondary">{item.budget}</span>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {item.message && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-2 sm:mb-3">Message</h3>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{item.message}</p>
        </div>
      )}

      {/* Replied info */}
      {item.replied_at && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-sm text-emerald-700 flex items-center gap-2">
          <Send size={14} /> Replied on {format(new Date(item.replied_at), "MMM d, yyyy 'at' h:mm a")}
        </div>
      )}

      {/* Admin Notes */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-sm font-semibold text-text-primary mb-2 sm:mb-3">Internal Notes</h3>
        <textarea
          value={adminNotes}
          onChange={e => setAdminNotes(e.target.value)}
          placeholder="Add internal notes about this inquiry..."
          className="w-full min-h-[100px] border border-border rounded-lg p-3 text-sm text-text-primary bg-surface outline-none resize-y focus:border-primary focus:ring-[3px] focus:ring-accent-light transition-all"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-3 flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* Reply section */}
      {!replyOpen ? (
        <button
          onClick={() => {
            setReplyOpen(true);
            setReplySubject(`Re: Your consultation request — Regent`);
          }}
          className="flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
        >
          <Send size={15} /> Reply via Email
        </button>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 sm:mb-4 flex items-center gap-2">
            <Send size={15} /> Reply to {item.name}
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">To</label>
              <div className="text-sm text-text-secondary truncate">{item.email}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">Subject</label>
              <input
                value={replySubject}
                onChange={e => setReplySubject(e.target.value)}
                className="w-full h-10 border border-border rounded-lg px-3 text-sm text-text-primary bg-surface outline-none focus:border-primary focus:ring-[3px] focus:ring-accent-light transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">Message</label>
              <textarea
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
                placeholder="Write your reply..."
                className="w-full min-h-[120px] sm:min-h-[160px] border border-border rounded-lg p-3 text-sm text-text-primary bg-surface outline-none resize-y focus:border-primary focus:ring-[3px] focus:ring-accent-light transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={handleReply}
                disabled={sending}
                className="flex items-center justify-center gap-2 h-9 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send size={14} /> {sending ? "Sending…" : "Send Reply"}
              </button>
              <button
                onClick={() => setReplyOpen(false)}
                className="h-9 px-4 text-sm text-text-muted hover:text-text-primary border border-border rounded-lg hover:bg-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
