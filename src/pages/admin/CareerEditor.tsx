import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

export default function CareerEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    published: true,
  });

  useEffect(() => {
    if (isEdit) {
      supabase.from("careers").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setForm({
          title: data.title,
          department: data.department,
          location: data.location,
          type: data.type,
          published: data.published,
        });
      });
    }
  }, [id, isEdit]);

  const set = (key: string, value: string | boolean) => setForm(f => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const payload = { ...form, updated_at: new Date().toISOString() };

    const { error } = isEdit
      ? await supabase.from("careers").update(payload).eq("id", id)
      : await supabase.from("careers").insert(payload);

    setLoading(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isEdit ? "Position updated" : "Position created" });
      navigate("/admin/careers");
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin/careers" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface transition-colors">
          <ArrowLeft size={16} className="text-text-secondary" />
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-text-primary">
          {isEdit ? "Edit Position" : "New Position"}
        </h1>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-text-primary mb-1.5 block">Title</label>
          <input
            value={form.title}
            onChange={e => set("title", e.target.value)}
            placeholder="e.g. Senior Systems Engineer"
            className="w-full h-10 border border-border rounded-lg px-3 text-sm bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-primary mb-1.5 block">Department</label>
            <input
              value={form.department}
              onChange={e => set("department", e.target.value)}
              placeholder="e.g. Engineering"
              className="w-full h-10 border border-border rounded-lg px-3 text-sm bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary mb-1.5 block">Location</label>
            <input
              value={form.location}
              onChange={e => set("location", e.target.value)}
              placeholder="e.g. San Francisco / Remote"
              className="w-full h-10 border border-border rounded-lg px-3 text-sm bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-primary mb-1.5 block">Type</label>
            <select
              value={form.type}
              onChange={e => set("type", e.target.value)}
              className="w-full h-10 border border-border rounded-lg px-3 text-sm bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={e => set("published", e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-text-primary font-medium">Published</span>
            </label>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            onClick={save}
            disabled={loading}
            className="h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Saving..." : isEdit ? "Update Position" : "Create Position"}
          </button>
          <Link to="/admin/careers" className="h-10 px-5 border border-border rounded-lg text-sm font-medium flex items-center text-text-secondary hover:bg-surface transition-all">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
