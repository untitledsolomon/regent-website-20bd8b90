import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BlogPostClient } from '@/components/blog/BlogPostClient'

export const revalidate = 60

export async function generateStaticParams() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('blog_posts').select('slug')
  return (data ?? []).map(post => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('meta_title, meta_description, og_image, title, excerpt, author, date')
    .eq('slug', slug)
    .single()

  if (!post) return { title: 'Post Not Found' }

  const ogImage = post.og_image || '/og-default.jpg'

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || '',
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      type: 'article',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      images: [{ url: ogImage }],
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
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
  const supabase = createServiceClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
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
      name: post.author || 'Regent Analytics',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Regent Analytics',
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
      <BlogPostClient post={post} />
    </>
  )
}