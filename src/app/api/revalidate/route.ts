import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { table, record } = body

  if (table === 'blog_posts') {
    const slug = record?.slug
    if (slug) revalidatePath(`/blog/${slug}`)
    revalidatePath('/blog')
    return NextResponse.json({ revalidated: true, slug })
  }

  if (table === 'case_studies') {
    const slug = record?.slug
    if (slug) revalidatePath(`/case-studies/${slug}`)
    revalidatePath('/case-studies')
    return NextResponse.json({ revalidated: true, slug })
  }

  return NextResponse.json({ message: 'No action taken' })
}