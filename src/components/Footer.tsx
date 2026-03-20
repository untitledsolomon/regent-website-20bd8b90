"use client";

import Link from "next/link";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

const cols = [
  { title: "Solutions", links: [{ label: "Overview", to: "/platform" }, { label: "Architecture", to: "/platform" }, { label: "Modules", to: "/platform" }, { label: "Security", to: "/platform" }] },
  { title: "Capabilities", links: [{ label: "Systems Integration", to: "/capabilities" }, { label: "Data Infrastructure", to: "/capabilities" }, { label: "Workflow Automation", to: "/capabilities" }, { label: "Intelligence Systems", to: "/capabilities" }] },
  { title: "Industries", links: [{ label: "Finance", to: "/industries" }, { label: "Government", to: "/industries" }, { label: "Infrastructure", to: "/industries" }, { label: "Enterprise", to: "/industries" }] },
  { title: "Resources", links: [{ label: "Whitepapers", to: "/resources" }, { label: "Case Studies", to: "/case-studies" }, { label: "Documentation", to: "/resources" }, { label: "Blog", to: "/blog" }] },
  { title: "Company", links: [{ label: "About", to: "/about" }, { label: "Careers", to: "/careers" }, { label: "News", to: "/about" }, { label: "Contact", to: "/demo" }] },
];

function BackToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (y) => setShow(y > 400));
  }, [scrollY]);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          aria-label="Back to top"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 12V4M4 7l4-4 4 4" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function Footer() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: trimmed, source: "footer" });
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already subscribed", description: "This email is already on our list." });
        } else throw error;
      } else {
      toast({ title: "Subscribed!", description: "You'll receive our latest insights." });
        setEmail("");
        // Send welcome email (fire and forget)
        supabase.functions.invoke("newsletter-welcome", { body: { email: trimmed } }).catch(() => {});
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <>
      <BackToTop />
      <footer className="bg-text-primary text-background pt-[72px] pb-10">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-[240px_1fr_1fr_1fr_1fr_1fr] gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="font-heading text-xl font-semibold tracking-[-0.03em] mb-3">
                Regent<span className="text-accent-mid">.</span>
              </div>
              <p className="text-sm text-background/45 max-w-[260px] leading-relaxed mb-6">
                Systems engineering and infrastructure for the next generation of organizations.
              </p>
              {/* Newsletter */}
              <div className="relative">
                <motion.div
                  className="absolute -inset-px rounded-lg bg-gradient-to-r from-primary/50 to-accent-mid/50 pointer-events-none"
                  animate={{ opacity: focused ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Your email"
                  className="relative w-full bg-background/10 border border-background/15 rounded-lg px-3 py-2 text-sm text-background placeholder:text-background/30 outline-none transition-colors focus:bg-background/15"
                />
              </div>
              <button onClick={handleSubscribe} className="mt-2 font-heading text-[11px] font-medium tracking-[0.04em] uppercase text-primary hover:text-accent-mid transition-colors">
                Subscribe →
              </button>
            </div>
            {cols.map((col) => (
              <div key={col.title}>
                <div className="font-heading text-xs font-semibold tracking-[0.08em] uppercase text-background/50 mb-5">
                  {col.title}
                </div>
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.to}
                    className="group block text-sm text-background/65 mb-3 hover:text-background transition-colors relative w-fit"
                  >
                    {l.label}
                    <span className="absolute bottom-0 left-0 w-full h-px bg-background/40 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-background/10 pt-8 mt-16 flex flex-col md:flex-row justify-between items-center text-[13px] text-background/35 gap-4">
            <span>© {new Date().getFullYear()} Regent Systems, Inc. All rights reserved.</span>
            <span className="flex gap-6">
              <Link href="/privacy" className="group hover:text-background/60 relative">
                Privacy Policy
                <span className="absolute bottom-0 left-0 w-full h-px bg-background/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
              <Link href="/terms" className="group hover:text-background/60 relative">
                Terms of Service
                <span className="absolute bottom-0 left-0 w-full h-px bg-background/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
              <span className="group cursor-pointer hover:text-background/60 relative">
                Security
                <span className="absolute bottom-0 left-0 w-full h-px bg-background/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </span>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}