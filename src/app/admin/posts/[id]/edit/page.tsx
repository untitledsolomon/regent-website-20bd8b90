"use client"

export const dynamic = "force-dynamic"

import PostEditor from '@/legacy-pages/admin/PostEditor'

export default function EditPostPage() {
  try {
    return <PostEditor />
  } catch (e) {
    console.error('EditPostPage error:', e)
    return <div>Error: {String(e)}</div>
  }
}