import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GradientText } from "@/components/GradientText";
import { Icons } from "@/components/Icons";
import { PageMeta } from "@/components/PageMeta";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const applicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  cover_letter: z.string().trim().max(5000).optional().or(z.literal("")),
});

export default function CareerApply() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isGeneral = id === "general";

  const { data: career, isLoading } = useQuery({
    queryKey: ["career-detail", id],
    queryFn: async () => {
      if (isGeneral) return null;
      const { data, error } = await supabase
        .from("careers")
        .select("id, title, department, location, type")
        .eq("id", id!)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !isGeneral,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const values = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      cover_letter: formData.get("cover_letter") as string,
    };

    const result = applicationSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      let resume_url: string | null = null;

      if (resumeFile) {
        const ext = resumeFile.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("job-applications")
          .upload(path, resumeFile);
        if (uploadError) throw uploadError;
        resume_url = path;
      }

      const { error } = await supabase.from("job_applications").insert({
        career_id: isGeneral ? null : id,
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || null,
        cover_letter: result.data.cover_letter || null,
        resume_url,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF or DOC/DOCX file.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    setResumeFile(file);
  };

  if (submitted) {
    return (
      <div>
        <PageMeta title="Application Submitted — Regent" description="Thank you for your application." />
        <section className="pt-[140px] pb-[100px]">
          <div className="section-container max-w-[600px] mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent-light flex items-center justify-center text-primary">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h1 className="font-heading text-[clamp(24px,4vw,40px)] font-semibold tracking-[-0.03em] text-text-primary mb-4">
                Application Received
              </h1>
              <p className="text-text-secondary text-lg mb-8">
                Thank you for your interest in joining Regent. We'll review your application and get back to you soon.
              </p>
              <Link
                to="/careers"
                className="font-heading text-[15px] font-medium bg-primary text-primary-foreground rounded-lg px-7 py-3.5 inline-flex items-center gap-2 hover:bg-primary/90 transition-all"
              >
                <Icons.ArrowLeft /> Back to Careers
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={career ? `Apply: ${career.title} — Regent` : "Apply — Regent Careers"}
        description="Submit your application to join the Regent team."
      />
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <Link to="/careers" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6">
              <Icons.ArrowLeft /> Back to Careers
            </Link>
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">
              {isGeneral ? "GENERAL APPLICATION" : "APPLY NOW"}
            </div>
            <h1 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-4">
              {isGeneral ? (
                <>Send Us Your <GradientText shimmer>Resume</GradientText></>
              ) : isLoading ? (
                <span className="inline-block w-64 h-10 bg-card rounded animate-pulse" />
              ) : career ? (
                <>{career.title}</>
              ) : (
                "Position Not Found"
              )}
            </h1>
            {career && (
              <div className="flex flex-wrap items-center gap-3 text-[14px] text-text-secondary">
                <span>{career.department}</span>
                <span className="w-1 h-1 rounded-full bg-border-strong" />
                <span>{career.location}</span>
                <span className="w-1 h-1 rounded-full bg-border-strong" />
                <span>{career.type}</span>
              </div>
            )}
            {isGeneral && (
              <p className="text-text-secondary text-[clamp(15px,2vw,18px)] leading-[1.65] mt-2 max-w-[560px]">
                Don't see a role that fits? Send us your details and we'll keep you in mind for future opportunities.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-[80px]">
        <div className="section-container max-w-[640px]">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="name" className="text-text-primary">Full Name *</Label>
              <Input id="name" name="name" required className="mt-1.5" placeholder="Your full name" />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-text-primary">Email Address *</Label>
              <Input id="email" name="email" type="email" required className="mt-1.5" placeholder="you@example.com" />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-text-primary">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" className="mt-1.5" placeholder="+1 (555) 000-0000" />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="cover_letter" className="text-text-primary">Cover Letter</Label>
              <Textarea id="cover_letter" name="cover_letter" className="mt-1.5 min-h-[140px]" placeholder="Tell us about yourself and why you'd be a great fit..." />
              {errors.cover_letter && <p className="text-sm text-destructive mt-1">{errors.cover_letter}</p>}
            </div>

            <div>
              <Label htmlFor="resume" className="text-text-primary">Resume / CV</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="mt-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-accent-light file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary hover:file:bg-accent-light/80"
              />
              <p className="text-xs text-text-muted mt-1">PDF, DOC, or DOCX — max 10MB</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full font-heading text-[15px] font-medium bg-primary text-primary-foreground rounded-lg px-7 py-3.5 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Application"}
              {!submitting && <Icons.ArrowRight />}
            </button>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
