import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Download, User, Mail, Phone, FileText, Briefcase, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface Application {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  career_id: string | null;
  career?: { title: string; department: string; location: string } | null;
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("job_applications")
      .select("*, career:careers(title, department, location)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setApplications((data as any[]) || []);
        setLoading(false);
      });
  }, []);

  const handleDownload = async (path: string) => {
    const { data, error } = await supabase.storage
        .from("job-applications")
        .createSignedUrl(path, 60);
    if (error || !data) return;
    window.open(data.signedUrl, "_blank", "noopener");
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">Job Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">{applications.length} total submission{applications.length !== 1 ? "s" : ""}</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20 border border-border rounded-2xl bg-card">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase size={24} />
          </div>
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">No applications yet</h3>
          <p className="text-sm text-muted-foreground">Applications will appear here when candidates apply.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <div key={app.id} className="border border-border rounded-xl bg-card overflow-hidden hover:border-primary/30 transition-colors">
              {/* Summary row */}
              <button
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">{app.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{app.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {app.career ? (
                    <span className="hidden sm:inline text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {app.career.title}
                    </span>
                  ) : (
                    <span className="hidden sm:inline text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      General
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                  </span>
                  {expanded === app.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded detail */}
              {expanded === app.id && (
                <div className="border-t border-border p-5 space-y-4 bg-muted/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-muted-foreground shrink-0" />
                      <a href={`mailto:${app.email}`} className="text-primary hover:underline">{app.email}</a>
                    </div>
                    {app.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-foreground">{app.phone}</span>
                      </div>
                    )}
                    {app.career && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-foreground">{app.career.title} · {app.career.department} · {app.career.location}</span>
                      </div>
                    )}
                    {app.resume_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText size={14} className="text-muted-foreground shrink-0" />
                        <button
                            onClick={() => handleDownload(app.resume_url!)}
                            className="text-primary hover:underline flex items-center gap-1"
                        >
                            Download Resume <ExternalLink size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  {app.cover_letter && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Cover Letter</div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-card border border-border rounded-lg p-4">
                        {app.cover_letter}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}