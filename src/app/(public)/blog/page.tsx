import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights, guides, and updates from Regent Analytics.',
}

export const revalidate = 60

export default async function BlogIndexPage() {
  const supabase = createServiceClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, author, date, read_time, og_image')
    .order('date', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">
        Blog
      </h1>
      <div className="space-y-12">
        {posts?.map(post => (
          <article
            key={post.slug}
            className="border-b border-gray-200 dark:border-gray-700 pb-12"
          >
            <time className="text-sm text-gray-500">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <h2 className="text-2xl font-bold mt-2 mb-3">
              <Link
                href={`/blog/${post.slug}`}
                className="text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            {post.excerpt && (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {post.excerpt}
              </p>
            )}
            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-600 hover:underline text-sm mt-4 inline-block font-medium"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}