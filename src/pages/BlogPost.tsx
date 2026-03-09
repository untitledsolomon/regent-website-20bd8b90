import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { motion, useScroll } from "framer-motion";
import { Icons } from "@/components/Icons";
import { BlogCard } from "@/components/CardComponents";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { PageMeta } from "@/components/PageMeta";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useTrackView } from "@/hooks/useContentTracking";

async function fetchPostBySlug(slug: string) {
  const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("published", true).single();
  if (error) throw error;
  return data;
}

async function fetchRelatedPosts(slug: string) {
  const { data } = await supabase.from("blog_posts").select("*").eq("published", true).neq("slug", slug).limit(3);
  return data || [];
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog_post", slug],
    queryFn: () => fetchPostBySlug(slug!),
    enabled: !!slug,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["blog_related", slug],
    queryFn: () => fetchRelatedPosts(slug!),
    enabled: !!slug,
  });

  useTrackView("blog_post", post?.id);

  useEffect(() => {
    return scrollYProgress.on("change", setProgress);
  }, [scrollYProgress]);

  const headings = useMemo(() => {
    if (!post?.content) return [];
    const matches = [...post.content.matchAll(/<h2>(.*?)<\/h2>/g)];
    return matches.map((m, i) => ({ id: `heading-${i}`, text: m[1] }));
  }, [post?.content]);

  const contentWithIds = useMemo(() => {
    if (!post?.content) return "";
    let idx = 0;
    return post.content.replace(/<h2>/g, () => `<h2 id="heading-${idx++}">`);
  }, [post?.content]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !post) {
    return (
      <div>
        <section className="pt-[120px] pb-20 border-b border-border bg-surface">
          <div className="section-container max-w-[800px]">
            <div className="h-8 w-48 bg-card border border-border rounded animate-pulse mb-6" />
            <div className="h-12 w-full bg-card border border-border rounded animate-pulse mb-4" />
            <div className="h-6 w-3/4 bg-card border border-border rounded animate-pulse" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`${post.title} — Regent`}
        description={post.excerpt}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.excerpt,
          "author": { "@type": "Organization", "name": post.author },
          "datePublished": post.date,
          "publisher": { "@type": "Organization", "name": "Regent Systems" },
        }}
      />
      <motion.div
        className="fixed top-16 left-0 right-0 h-[3px] bg-primary z-[99] origin-left"
        style={{ scaleX: progress }}
      />

      <section className="pt-[120px] pb-20 border-b border-border bg-surface">
        <div className="section-container max-w-[800px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-mono text-xs text-text-muted mb-6 flex items-center gap-2 flex-wrap">
              <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors">Home</Link>
              <span className="text-border-strong">→</span>
              <Link to="/blog" className="text-text-secondary hover:text-text-primary transition-colors">Insights</Link>
              <span className="text-border-strong">→</span>
              {post.category}
            </div>
            <span className="font-mono text-[11px] tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-accent-light text-primary border border-primary/20 inline-block mb-6">
              {post.category}
            </span>
            <h1 className="font-heading text-[clamp(28px,4vw,48px)] font-semibold tracking-[-0.03em] leading-[1.1] mb-6">
              {post.title}
            </h1>
            <p className="text-lg text-text-secondary leading-[1.7] mb-8">{post.excerpt}</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-[13px] font-semibold text-primary">
                  {post.author.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{post.author}</div>
                  <div className="text-[13px] text-text-muted">{post.date} · {post.read_time}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopyLink} className="text-[12px] font-medium text-text-secondary border border-border rounded-lg px-3 py-1.5 hover:bg-surface hover:text-text-primary transition-all">
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-text-secondary border border-border rounded-lg px-3 py-1.5 hover:bg-surface hover:text-text-primary transition-all">
                  Twitter
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-text-secondary border border-border rounded-lg px-3 py-1.5 hover:bg-surface hover:text-text-primary transition-all">
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-16 max-w-[960px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="prose-regent text-[17px] leading-[1.85] text-text-secondary [&_h2]:font-heading [&_h2]:text-[26px] [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-text-primary [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:leading-[1.2] [&_p]:mb-6 [&_h2]:scroll-mt-24"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {headings.length > 0 && (
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-4">ON THIS PAGE</div>
                  <nav className="flex flex-col gap-2.5">
                    {headings.map(h => (
                      <a key={h.id} href={`#${h.id}`} className="text-[13px] text-text-secondary hover:text-primary transition-colors leading-snug">
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-[720px] mx-auto mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Link to="/blog" className="font-heading text-[13px] font-medium bg-transparent text-text-primary border border-border-strong rounded-lg px-[18px] py-[9px] inline-flex items-center gap-1.5 hover:bg-surface transition-all">
              ← Back to Insights
            </Link>
            <Link to="/demo" className="font-heading text-[13px] font-medium bg-text-primary text-background rounded-lg px-[18px] py-[9px] inline-flex items-center gap-1.5 hover:shadow-lg hover:-translate-y-px transition-all">
              Start a Project <Icons.ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-[100px] bg-surface border-t border-border">
          <div className="section-container">
            <RevealOnScroll>
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">RELATED ARTICLES</div>
              <h2 className="font-heading text-[clamp(24px,3vw,36px)] font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-10">
                Continue Reading
              </h2>
            </RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p, i) => (
                <BlogCard key={p.slug} post={{ ...p, readTime: p.read_time }} delay={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
