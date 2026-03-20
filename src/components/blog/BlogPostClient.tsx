"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, useScroll } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, ArrowLeft, Copy, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlogPostFull {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  author: string;
  date: string;
  read_time: string | null;
  og_image: string | null;
  image_url: string | null;
  category: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published: boolean;
}

interface RelatedPost {
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

// ─── Related Card ─────────────────────────────────────────────────────────────

function RelatedCard({ post, index }: { post: RelatedPost; index: number }) {
  const cover = post.og_image ?? post.image_url;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <motion.article
          whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
          transition={{ duration: 0.2 }}
          className="h-full border border-border rounded-xl overflow-hidden bg-card flex flex-col"
        >
          <div className="h-[160px] relative overflow-hidden bg-gradient-to-br from-accent-light to-primary/[0.08] shrink-0">
            {cover ? (
              <img src={cover} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-20 text-primary">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
                  <path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
                </svg>
              </div>
            )}
          </div>
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-2">
              {post.category && (
                <span className="font-mono text-[10px] tracking-[0.06em] px-2 py-0.5 rounded-full bg-accent-light text-primary border border-primary/20">
                  {post.category}
                </span>
              )}
              {post.read_time && (
                <span className="font-mono text-[10px] text-muted-foreground">{post.read_time}</span>
              )}
            </div>
            <h3 className="font-heading text-[15px] font-semibold tracking-[-0.02em] leading-[1.3] text-foreground group-hover:text-primary transition-colors mb-2 flex-1">
              {post.title}
            </h3>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <ArrowRight size={13} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BlogPostClient({ post }: { post: BlogPostFull }) {
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [pageUrl, setPageUrl] = useState("");

  const supabase = createClient();

  // Set page URL client-side (avoids SSR mismatch)
  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  // Track reading progress
  useEffect(() => {
    return scrollYProgress.on("change", setProgress);
  }, [scrollYProgress]);

  // Fetch related posts
  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("slug, title, excerpt, author, date, read_time, og_image, image_url, category")
      .eq("published", true)
      .neq("slug", post.slug)
      .limit(3)
      .then(({ data }) => setRelated(data ?? []));
  }, [post.slug]); // eslint-disable-line

  // Build TOC from h2 tags
  const headings = useMemo(() => {
    if (!post.content) return [];
    const matches = [...post.content.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)];
    return matches.map((m, i) => ({
      id: `heading-${i}`,
      text: m[1].replace(/<[^>]+>/g, ""), // strip nested tags
    }));
  }, [post.content]);

  const contentWithIds = useMemo(() => {
    if (!post.content) return "";
    let idx = 0;
    return post.content.replace(/<h2>/g, () => `<h2 id="heading-${idx++}">`);
  }, [post.content]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cover = post.og_image ?? post.image_url;
  const initials = post.author.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <>
      {/* ── Reading progress bar ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-[99] origin-left"
        style={{ scaleX: progress }}
      />

      {/* ── Hero / header ── */}
      <section className="pt-[120px] pb-16 border-b border-border bg-surface">
        <div className="section-container max-w-[800px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Breadcrumb */}
            <div className="font-mono text-xs text-muted-foreground mb-6 flex items-center gap-2 flex-wrap">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span className="text-border">→</span>
              <Link href="/blog" className="hover:text-foreground transition-colors">Insights</Link>
              <span className="text-border">→</span>
              <span>{post.category}</span>
            </div>

            {/* Category badge */}
            {post.category && (
              <span className="font-mono text-[11px] tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-accent-light text-primary border border-primary/20 inline-block mb-6">
                {post.category}
              </span>
            )}

            <h1 className="font-heading text-[clamp(28px,4vw,48px)] font-semibold tracking-[-0.03em] leading-[1.1] mb-6 text-foreground">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-[1.7] mb-8">{post.excerpt}</p>
            )}

            {/* Author + share row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-[13px] font-semibold text-primary shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{post.author}</div>
                  <div className="text-[13px] text-muted-foreground">
                    {post.date} {post.read_time && `· ${post.read_time}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="text-[12px] font-medium text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted hover:text-foreground transition-all inline-flex items-center gap-1.5"
                >
                  {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Link</>}
                </button>
                {pageUrl && (
                  <>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] font-medium text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted hover:text-foreground transition-all"
                    >
                      Twitter
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] font-medium text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted hover:text-foreground transition-all"
                    >
                      LinkedIn
                    </a>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Cover image ── */}
      {cover && (
        <div className="section-container max-w-[800px] pt-10">
          <div className="rounded-2xl overflow-hidden border border-border aspect-[16/7]">
            <img src={cover} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* ── Body + TOC ── */}
      <section className="py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-16 max-w-[960px] mx-auto">

            {/* Article body */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={[
                "text-[17px] leading-[1.85] text-muted-foreground",
                // headings
                "[&_h2]:font-heading [&_h2]:text-[26px] [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-foreground [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:leading-[1.2] [&_h2]:scroll-mt-24",
                "[&_h3]:font-heading [&_h3]:text-[20px] [&_h3]:font-semibold [&_h3]:tracking-[-0.02em] [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-3",
                // paragraphs & lists
                "[&_p]:mb-6",
                "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul_li]:mb-2",
                "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol_li]:mb-2",
                // blockquote
                "[&_blockquote]:border-l-[3px] [&_blockquote]:border-primary/50 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6",
                // code
                "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.85em] [&_code]:font-mono [&_code]:text-foreground",
                "[&_pre]:bg-muted [&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-6 [&_pre]:border [&_pre]:border-border",
                "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-sm",
                // images & hr
                "[&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-8 [&_img]:border [&_img]:border-border",
                "[&_hr]:border-border [&_hr]:my-10",
                // links
                "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary/80",
                // strong & em
                "[&_strong]:text-foreground [&_strong]:font-semibold",
              ].join(" ")}
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {/* TOC sidebar */}
            {headings.length > 0 && (
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground mb-4">ON THIS PAGE</div>
                  <nav className="flex flex-col gap-2.5">
                    {headings.map(h => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        className="text-[13px] text-muted-foreground hover:text-primary transition-colors leading-snug"
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            )}
          </div>

          {/* Bottom CTA row */}
          <div className="max-w-[720px] mx-auto mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Link
              href="/blog"
              className="font-heading text-[13px] font-medium text-foreground border border-border rounded-lg px-[18px] py-[9px] inline-flex items-center gap-1.5 hover:bg-muted transition-all"
            >
              <ArrowLeft size={14} /> Back to Insights
            </Link>
            <Link
              href="/contact"
              className="font-heading text-[13px] font-medium bg-foreground text-background rounded-lg px-[18px] py-[9px] inline-flex items-center gap-1.5 hover:shadow-lg hover:-translate-y-px transition-all"
            >
              Start a Project <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Related posts ── */}
      {related.length > 0 && (
        <section className="py-[100px] bg-surface border-t border-border">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">RELATED ARTICLES</div>
              <h2 className="font-heading text-[clamp(24px,3vw,36px)] font-semibold tracking-[-0.03em] leading-[1.1] text-foreground mb-10">
                Continue Reading
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p, i) => (
                <RelatedCard key={p.slug} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}