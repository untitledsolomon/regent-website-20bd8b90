"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { ArrowLeft, Upload, X, Image as ImageIcon, Save, Eye, CalendarIcon, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { logActivity } from "@/hooks/useActivityLog";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DRAFT_KEY_PREFIX = "regent_post_draft_";

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  read_time: string;
  image_url: string | null;
  published: boolean;
  publish_at: Date | null;
  meta_title: string;
  meta_description: string;
  og_image: string;
}

export default function PostEditor() {
  const supabase = createClient();
  const { id } = useParams() as { id?: string };
  const isEdit = !!id && id !== "new";
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [draftBanner, setDraftBanner] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [form, setForm] = useState<PostForm>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "Regent Editorial",
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    category: "",
    read_time: "",
    image_url: null,
    published: false,
    publish_at: null,
    meta_title: "",
    meta_description: "",
    og_image: "",
  });

  const draftKey = DRAFT_KEY_PREFIX + (id || "new");

  useEffect(() => {
    if (!isEdit || !id) return; 
      
    const fetchPost = async () => {
      const {data, error} = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if(error) {
        console.error("Fetch error:", error);
        return;
      }

      if (data) {
        setForm({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || "",
          content: data.content || "",
          author: data.author,
          date: data.date,
          category: data.category || "",
          read_time: data.read_time || "",
          image_url: data.image_url || null,
          published: data.published,
          publish_at: data.publish_at ? new Date(data.publish_at) : null,
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          og_image: data.og_image || "",
        });
      }
    };

    fetchPost();
    // Check for local draft
    const saved = localStorage.getItem(draftKey);
    if (saved) setDraftBanner(true);
  }, [id, isEdit]);

  // Database-backed Auto-save every 60s
  useEffect(() => {
    const autoSave = async () => {
      if (!form.title || !isEdit) return;

      try {
        await fetch('/api/admin/autosave', {
          method: 'POST',
          body: JSON.stringify({
            id,
            type: 'blog_post',
            content: form
          })
        });
        setLastSaved(new Date());
        localStorage.setItem(draftKey, JSON.stringify(form));
      } catch (e) {
        console.error("Autosave failed", e);
      }
    };

    const timer = setInterval(autoSave, 60000);
    return () => clearInterval(timer);
  }, [form, id, isEdit, draftKey]);

  const restoreDraft = () => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.publish_at) parsed.publish_at = new Date(parsed.publish_at);
      setForm(parsed);
    }
    setDraftBanner(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(draftKey);
    setDraftBanner(false);
  };

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
      publish_at: form.publish_at?.toISOString() || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      og_image: form.og_image || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = isEdit
      ? await supabase.from("blog_posts").update(payload).eq("id", id)
      : await supabase.from("blog_posts").insert(payload);

    setLoading(false);
    if (error) {
      toast({ title: "Error saving post", description: error.message, variant: "destructive" });
    } else {
      localStorage.removeItem(draftKey);
      await logActivity(isEdit ? "updated_post" : "created_post", "blog_post", form.title, id);
      toast({ title: isEdit ? "Post updated" : "Post created" });
      router.push("/admin/posts");
    }
  };

  const inputClass = "w-full h-11 border border-border rounded-xl px-4 text-sm bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] dark:bg-background">
      {/* Draft restore banner */}
      {draftBanner && (
        <div className="bg-indigo-600 text-white px-8 py-3 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-indigo-200" />
            <p className="text-sm font-medium">We found an unsaved version of this post. Would you like to restore it?</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={restoreDraft} className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl px-5 font-bold">Restore</Button>
            <Button variant="ghost" size="sm" onClick={discardDraft} className="text-white hover:bg-white/10 rounded-xl px-5">Discard</Button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-8 h-16">
          <div className="flex items-center gap-4">
            <Link href="/admin/posts">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft size={18} className="text-muted-foreground" />
              </Button>
            </Link>
            <div>
              <h1 className="text-sm font-bold text-foreground">
                {isEdit ? "Edit Blog Post" : "Create New Post"}
              </h1>
              {lastSaved && (
                <p className="text-[10px] text-muted-foreground">Autosaved at {format(lastSaved, "HH:mm:ss")}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className={cn("rounded-full border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider", form.published ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-600")}>
              {form.published ? "Live" : "Draft"}
            </Badge>

            <div className="h-6 w-px bg-border mx-1" />

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="rounded-xl text-xs font-bold"
                onClick={() => setForm(f => ({ ...f, published: !f.published }))}
              >
                {form.published ? "Switch to Draft" : "Make Live"}
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="rounded-xl bg-primary hover:bg-primary/90 px-6 font-bold shadow-lg shadow-primary/20"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 px-8 py-10 w-full max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

          <div className="space-y-8">
            {/* Title */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <textarea
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Enter a captivating title..."
                className="w-full text-4xl font-heading font-bold tracking-tight text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/30 resize-none min-h-[80px]"
                rows={2}
              />
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Slug</span>
                <span className="text-[11px] text-muted-foreground/50 font-mono">/blog/</span>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="text-[11px] font-mono text-primary bg-transparent border-none outline-none flex-1 font-bold"
                  placeholder="post-slug-here"
                />
              </div>
            </div>

            {/* Content */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Article Content</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[11px] font-bold">Preview</Button>
                </div>
              </div>
              <RichTextEditor content={form.content} onChange={content => setForm(f => ({ ...f, content }))} placeholder="Start writing your story..." />
            </div>

            {/* Excerpt */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Summary / Excerpt</h3>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                rows={4}
                placeholder="Briefly describe what this article is about for SEO and cards..."
                className="w-full border border-border rounded-2xl p-4 text-sm bg-muted/30 text-foreground focus:border-primary outline-none transition-all resize-none"
              />
            </div>
          </div>

          <aside className="space-y-6">
            {/* Cover Image */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Cover Media</h3>
              {form.image_url ? (
                <div className="relative rounded-2xl overflow-hidden border border-border group aspect-[16/10]">
                  <img src={form.image_url} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="rounded-xl h-9 w-9" onClick={() => document.getElementById("cover-upload")?.click()}>
                      <Upload size={16} />
                    </Button>
                    <Button size="icon" variant="destructive" className="rounded-xl h-9 w-9" onClick={() => setForm(f => ({ ...f, image_url: null }))}>
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer aspect-[16/10] flex flex-col items-center justify-center",
                    dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  )}
                  onClick={() => document.getElementById("cover-upload")?.click()}
                >
                  <input id="cover-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : (
                      <ImageIcon size={20} className="text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-foreground">Upload Image</p>
                  <p className="text-[10px] text-muted-foreground mt-1">1600x900 recommended</p>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Publishing Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5 ml-1">Category</label>
                  <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputClass} placeholder="e.g. Technology" />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5 ml-1">Read Time</label>
                  <input value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: e.target.value }))} placeholder="8 min" className={inputClass} />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5 ml-1">Author</label>
                  <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className={inputClass} />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5 ml-1">Schedule</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full h-11 justify-start font-normal rounded-xl border-border bg-card", !form.publish_at && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.publish_at ? format(form.publish_at, "PPP") : "Set date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl" align="end">
                      <Calendar
                        mode="single"
                        selected={form.publish_at || undefined}
                        onSelect={(d) => setForm(f => ({ ...f, publish_at: d || null }))}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowSeo(!showSeo)}
                className="w-full flex items-center justify-between p-6 hover:bg-muted/30 transition-colors"
              >
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">SEO Optimization</h3>
                <ChevronDown size={16} className={cn("text-muted-foreground transition-transform", showSeo && "rotate-180")} />
              </button>
              {showSeo && (
                <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5 ml-1">Meta Title</label>
                    <input value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} className={inputClass} placeholder="Focus keyword here" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5 ml-1">Meta Description</label>
                    <textarea value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} rows={3} className={cn(inputClass, "h-auto py-3 resize-none")} placeholder="Summarize the value..." />
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
