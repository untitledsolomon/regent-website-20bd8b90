import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  console.log('--- BLOG POSTS ---')
  const { data: posts } = await supabase.from('blog_posts').select('slug, title, image_url, og_image')
  posts?.forEach(p => console.log(`[${p.slug}] ${p.title} - Image: ${p.image_url}, OG: ${p.og_image}`))

  console.log('\n--- CASE STUDIES ---')
  const { data: cs } = await supabase.from('case_studies').select('slug, title, image_url')
  cs?.forEach(c => console.log(`[${c.slug}] ${c.title} - Image: ${c.image_url}`))

  console.log('\n--- RESOURCES ---')
  const { data: res } = await supabase.from('resources').select('slug, title, description')
  res?.forEach(r => console.log(`[${r.slug}] ${r.title} - Desc start: ${r.description?.substring(0, 100)}`))
}

check()
