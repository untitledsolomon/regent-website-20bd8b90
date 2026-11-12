import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { Icons } from '@/components/Icons';
import { GradientText } from '@/components/GradientText';
import ResourceReader from './ResourceReader';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('resources').select('title, description').eq('slug', slug).single();
  if (!data) return { title: 'Resource not found', robots: { index: false, follow: false } };
  const description = data.description || undefined;
  return {
    title: data.title,
    description,
    alternates: { canonical: `/resources/${slug}` },
    openGraph: { title: `${data.title} | Regent`, description, type: 'article', url: `/resources/${slug}` },
    twitter: { card: 'summary_large_image', title: `${data.title} | Regent`, description },
  };
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: resource, error } = await supabase
    .from('resources')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !resource) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumbs
        items={[
          { name: 'Resources', href: '/resources' },
          { name: resource.title, href: `/resources/${slug}` },
        ]}
      />
      {/* Header */}
      <section className="pt-[140px] pb-[60px] bg-surface border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="section-container relative z-10">
          <RevealOnScroll>
            <div className="max-w-[800px]">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">
                {resource.type}
              </div>
              <h1 className="text-[clamp(32px,4vw,52px)] font-heading font-semibold tracking-[-0.04em] leading-[1.1] text-text-primary mb-6">
                {resource.title}
              </h1>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Reader Component (Client Side for Gating) */}
      <ResourceReader resource={resource} />
    </div>
  );
}
