import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Upload, X, Loader2 } from "lucide-react";

export default function CaseStudyEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "", slug: "", industry: "", summary: "", challenge: "", solution: "",
    results: [""], metrics: [{ value: "", label: "" }], published: false, image_url: "",
  });

  useEffect(() => {
    if (isEdit) {
      supabase.from("case_studies").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setForm({
          title: data.title, slug: data.slug, industry: data.industry,
          summary: data.summary, challenge: data.challenge, solution: data.solution,
          results: (data.results as string[])?.length ? data.results as string[] : [""],
          metrics: (data.metrics as any[])?.length ? data.metrics as any[] : [{ value: "", label: "" }],
          published: data.published,
          image_url: (data as any).image_url || "",
        });
      });
    }
  }, [id, isEdit]);

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
    };
    const { error } = isEdit
      ? await supabase.from("case_studies").update(payload).eq("id", id)
      : await supabase.from("case_studies").insert(payload);
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: isEdit ? "Updated" : "Created" }); navigate("/admin/case-studies"); }
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
      </div>
    </div>
  );
}
