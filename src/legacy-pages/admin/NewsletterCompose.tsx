"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Send, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewsletterCompose() {
  const supabase = createClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Missing content", description: "Please add a subject and body.", variant: "destructive" });
      return;
    }
    if (!confirm(`Send this newsletter to all subscribers?\n\nSubject: ${subject}`)) return;

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Use fetch directly — functions.invoke can silently drop auth headers
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-newsletter`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject: subject.trim(), html: body }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Send failed");
      }

      const data = await res.json();
      toast({
        title: "Newsletter sent!",
        description: `Delivered to ${data.sent} subscriber${data.sent !== 1 ? "s" : ""}${data.failed > 0 ? `. ${data.failed} failed.` : "."}`,
      });
      setSubject("");
      setBody("");
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to send", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-[800px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/subscribers" className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text-primary transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            Compose Newsletter
          </h1>
          <p className="text-sm text-text-muted mt-0.5">Write and send to all subscribers</p>
        </div>
      </div>

      {/* Subject */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-2">Subject Line</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="e.g. Regent Insights — March 2026"
          className="w-full h-12 border border-border rounded-lg px-4 text-sm text-text-primary bg-card outline-none focus:border-primary focus:ring-[3px] focus:ring-accent-light transition-all"
        />
      </div>

      {/* Body */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-text-primary mb-2">Email Body</label>
        <RichTextEditor content={body} onChange={setBody} />
      </div>

      {/* Preview */}
      {preview && (
        <div className="mb-8 border border-border rounded-2xl overflow-hidden">
          <div className="bg-surface px-6 py-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Preview</span>
            <button onClick={() => setPreview(false)} className="text-xs text-text-muted hover:text-text-primary">Close</button>
          </div>
          <div className="p-8 bg-card">
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
              <div className="font-heading text-xl font-semibold tracking-[-0.03em] text-text-primary mb-6">
                Regent<span className="text-primary">.</span>
              </div>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
              <div className="border-t border-border mt-8 pt-4">
                <p className="text-xs text-text-muted">© {new Date().getFullYear()} Regent Systems, Inc.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPreview(!preview)}
          className="inline-flex items-center gap-2 h-11 px-5 bg-card border border-border text-text-secondary rounded-lg text-sm font-medium hover:border-primary/30 hover:text-text-primary transition-all"
        >
          <Eye size={16} />
          {preview ? "Hide Preview" : "Preview"}
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !subject.trim() || !body.trim()}
          className="inline-flex items-center gap-2 h-11 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          <Send size={16} />
          {sending ? "Sending…" : "Send Newsletter"}
        </button>
      </div>
    </div>
  );
}