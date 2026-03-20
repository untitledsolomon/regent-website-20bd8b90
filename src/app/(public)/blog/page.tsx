import { createServiceClient } from '@/lib/supabase/service'
import type { Metadata } from 'next'
import { BlogClient, type BlogPost } from '@/components/blog/BlogClient'

export const metadata: Metadata = {
  title: 'Blog — Regent | Insights & Technical Articles',
  description: 'Ideas on systems, infrastructure, intelligence, and enterprise technology from the Regent team.',
}

export const revalidate = 60

export default async function BlogIndexPage() {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, author, date, read_time, og_image, image_url, category')
    .eq('published', true)
    .order('date', { ascending: false })

  return <BlogClient posts={(data ?? []) as BlogPost[]} />
}