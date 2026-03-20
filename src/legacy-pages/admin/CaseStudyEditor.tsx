"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Upload, X, Loader2, CalendarIcon, ChevronDown } from "lucide-react";
import { logActivity } from "@/hooks/useActivityLog";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DRAFT_KEY_PREFIX = "regent_cs_draft_";

export default function CaseStudyEditor() {
  const supabase = createClient();
  const { id } = useParams() as { id?: string };
  const isEdit = !!id;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [draftBanner, setDraftBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [form, setForm] = useState({
    title: "", slug: "", industry: "", summary: "", challenge: "", solution: "",
    results: [""], metrics: [{ value: "", label: "" }], published: false, image_url: "",
    publish_at: null as Date | null,
    meta_title: "", meta_description: "", og_image: "",
  });

  const draftKey = DRAFT_KEY_PREFIX + (id || "new");

  useEffect(() => {
    if (isEdit) {
      supabase.from("case_studies").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          const d = data as any;
          setForm({
            title: d.title, slug: d.slug, industry: d.industry,
            summary: d.summary, challenge: d.challenge, solution: d.solution,
            results: (d.results as string[])?.length ? d.results as string[] : [""],
            metrics: (d.metrics as any[])?.length ? d.metrics as any[] : [{ value: "", label: "" }],
            published: d.published, image_url: d.image_url || "",
            publish_at: d.publish_at ? new Date(d.publish_at) : null,
            meta_title: d.meta_title || "", meta_description: d.meta_description || "", og_image: d.og_image || "",
          });
        }
      });
    }
    const saved = localStorage.getItem(draftKey);
    if (saved) setDraftBanner(true);
  }, [id, isEdit]);

  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      localStorage.setItem(draftKey, JSON.stringify(form));
    }, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [form, draftKey]);

  const restoreDraft = () => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.publish_at) parsed.publish_at = new Date(parsed.publish_at);
      setForm(parsed);
    }
    setDraftBanner(false);
  };
  const discardDraft = () => { localStorage.removeItem(draftKey); setDraftBanner(false); };

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `case-study-covers/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("resource-files").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("resource-files").getPublicUrl(path);
      setForm(f => ({ ...f, image_url: urlData.publicUrl }));
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast({ title: "Title and slug required", variant: "destructive" }); return; }
    setLoading(true);
    const payload: any = {
      title: form.title, slug: form.slug, industry: form.industry,
      summary: form.summary, challenge: form.challenge, solution: form.solution,
      results: form.results.filter(r => r.trim()),
      metrics: form.metrics.filter(m => m.value.trim() || m.label.trim()),
      published: form.published, updated_at: new Date().toISOString(),
      image_url: form.image_url || null,
      publish_at: form.publish_at?.toISOString() || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      og_image: form.og_image || null,
    };
    const { error } = isEdit
      ? await supabase.from("case_studies").update(payload).eq("id", id)
      : await supabase.from("case_studies").insert(payload);
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      localStorage.removeItem(draftKey);
      await logActivity(isEdit ? "updated_case_study" : "created_case_study", "case_study", form.title, id);
      toast({ title: isEdit ? "Updated" : "Created" });
      router.push("/admin/case-studies");
    }
  };

  const updateResult = (i: number, val: string) => {
    const r = [...form.results]; r[i] = val; setForm(f => ({ ...f, results: r }));
  };
  const addResult = () => setForm(f => ({ ...f, results: [...f.results, ""] }));
  const removeResult = (i: number) => setForm(f => ({ ...f, results: f.results.filter((_, j) => j !== i) }));

  const updateMetric = (i: number, key: "value" | "label", val: string) => {
    const m = [...form.metrics]; m[i] = { ...m[i], [key]: val }; setForm(f => ({ ...f, metrics: m }));
  };
  const addMetric = () => setForm(f => ({ ...f, metrics: [...f.metrics, { value: "", label: "" }] }));
  const removeMetric = (i: number) => setForm(f => ({ ...f, metrics: f.metrics.filter((_, j) => j !== i) }));

  const inputClass = "w-full h-10 border border-border rounded-lg px-3 text-sm bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all";

  return (
    <div className="p-8">
      {draftBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">Unsaved draft found — would you like to restore it?</p>
          <div className="flex gap-2">
            <button onClick={restoreDraft} className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">Restore</button>
            <button onClick={discardDraft} className="text-xs px-3 py-1.5 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">Discard</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary">
          {isEdit ? "Edit Case Study" : "New Case Study"}
        </h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="rounded border-border" />
            Published
          </label>
          <button onClick={handleSave} disabled={loading} className="h-9 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Cover Image</label>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }} />
          {form.image_url ? (
            <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
              <img src={form.image_url} alt="Cover" className="w-full h-48 object-cover" />
              <button onClick={() => setForm(f => ({ ...f, image_url: "" }))} className="absolute top-2 right-2 h-7 w-7 bg-background/80 backdrop-blur rounded-full flex items-center justify-center text-text-secondary hover:text-destructive transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              className="w-full h-36 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-text-muted hover:border-primary/40 hover:text-primary transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageUpload(f); }}
            >
              {imageUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload size={20} />}
              <span className="text-sm">{imageUploading ? "Uploading..." : "Click or drag to upload cover image"}</span>
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Title</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: isEdit ? f.slug : generateSlug(e.target.value) }))} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Slug</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Industry</label>
            <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className={inputClass} />
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Schedule Publish</label>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className={cn("h-10 border border-border rounded-lg px-3 text-sm bg-background text-left flex items-center gap-2 min-w-[200px]", !form.publish_at && "text-text-muted")}>
                  <CalendarIcon size={14} />
                  {form.publish_at ? format(form.publish_at, "PPP") : "No schedule (immediate)"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={form.publish_at || undefined} onSelect={(d) => setForm(f => ({ ...f, publish_at: d || null }))} disabled={(date) => date < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            {form.publish_at && <button onClick={() => setForm(f => ({ ...f, publish_at: null }))} className="text-xs text-destructive hover:underline">Clear</button>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Summary</label>
          <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} rows={3} className={`${inputClass} h-auto py-2.5 resize-y`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Challenge</label>
          <RichTextEditor content={form.challenge} onChange={val => setForm(f => ({ ...f, challenge: val }))} placeholder="Describe the challenge..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Solution</label>
          <RichTextEditor content={form.solution} onChange={val => setForm(f => ({ ...f, solution: val }))} placeholder="Describe the solution..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Results</label>
          <div className="space-y-2">
            {form.results.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input value={r} onChange={e => updateResult(i, e.target.value)} className={`${inputClass} flex-1`} placeholder="Result..." />
                <button onClick={() => removeResult(i)} className="text-xs px-2 text-destructive hover:bg-destructive/10 rounded transition-colors">✕</button>
              </div>
            ))}
            <button onClick={addResult} className="text-xs text-primary hover:underline">+ Add result</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Metrics</label>
          <div className="space-y-2">
            {form.metrics.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input value={m.value} onChange={e => updateMetric(i, "value", e.target.value)} className={`${inputClass} w-32`} placeholder="Value" />
                <input value={m.label} onChange={e => updateMetric(i, "label", e.target.value)} className={`${inputClass} flex-1`} placeholder="Label" />
                <button onClick={() => removeMetric(i)} className="text-xs px-2 text-destructive hover:bg-destructive/10 rounded transition-colors">✕</button>
              </div>
            ))}
            <button onClick={addMetric} className="text-xs text-primary hover:underline">+ Add metric</button>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button onClick={() => setShowSeo(!showSeo)} className="w-full flex items-center justify-between px-5 py-3.5 bg-card hover:bg-surface transition-colors">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">SEO Settings</span>
            <ChevronDown size={16} className={cn("text-text-muted transition-transform", showSeo && "rotate-180")} />
          </button>
          {showSeo && (
            <div className="p-4 sm:p-5 space-y-4 border-t border-border">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Meta Title</label>
                <input value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} className={inputClass} placeholder="Custom title for search engines" />
                <p className="text-xs text-text-muted mt-1">{form.meta_title.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Meta Description</label>
                <textarea value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} rows={2} className={`${inputClass} h-auto py-2.5 resize-y`} placeholder="Custom description for search engines" />
                <p className="text-xs text-text-muted mt-1">{form.meta_description.length}/160 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">OG Image URL</label>
                <input value={form.og_image} onChange={e => setForm(f => ({ ...f, og_image: e.target.value }))} className={inputClass} placeholder="Custom social sharing image URL" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
