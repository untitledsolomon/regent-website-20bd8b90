import { createServiceClient, hasSupabaseEnv } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { seoTitle } from '@/lib/seo'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BlogPostClient } from '@/components/blog/BlogPostClient'

export const revalidate = 60

export async function generateStaticParams() {
  if (!hasSupabaseEnv()) return []
  const supabase = createServiceClient()
  // Same visibility condition the index and sitemap use: published = true.
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)
  return (data ?? []).map(post => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!hasSupabaseEnv()) return { title: 'Post Not Found' }
  const supabase = createServiceClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('meta_title, meta_description, og_image, title, excerpt, author, date')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) return { title: 'Post Not Found' }

  const pageTitle = post.meta_title || post.title
  const description = post.meta_description || post.excerpt || ''
  const ogImage = post.og_image || '/og-image.png'

  return {
    title: seoTitle(pageTitle),
    description,
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      type: 'article',
      title: pageTitle,
      description,
      images: [{ url: ogImage }],
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [ogImage],
    },
    alternates: { canonical: `/blog/${slug}` },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!hasSupabaseEnv()) notFound()
  const supabase = createServiceClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt || '',
    image: post.og_image || '',
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author || 'Regent',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Regent Technologies',
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ name: 'Blog', href: '/blog' }, { name: post.title, href: `/blog/${post.slug}` }]} />
      <BlogPostClient post={post} />
    </>
  )
}