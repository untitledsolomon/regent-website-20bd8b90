import { createServiceClient } from '@/lib/supabase/service'
import type { Metadata } from 'next'
import { BlogClient, type BlogPost } from '@/components/blog/BlogClient'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Practical writing on running a growing business: spreadsheets, cash flow, inventory, accounting, and business systems, from the team behind Axis by Regent.',
  openGraph: {
    title: 'Blog',
    description: 'Practical writing on running a growing business: spreadsheets, cash flow, inventory, accounting, and business systems, from the team behind Axis by Regent.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog',
    description: 'Practical writing on running a growing business: spreadsheets, cash flow, inventory, accounting, and business systems, from the team behind Axis by Regent.',
  },
  alternates: {
    canonical: '/blog',
  },
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