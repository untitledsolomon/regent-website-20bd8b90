'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/integrations/supabase/types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^"+|"+$/g, '').trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ?.replace(/^"+|"+$/g, '')
    .trim()

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  return createBrowserClient<Database>(
    url,
    anonKey
  )
}