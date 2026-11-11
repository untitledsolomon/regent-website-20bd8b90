"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Sparkles, Loader2 } from "lucide-react";

const resourceTypes = ["Whitepaper", "Research", "Documentation", "Case Study"] as const;

export default function ResourceEditor() {
  const supabase = createClient();
  const { id } = useParams() as { id?: string };
  const isEdit = !!id;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", type: "Whitepaper" as string, description: "",
    file_url: "" as string | null, featured: false, published: false,
    meta_title: "", meta_description: "", og_image: "",
  });

  useEffect(() => {
    const autoSave = async () => {
      if (!form.title || !isEdit) return;
      try {
        await fetch('/api/admin/autosave', {
          method: 'POST',
          body: JSON.stringify({ id, type: 'resource', content: form })
        });
      } catch (e) {
        console.error("Autosave failed", e);
      }
    };
    const timer = setInterval(autoSave, 60000);
    return () => clearInterval(timer);
  }, [form, id, isEdit]);

  useEffect(() => {
    if (isEdit) {
      supabase.from("resources").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          const d = data as any; // generated types predate the SEO columns
          setForm({
            title: d.title, slug: d.slug, type: d.type,
            description: d.description, file_url: d.file_url,
            featured: d.featured, published: d.published,
            meta_title: d.meta_title ?? "", meta_description: d.meta_description ?? "",
            og_image: d.og_image ?? "",
          });
        }
      });
    }
  }, [id, isEdit]);

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${form.slug || "file"}.${ext}`;
    const { error } = await supabase.storage.from("resource-files").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from("resource-files").getPublicUrl(path);
      setForm(f => ({ ...f, file_url: publicUrl }));
      toast({ title: "File uploaded" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast({ title: "Title and slug required", variant: "destructive" }); return; }
    setLoading(true);
    const payload = {
      title: form.title, slug: form.slug, type: form.type as any,
      description: form.description, file_url: form.file_url || null,
      featured: form.featured, published: form.published,
      meta_title: form.meta_title || null, meta_description: form.meta_description || null,
      og_image: form.og_image || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = isEdit
      ? await supabase.from("resources").update(payload).eq("id", id)
      : await supabase.from("resources").insert(payload);
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: isEdit ? "Updated" : "Created" }); router.push("/admin/resources"); }
  };

  const generateSeo = async () => {
    if (!form.title.trim()) { toast({ title: "Add a title first", variant: "destructive" }); return; }
    setAiBusy(true);
    try {
      const res = await fetch("/api/admin/ai/editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, body: form.description || form.title }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "AI generation failed");
      setForm((f) => ({
        ...f,
        meta_title: f.meta_title || f.title,
        meta_description: data.meta_description || f.meta_description,
      }));
      toast({ title: "SEO draft generated", description: "Review the meta description, then save." });
    } catch (e) {
      toast({ title: "Generation failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setAiBusy(false);
    }
  };

  const inputClass = "w-full h-10 border border-border rounded-lg px-3 text-sm bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary">
          {isEdit ? "Edit Resource" : "New Resource"}
        </h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="rounded border-border" />
            Featured
          </label>
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
            <label className="block text-sm font-medium text-text-primary mb-1.5">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputClass}>
              {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
          <RichTextEditor content={form.description} onChange={val => setForm(f => ({ ...f, description: val }))} placeholder="Describe this resource..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">File (PDF)</label>
          <div className="flex items-center gap-3">
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="text-sm text-text-secondary" />
            {uploading && <span className="text-xs text-text-muted">Uploading...</span>}
          </div>
          {form.file_url && (
            <a href={form.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">
              View uploaded file →
            </a>
          )}
        </div>

        {/* SEO */}
        <div className="border-t border-border pt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">SEO</h2>
            <button
              onClick={generateSeo}
              disabled={aiBusy}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary/5 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/10 transition-all disabled:opacity-50"
            >
              {aiBusy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {aiBusy ? "Generating…" : "Generate with AI"}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Meta title</label>
              <input value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} placeholder="Under 60 characters — appears in search results" className={inputClass} />
              <p className="text-[11px] text-text-muted mt-1">{form.meta_title.length}/60</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Meta description</label>
              <textarea value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} rows={3} placeholder="One or two sentences — the search result snippet" className={`${inputClass} h-auto resize-y py-2`} />
              <p className="text-[11px] text-text-muted mt-1">{form.meta_description.length}/160</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Open Graph image URL</label>
              <input value={form.og_image} onChange={e => setForm(f => ({ ...f, og_image: e.target.value }))} placeholder="https://… (used when shared to social)" className={`${inputClass} font-mono`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
