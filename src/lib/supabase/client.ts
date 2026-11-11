'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/integrations/supabase/types'

/**
 * Minimal stand-in used when env vars are absent. Next.js statically
 * pre-renders client components (layouts, providers) at build time, and a
 * throwing factory would fail the whole page. In production the branch below
 * never runs — with env vars present we construct the real browser client.
 * The stub satisfies the shapes existing consumers destructure:
 *   - auth.getSession() / getUser():  Promise<{ data: { session|user|null } }>
 *   - auth.onAuthStateChange(cb):     { data: { subscription } }
 *   - .from('table').select()...eq(): awaitable { data: null, error: null }
 */
function unconfiguredClient(): ReturnType<typeof createBrowserClient<Database>> {
  const noResult = () => ({ data: null, error: { message: 'Supabase is not configured' } } as const)

  const builder = () => {
    const thenable = () => noResult()
    const chain = new Proxy(thenable, {
      get(_t, prop) {
        if (prop === 'then') {
          return (resolve: (v: unknown) => void) => resolve(noResult())
        }
        return () => chain
      },
    })
    return chain
  }

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
      signInWithPassword: async () => noResult() as any,
      signOut: async () => ({ error: null }),
    },
    from: () => builder(),
    rpc: () => builder(),
    channel: () => ({ on: () => {}, subscribe: () => ({ unsubscribe: () => {} }) }),
    removeChannel: () => {},
  } as unknown as ReturnType<typeof createBrowserClient<Database>>
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^"+|"+$/g, '').trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ?.replace(/^"+|"+$/g, '')
    .trim()

  if (!url || !anonKey) {
    return unconfiguredClient()
  }

  return createBrowserClient<Database>(
    url,
    anonKey
  )
}