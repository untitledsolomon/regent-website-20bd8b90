"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/admin/RichTextEditor";

const resourceTypes = ["Whitepaper", "Research", "Documentation", "Case Study"] as const;

export default function ResourceEditor() {
  const supabase = createClient();
  const { id } = useParams() as { id?: string };
  const isEdit = !!id;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", type: "Whitepaper" as string, description: "",
    file_url: "" as string | null, featured: false, published: false,
  });

  useEffect(() => {
    if (isEdit) {
      supabase.from("resources").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setForm({
          title: data.title, slug: data.slug, type: data.type,
          description: data.description, file_url: data.file_url,
          featured: data.featured, published: data.published,
        });
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
      updated_at: new Date().toISOString(),
    };
    const { error } = isEdit
      ? await supabase.from("resources").update(payload).eq("id", id)
      : await supabase.from("resources").insert(payload);
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: isEdit ? "Updated" : "Created" }); router.push("/admin/resources"); }
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
      </div>
    </div>
  );
}
