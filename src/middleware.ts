import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'
import { trackAICrawlerRequest } from '@datafast/ai-crawl'

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  // DataFast bot traffic tracking. Non-blocking — schedules the request via
  // event.waitUntil and returns immediately; do not await it.
  trackAICrawlerRequest(request, event, {
    websiteId:
      process.env.NEXT_PUBLIC_DATAFAST_WEBSITE_ID ||
      'dfid_Lym9BMuVNUZ0SQVuGjQun',
  })

  let supabaseResponse = NextResponse.next({ request })

  // Only protect the admin area. Avoid doing auth network calls for public pages.
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return supabaseResponse
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^"+|"+$/g, '').trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ?.replace(/^"+|"+$/g, '')
    .trim()

  // If Supabase isn't configured (or env parsing fails), don't block the entire app.
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect all /admin/* except /admin/login
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login') &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from login page
  if (request.nextUrl.pathname === '/admin/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
