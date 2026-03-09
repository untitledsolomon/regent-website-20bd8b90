import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { BlogCard } from "@/components/CardComponents";
import { GradientText } from "@/components/GradientText";
import { Icons } from "@/components/Icons";
import { PageMeta } from "@/components/PageMeta";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

async function fetchBlogPosts() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export default function BlogPage() {
  const [active, setActive] = useState("All");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog_posts"],
    queryFn: fetchBlogPosts,
  });

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category)))];

  const handleSubscribe = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: trimmed, source: "blog" });
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already subscribed", description: "This email is already on our list." });
        } else throw error;
      } else {
      toast({ title: "Subscribed!", description: "You'll receive our latest insights." });
        setEmail("");
        supabase.functions.invoke("newsletter-welcome", { body: { email: trimmed } }).catch(() => {});
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    }
  };

  const filtered = active === "All" ? posts : posts.filter(p => p.category === active);
  const featured = posts[0];

  if (isLoading) {
    return (
      <div>
        <PageMeta title="Blog — Regent | Insights & Technical Articles" description="Ideas on systems, infrastructure, intelligence, and enterprise technology from the Regent team." />
        <section className="pt-[140px] pb-[100px] bg-surface border-b border-border">
          <div className="section-container">
            <div className="h-12 w-64 bg-card border border-border rounded-lg animate-pulse mb-4" />
            <div className="h-6 w-96 bg-card border border-border rounded-lg animate-pulse" />
          </div>
        </section>
        <section className="py-20">
          <div className="section-container grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-[320px] bg-card border border-border rounded-xl animate-pulse" />)}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="Blog — Regent | Insights & Technical Articles" description="Ideas on systems, infrastructure, intelligence, and enterprise technology from the Regent team." />
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[640px]"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">INSIGHTS</div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              <GradientText shimmer>Insights</GradientText>
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px]">
              Ideas on systems, infrastructure, intelligence, and enterprise technology.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-container">
          {featured && (
            <RevealOnScroll>
              <div className="mb-16">
                <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-5">FEATURED</div>
                <Link to={`/blog/${featured.slug}`}>
                  <motion.div
                    whileHover={{ boxShadow: "0 12px 40px rgba(0,0,0,0.08)", y: -4 }}
                    className="border border-border rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 cursor-pointer transition-all"
                  >
                    <div className="bg-gradient-to-br from-accent-light to-primary/[0.08] p-10 md:p-16 flex items-center justify-center min-h-[240px] md:min-h-[300px] relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent-mid/10"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="opacity-20 text-primary relative z-10">
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                          <rect x="10" y="10" width="80" height="80" rx="8" stroke="currentColor" strokeWidth="3"/>
                          <path d="M25 35h50M25 50h50M25 65h30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                    <div className="p-8 md:p-12">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="font-mono text-[11px] tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-accent-light text-primary border border-primary/20">
                          {featured.category}
                        </span>
                        <span className="font-mono text-[11px] text-text-muted">
                          {featured.read_time}
                        </span>
                      </div>
                      <h2 className="font-heading text-[22px] md:text-[26px] font-semibold tracking-[-0.03em] leading-[1.2] mb-4">{featured.title}</h2>
                      <p className="text-[15px] text-text-secondary leading-[1.7] mb-8">{featured.excerpt}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-xs font-semibold text-primary">
                          {featured.author.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-[13px] font-medium">{featured.author}</div>
                          <div className="text-xs text-text-muted">{featured.date}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </RevealOnScroll>
          )}

          <RevealOnScroll>
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`font-mono text-[11px] tracking-[0.06em] px-4 py-2 rounded-full border transition-all ${
                    active === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-text-secondary border-border hover:border-border-strong hover:text-text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {filtered.map((post, i) => (
                <motion.div
                  key={post.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <BlogCard post={{ ...post, readTime: post.read_time }} delay={0} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-text-muted">
              No articles in this category yet.
            </div>
          )}
        </div>
      </section>

      <section className="py-[100px] bg-surface border-t border-border">
        <div className="section-container">
          <RevealOnScroll>
            <div className="max-w-[560px] mx-auto text-center">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">NEWSLETTER</div>
              <h2 className="font-heading text-[clamp(24px,3vw,36px)] font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-4">
                Stay Informed
              </h2>
              <p className="text-[15px] text-text-secondary leading-[1.7] mb-8">
                Get our latest insights on systems infrastructure and enterprise technology delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-[440px] mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 h-12 border border-border rounded-lg px-4 font-body text-sm text-text-primary bg-card outline-none focus:border-primary focus:ring-[3px] focus:ring-accent-light transition-all"
                />
                <button onClick={handleSubscribe} className="h-12 px-6 font-heading text-[13px] font-medium bg-primary text-primary-foreground rounded-lg inline-flex items-center justify-center gap-2 hover:bg-primary/90 transition-all whitespace-nowrap">
                  Subscribe <Icons.ArrowRight />
                </button>
              </div>
              <p className="text-xs text-text-muted mt-3">No spam. Unsubscribe anytime.</p>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
