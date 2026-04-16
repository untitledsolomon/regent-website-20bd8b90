'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/Icons';
import { createClient } from '@/lib/supabase/client';
import { trackConversion } from '@/hooks/useContentTracking';

interface ResourceReaderProps {
  resource: {
    id: string;
    slug: string;
    title: string;
    description: string;
    file_url: string | null;
  };
}

export default function ResourceReader({ resource }: ResourceReaderProps) {
  const [isGated, setIsGated] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const savedEmail = localStorage.getItem('regent_lead_email');
    if (savedEmail) {
      setIsGated(false);
    }
  }, []);

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setSubscribing(true);
    try {
      await supabase.from('newsletter_subscribers').insert({
        email,
        source: `resource_gate_${resource.slug}`
      });
      localStorage.setItem('regent_lead_email', email);
      trackConversion('resource_access');
      setIsGated(false);
    } catch (err) {
      console.error(err);
      // Fallback to letting them read if DB fails but email is provided
      setIsGated(false);
    } finally {
      setSubscribing(false);
    }
  };

  // Split content to show "preview"
  // Assuming description might be HTML. We'll show first 2 paragraphs or first few hundred chars.
  const previewContent = resource.description.split('</p>').slice(0, 2).join('</p>') + '</p>';
  const remainingContent = resource.description.split('</p>').slice(2).join('</p>');

  return (
    <section className="py-16">
      <div className="section-container max-w-[800px]">
        <div className="prose-res text-text-secondary leading-[1.8]">
          <div dangerouslySetInnerHTML={{ __html: previewContent }} />

          <AnimatePresence>
            {!isGated ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div dangerouslySetInnerHTML={{ __html: remainingContent }} />

                {resource.file_url && (
                  <div className="mt-12 p-8 bg-accent-light border border-primary/20 rounded-2xl text-center">
                    <h3 className="text-xl font-heading font-semibold mb-4">Download Technical PDF</h3>
                    <p className="mb-6 text-sm text-text-secondary">Get the full offline version including all technical diagrams and implementation notes.</p>
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-heading text-[15px] font-medium bg-primary text-primary-foreground rounded-lg px-8 py-3.5 inline-flex items-center gap-2 hover:shadow-lg transition-all"
                    >
                      Download PDF <Icons.ArrowRight />
                    </a>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="relative mt-8">
                {/* Fade out effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10 h-40 -top-40" />

                <div className="relative z-20 bg-card border border-border rounded-2xl p-8 md:p-12 text-center shadow-2xl shadow-primary/5">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                    <Icons.BookOpen size={32} />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold mb-4 text-text-primary">
                    Unlock the Full Resource
                  </h2>
                  <p className="text-text-secondary mb-8 max-w-[480px] mx-auto">
                    Enter your professional email to continue reading and gain access to our full library of technical guides and research.
                  </p>

                  <form onSubmit={handleGateSubmit} className="max-w-[400px] mx-auto space-y-4">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full h-12 border border-border rounded-lg px-4 text-sm bg-surface text-foreground outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={subscribing}
                      className="w-full h-12 font-heading text-[14px] font-medium bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                      {subscribing ? "Verifying..." : "Continue Reading"} <Icons.ArrowRight size={16} />
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                      No spam. Technical insights only. Unsubscribe anytime.
                    </p>
                  </form>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
