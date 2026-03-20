"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/Icons";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageMeta } from "@/components/PageMeta";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { num: "01", label: "Tell Us", desc: "Share your contact details" },
  { num: "02", label: "Details", desc: "Industry & company info" },
  { num: "03", label: "Scope", desc: "Describe your project" },
];

const faqs = [
  { q: "How long is the consultation?", a: "Initial consultations are typically 45 minutes. We'll discuss your current systems landscape, challenges, and what you're looking to build." },
  { q: "Do I need to prepare anything?", a: "No preparation required. That said, having a sense of your current systems, pain points, and goals will help us make the conversation more productive." },
  { q: "Is there a cost for the consultation?", a: "No. The initial consultation is free with no obligations. We want to understand your needs and determine if Regent is the right partner for your project." },
  { q: "Can my team join?", a: "Absolutely. We encourage bringing technical stakeholders, engineering leads, and decision-makers to get the most out of the conversation." },
  { q: "What happens after the consultation?", a: "We'll provide a detailed proposal including architecture recommendations, project scope, timeline, and pricing tailored to your specific requirements." },
];

const trustLogos = ["Fortune 500 Bank", "Global Consultancy", "Defense Contractor", "Industrial Conglomerate", "Energy Major", "Tier-1 Investment Bank"];

export default function DemoPage() {
  const supabase = createClient();
  const [formData, setFormData] = useState({ name: "", company: "", email: "", industry: "", size: "", budget: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const validateStep = (step: number) => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!formData.name.trim()) errs.name = "Name is required";
      if (!formData.email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Invalid email address";
      if (!formData.company.trim()) errs.company = "Company is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(0)) { setCurrentStep(0); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("consultation_requests").insert({
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        industry: formData.industry || null,
        size: formData.size || null,
        budget: formData.budget || null,
        message: formData.message.trim() || null,
      });
      if (error) throw error;

      supabase.functions.invoke('notify-consultation', {
        body: {
          name: formData.name.trim(),
          company: formData.company.trim(),
          email: formData.email.trim(),
          industry: formData.industry || null,
          size: formData.size || null,
          budget: formData.budget || null,
          message: formData.message.trim() || null,
        },
      }).catch(console.error);

      setSubmitted(true);
      toast({ title: "Request submitted", description: "We'll be in touch within one business day." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or email us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full h-11 border rounded-lg px-3.5 font-body text-sm text-text-primary bg-card outline-none transition-all ${
      errors[field] ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : "border-border focus:border-primary focus:ring-[3px] focus:ring-accent-light"
    }`;

  const selectClass = "w-full h-11 border border-border rounded-lg px-3.5 font-body text-sm text-text-primary bg-card outline-none focus:border-primary focus:ring-[3px] focus:ring-accent-light transition-all appearance-none";

  const consultationIncludes = [
    { title: "Systems landscape assessment", desc: "We'll map out your current systems, integrations, and data flows to understand the full picture." },
    { title: "Challenge and goals discussion", desc: "Identify the specific problems you need solved and the outcomes you're looking for." },
    { title: "Architecture recommendations", desc: "Our engineers will outline how we'd approach designing and building the right solution." },
    { title: "Scope and timeline overview", desc: "Get a preliminary sense of project scope, phases, and expected timeline." },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-text-primary">Name *</label>
                <input className={inputClass("name")} placeholder="Full name" value={formData.name}
                  onChange={e => { setFormData({ ...formData, name: e.target.value }); setErrors(prev => ({ ...prev, name: "" })); }} />
                {errors.name && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.name}</motion.p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-text-primary">Company *</label>
                <input className={inputClass("company")} placeholder="Organization" value={formData.company}
                  onChange={e => { setFormData({ ...formData, company: e.target.value }); setErrors(prev => ({ ...prev, company: "" })); }} />
                {errors.company && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.company}</motion.p>}
              </div>
            </div>
            <div className="space-y-1.5 mt-5">
              <label className="text-[13px] font-medium text-text-primary">Work Email *</label>
              <input className={inputClass("email")} type="email" placeholder="you@company.com" value={formData.email}
                onChange={e => { setFormData({ ...formData, email: e.target.value }); setErrors(prev => ({ ...prev, email: "" })); }} />
              {errors.email && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.email}</motion.p>}
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-text-primary">Industry</label>
                <select className={selectClass} value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })}>
                  <option value="">Select industry</option>
                  <option>Finance</option><option>Government</option><option>Infrastructure</option><option>Enterprise</option><option>Energy</option><option>Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-text-primary">Company Size</label>
                <select className={selectClass} value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })}>
                  <option value="">Select size</option>
                  <option>500–1,000</option><option>1,000–5,000</option><option>5,000–20,000</option><option>20,000+</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5 mt-5">
              <label className="text-[13px] font-medium text-text-primary">Budget Range</label>
              <select className={selectClass} value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })}>
                <option value="">Select budget range</option>
                <option>$1K – $5K</option><option>$5K – $15K</option><option>$15K – $30K</option><option>$30K – $50K</option><option>$50K – $100K</option><option>$100K+</option>
              </select>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-text-primary">Message</label>
              <textarea
                className="w-full min-h-[160px] border border-border rounded-lg p-3.5 font-body text-sm text-text-primary bg-card outline-none resize-y focus:border-primary focus:ring-[3px] focus:ring-accent-light transition-all"
                placeholder="Tell us about your systems challenges and what you're looking to build..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div>
      <PageMeta
        title="Start Your Project — Regent"
        description="Tell us about your systems challenges and let's discuss how Regent can design and build the right solution for your organization."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a },
          })),
        }}
      />
      <section className="pt-[100px] pb-20 bg-surface border-b border-border">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="max-w-[640px]">
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">START A PROJECT</div>
            <h1 className="text-[clamp(36px,5vw,60px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">Let's Build Together</h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px]">
              Tell us about your systems challenges and let's discuss how Regent can design and build the right solution for your organization.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="mt-10">
            <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-4">TRUSTED BY 400+ ORGANIZATIONS</p>
            <div className="flex flex-wrap gap-4">
              {trustLogos.map(name => (
                <div key={name} className="px-4 py-2 border border-border rounded-lg bg-card/50 text-[13px] font-heading font-medium text-text-muted">{name}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Step Indicator */}
      <section className="py-10 border-b border-border">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-center gap-3 flex-1">
                <motion.div
                  animate={{
                    backgroundColor: i <= currentStep ? "hsl(var(--primary))" : "hsl(var(--surface))",
                    color: i <= currentStep ? "hsl(var(--primary-foreground))" : "hsl(var(--text-muted))",
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold border border-border shrink-0"
                >
                  {i < currentStep ? <Icons.Check /> : step.num}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-text-primary">{step.label}</div>
                  <div className="text-[11px] text-text-muted hidden sm:block">{step.desc}</div>
                </div>
                {i < steps.length - 1 && <div className="hidden sm:block w-12 h-px bg-border mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-12 md:gap-20 items-start">
            <RevealOnScroll>
              <div className="md:sticky md:top-24">
                <h3 className="font-heading text-xl font-semibold tracking-[-0.02em] mb-7">What the Consultation Includes</h3>
                <div className="flex flex-col gap-5">
                  {consultationIncludes.map((item, i) => (
                    <div key={i} className="flex gap-3.5 items-start">
                      <div className="w-7 h-7 bg-accent-light border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 text-primary mt-0.5"><Icons.Check /></div>
                      <div>
                        <div className="text-[15px] font-medium text-text-primary mb-1">{item.title}</div>
                        <div className="text-[13px] text-text-secondary leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-12 p-6 bg-surface border border-border rounded-xl">
                  <div className="font-mono text-[11px] tracking-[0.08em] text-text-muted mb-2">TYPICAL CONSULTATION</div>
                  <div className="font-heading text-2xl font-semibold tracking-[-0.03em]">45 minutes</div>
                  <div className="text-[13px] text-text-secondary mt-1.5">Tailored to your organization's specific challenges</div>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-10 border border-border rounded-2xl relative overflow-hidden">
                    <motion.div initial={{ scale: 0, opacity: 0.6 }} animate={{ scale: 4, opacity: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-primary/20" />
                    <div className="relative z-10">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="w-14 h-14 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </motion.div>
                      <h3 className="font-heading text-[22px] font-semibold tracking-[-0.02em] mb-3">Request Received</h3>
                      <p className="text-[15px] text-text-secondary mb-7">Thank you, {formData.name}. A member of our team will contact you within one business day to schedule your consultation.</p>
                      <Link href="/" className="font-heading text-[13px] font-medium bg-transparent text-text-primary border border-border-strong rounded-lg px-[18px] py-[9px] inline-flex items-center gap-1.5 hover:bg-surface transition-all">Return to Home</Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border border-border rounded-2xl p-8 md:p-10">
                    <h3 className="font-heading text-xl font-semibold tracking-[-0.02em] mb-7">Schedule Your Consultation</h3>
                    
                    <AnimatePresence mode="wait">
                      {renderStepContent()}
                    </AnimatePresence>

                    {/* Navigation buttons */}
                    <div className="flex items-center gap-3 mt-8">
                      {currentStep > 0 && (
                        <button
                          onClick={handleBack}
                          className="font-heading text-[14px] font-medium border border-border rounded-lg px-6 py-3 text-text-secondary hover:bg-surface transition-all"
                        >
                          Back
                        </button>
                      )}
                      <div className="flex-1" />
                      {currentStep < 2 ? (
                        <motion.button
                          onClick={handleNext}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="font-heading text-[15px] font-medium bg-primary text-primary-foreground rounded-lg px-8 py-3 flex items-center gap-2 hover:bg-primary/90 transition-all"
                        >
                          Next <Icons.ArrowRight />
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={handleSubmit}
                          disabled={submitting}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="font-heading text-[15px] font-medium bg-primary text-primary-foreground rounded-lg px-8 py-3 flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-[0_8px_24px_rgba(79,70,229,0.25)] transition-all disabled:opacity-60"
                        >
                          {submitting ? "Submitting…" : "Schedule Consultation"} {!submitting && <Icons.ArrowRight />}
                        </motion.button>
                      )}
                    </div>
                    {currentStep === 2 && (
                      <p className="text-xs text-text-muted mt-3 text-center">
                        By submitting, you agree to Regent's Privacy Policy. We will never share your data.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[100px] bg-surface border-t border-border">
        <div className="section-container max-w-[720px]">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">FAQ</div>
              <h2 className="font-heading text-[clamp(24px,3vw,36px)] font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary">Frequently Asked Questions</h2>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-6 bg-card">
                  <AccordionTrigger className="text-[15px] font-heading font-medium text-text-primary hover:no-underline py-5">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-[14px] text-text-secondary leading-[1.7] pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
