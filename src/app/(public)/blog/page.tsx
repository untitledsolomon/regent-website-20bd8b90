import { createServiceClient, hasSupabaseEnv } from '@/lib/supabase/service'
import type { Metadata } from 'next'
import { BlogClient, type BlogPost } from '@/components/blog/BlogClient'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Essays on systems, infrastructure, and how organizations operate.',
  openGraph: {
    title: 'Blog',
    description: 'Essays on systems, infrastructure, and how organizations operate.',
    type: 'website',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog',
    description: 'Essays on systems, infrastructure, and how organizations operate.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/blog',
  },
}

export const revalidate = 60

export default async function BlogIndexPage() {
  if (!hasSupabaseEnv()) return <BlogClient posts={[]} />
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, author, date, read_time, og_image, image_url, category')
    .eq('published', true)
    .order('date', { ascending: false })

  return (
    <>
      <Breadcrumbs items={[{ name: 'Blog', href: '/blog' }]} />
      <BlogClient posts={(data ?? []) as BlogPost[]} />
    </>
  )
}