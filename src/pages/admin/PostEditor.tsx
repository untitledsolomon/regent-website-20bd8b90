import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { ArrowLeft, Upload, X, Image as ImageIcon, Save, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export default function PostEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "Regent Editorial",
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    category: "",
    read_time: "",
    image_url: "" as string | null,
    published: false,
  });

  useEffect(() => {
    if (isEdit) {
      supabase.from("blog_posts").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setForm({
          title: data.title, slug: data.slug, excerpt: data.excerpt,
          content: data.content, author: data.author, date: data.date,
          category: data.category, read_time: data.read_time,
          image_url: (data as any).image_url || null, published: data.published,
        });
      });
    }
  }, [id, isEdit]);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: isEdit ? f.slug : generateSlug(title) }));
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `covers/${Date.now()}-${form.slug || "img"}.${ext}`;
    const { error } = await supabase.storage.from("resource-files").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from("resource-files").getPublicUrl(path);
      setForm(f => ({ ...f, image_url: publicUrl }));
      toast({ title: "Image uploaded" });
    }
    setUploading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) uploadFile(file);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const payload = {
      title: form.title, slug: form.slug, excerpt: form.excerpt,
      content: form.content, author: form.author, date: form.date,
      category: form.category, read_time: form.read_time,
      image_url: form.image_url || null, published: form.published,
      updated_at: new Date().toISOString(),
    };

    const { error } = isEdit
      ? await supabase.from("blog_posts").update(payload).eq("id", id)
      : await supabase.from("blog_posts").insert(payload);

    setLoading(false);
    if (error) {
      toast({ title: "Error saving post", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isEdit ? "Post updated" : "Post created" });
      navigate("/admin/posts");
    }
  };

  const inputClass = "w-full h-10 border border-border rounded-lg px-3 text-sm bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-8 h-14">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/admin" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface transition-colors">
              <ArrowLeft size={16} className="text-text-muted" />
            </Link>
            <h1 className="font-heading text-sm sm:text-base font-semibold text-text-primary">
              {isEdit ? "Edit Post" : "New Post"}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-text-secondary cursor-pointer select-none hover:text-text-primary transition-colors">
              <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="rounded border-border accent-primary" />
              <Eye size={14} className="hidden sm:inline" />
              <span className="hidden sm:inline">Published</span>
              <span className="sm:hidden">Live</span>
            </label>
            <button
              onClick={handleSave}
              disabled={loading}
              className="h-8 sm:h-9 px-3 sm:px-5 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1.5 sm:gap-2 shadow-sm shadow-primary/20"
            >
              <Save size={14} />
              <span className="hidden sm:inline">{loading ? "Saving..." : "Save"}</span>
              <span className="sm:hidden">{loading ? "..." : "Save"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 px-4 sm:px-8 py-6 sm:py-8 w-full">
        <div className="space-y-5 sm:space-y-6">
          {/* Title — large input */}
          <div>
            <input
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Post title..."
              className="w-full text-xl sm:text-2xl lg:text-3xl font-heading font-semibold tracking-[-0.03em] text-text-primary bg-transparent border-0 outline-none placeholder:text-text-muted/40"
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-text-muted font-mono">/blog/</span>
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="text-xs font-mono text-text-secondary bg-transparent border-0 outline-none flex-1"
                placeholder="post-slug"
              />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Cover Image — Drop zone */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">Cover Image</label>
            {form.image_url ? (
              <div className="relative rounded-xl overflow-hidden border border-border group">
                <img src={form.image_url} alt="Cover" className="w-full h-36 sm:h-48 object-cover" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-200" />
                <button
                  onClick={() => setForm(f => ({ ...f, image_url: null }))}
                  className="absolute top-3 right-3 h-8 w-8 bg-card/90 backdrop-blur rounded-lg flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground border border-border transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer ${
                  dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-surface"
                }`}
                onClick={() => document.getElementById("cover-upload")?.click()}
              >
                <input id="cover-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface border border-border flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <ImageIcon size={18} className="text-text-muted sm:w-5 sm:h-5" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-text-secondary">
                  {uploading ? "Uploading..." : "Drop image here or click to upload"}
                </p>
                <p className="text-xs text-text-muted mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>

          {/* Meta fields */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2 sm:mb-3">Post Details</label>
            <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Category</label>
                  <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputClass} placeholder="e.g. AI, Technology" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Read Time</label>
                  <input value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: e.target.value }))} placeholder="e.g. 8 min" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Author</label>
                  <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Date</label>
                  <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              rows={3}
              placeholder="Brief summary of the post..."
              className={`${inputClass} h-auto py-2.5 resize-y`}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">Content</label>
            <RichTextEditor content={form.content} onChange={content => setForm(f => ({ ...f, content }))} placeholder="Write your blog post..." />
          </div>
        </div>
      </div>
    </div>
  );
}
