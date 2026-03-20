'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface BlogPost {
  slug: string
  title: string
  content: string
  excerpt: string
  author: string | null
  date: string
  read_time: string | number | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
}

export function BlogPostClient({ post }: { post: BlogPost }) {
  const toc = useMemo(() => {
    if (typeof window === 'undefined' || !post.content) return []
    const parser = new DOMParser()
    const doc = parser.parseFromString(post.content, 'text/html')
    const headings = doc.querySelectorAll('h2, h3')
    return Array.from(headings).map(h => ({
      id: h.id || h.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
      text: h.textContent || '',
      level: h.tagName === 'H2' ? 2 : 3,
    }))
  }, [post.content])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <article className="max-w-4xl mx-auto px-4 py-16">
        <header className="mb-10">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {post.read_time && (
              <>
                <span>·</span>
                <span>{post.read_time} min read</span>
              </>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          {post.author && (
            <div className="flex items-center gap-3 mt-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {post.author}
              </span>
            </div>
          )}
        </header>

        {toc.length > 0 && (
          <nav className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-3">
              Table of Contents
            </h2>
            <ul className="space-y-2">
                {toc.map(item => {
                    const indent = item.level === 3 ? 'ml-4' : ''
                    return (
                    <li key={item.id} className={indent}>
                        <a
                        href={`#${item.id}`}
                        className="text-blue-600 hover:underline text-sm"
                        >
                        {item.text}
                        </a>
                    </li>
                    )
                })}
            </ul>
          </nav>
        )}

        <div
          className="prose prose-lg prose-gray dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </motion.div>
  )
}