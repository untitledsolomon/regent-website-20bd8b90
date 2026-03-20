"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string | null;
  author: string;
  date: string;
  read_time: string | null;
  og_image: string | null;
  image_url: string | null;
  category: string | null;
}

// ─── Blog Card ────────────────────────────────────────────────────────────────

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <motion.article
          whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
          transition={{ duration: 0.2 }}
          className="h-full border border-border rounded-xl overflow-hidden bg-card flex flex-col"
        >
          {/* Image / placeholder */}
          <div className="h-[180px] relative overflow-hidden bg-gradient-to-br from-accent-light to-primary/[0.08] shrink-0">
            {post.og_image || post.image_url ? (
              <img
                src={post.og_image ?? post.image_url!}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-20 text-primary">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
                  <path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-3 mb-3">
              {post.category && (
                <span className="font-mono text-[11px] tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-accent-light text-primary border border-primary/20">
                  {post.category}
                </span>
              )}
              {post.read_time && (
                <span className="font-mono text-[11px] text-muted-foreground">{post.read_time}</span>
              )}
            </div>

            <h3 className="font-heading text-[16px] font-semibold tracking-[-0.02em] leading-[1.3] mb-2 text-foreground group-hover:text-primary transition-colors">
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="text-[13px] text-muted-foreground leading-[1.7] mb-4 flex-1 line-clamp-3">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-light flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                  {post.author.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-[12px] font-medium text-foreground">{post.author}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </div>
              <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

// ─── Featured Post ────────────────────────────────────────────────────────────

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <div className="mb-16">
      <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-5">FEATURED</div>
      <Link href={`/blog/${post.slug}`}>
        <motion.div
          whileHover={{ boxShadow: "0 12px 40px rgba(0,0,0,0.08)", y: -4 }}
          transition={{ duration: 0.2 }}
          className="border border-border rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 cursor-pointer bg-card"
        >
          {/* Image */}
          <div className="min-h-[240px] md:min-h-[300px] relative overflow-hidden bg-gradient-to-br from-accent-light to-primary/[0.08]">
            {post.og_image || post.image_url ? (
              <img src={post.og_image ?? post.image_url!} alt={post.title} className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                <div className="opacity-20 text-primary absolute inset-0 flex items-center justify-center">
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <rect x="10" y="10" width="80" height="80" rx="8" stroke="currentColor" strokeWidth="3"/>
                    <path d="M25 35h50M25 50h50M25 65h30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-5">
              {post.category && (
                <span className="font-mono text-[11px] tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-accent-light text-primary border border-primary/20">
                  {post.category}
                </span>
              )}
              {post.read_time && (
                <span className="font-mono text-[11px] text-muted-foreground">{post.read_time}</span>
              )}
            </div>
            <h2 className="font-heading text-[22px] md:text-[26px] font-semibold tracking-[-0.03em] leading-[1.2] mb-4 text-foreground">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-[15px] text-muted-foreground leading-[1.7] mb-8">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-xs font-semibold text-primary">
                {post.author.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div className="text-[13px] font-medium text-foreground">{post.author}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState("All");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const supabase = createClient();

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category).filter(Boolean) as string[]))];
  const featured = posts[0] ?? null;
  const filtered = active === "All" ? posts : posts.filter(p => p.category === active);

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
        supabase.functions.invoke("sync-resend-contact", { body: { email: trimmed } }).catch(() => {});
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[640px]"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">INSIGHTS</div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-foreground mb-6">
              Insights
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-muted-foreground leading-[1.65] max-w-[560px]">
              Ideas on systems, infrastructure, intelligence, and enterprise technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Posts ── */}
      <section className="py-20">
        <div className="section-container">
          {featured && <FeaturedPost post={featured} />}

          {/* Category filters */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`font-mono text-[11px] tracking-[0.06em] px-4 py-2 rounded-full border transition-all ${
                  active === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {filtered.map((post, i) => (
                <BlogCard key={post.slug} post={post} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty states */}
          {posts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent-light flex items-center justify-center text-primary">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
                  <path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">No articles published yet</h3>
              <p className="text-sm text-muted-foreground">Check back soon — new insights are on the way.</p>
            </div>
          )}
          {posts.length > 0 && filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No articles in this category yet.
            </div>
          )}
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-[100px] bg-surface border-t border-border">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[560px] mx-auto text-center"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">NEWSLETTER</div>
            <h2 className="font-heading text-[clamp(24px,3vw,36px)] font-semibold tracking-[-0.03em] leading-[1.1] text-foreground mb-4">
              Stay Informed
            </h2>
            <p className="text-[15px] text-muted-foreground leading-[1.7] mb-8">
              Get our latest insights on systems infrastructure and enterprise technology delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-[440px] mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubscribe()}
                placeholder="you@company.com"
                className="flex-1 h-12 border border-border rounded-lg px-4 text-sm text-foreground bg-card outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
              />
              <button
                onClick={handleSubscribe}
                className="h-12 px-6 font-heading text-[13px] font-medium bg-primary text-primary-foreground rounded-lg inline-flex items-center justify-center gap-2 hover:bg-primary/90 transition-all whitespace-nowrap"
              >
                Subscribe <ArrowRight size={14} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>
    </>
  );
}