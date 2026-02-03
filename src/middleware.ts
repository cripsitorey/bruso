
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. If not authenticated and trying to access protected routes, redirect to login
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
    // Check if it's the root path, we might want to allow it as a landing page, BUT for this requirement "show different panels depending on who logs in", 
    // we should enforce login for the app functionalities. 
    // However, we recently made a landing page at /. Let's keep / accessible but redirect /admin, /resident, /guard if not logged in.
    
    // Actually, for a strict multi-tenant app, usually everything is protected. 
    // Let's protect specific paths:
    const protectedPaths = ['/admin', '/resident', '/guard', '/reservations']
    if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
         return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 2. If authenticated, check role and redirect if accessing root or login
  if (user) {
    if (request.nextUrl.pathname === '/login') {
         // Redirect to their dashboard
         return await redirectToDashboard(supabase, user.id, request)
    }
  }

  return response
}

async function redirectToDashboard(supabase: any, userId: string, request: NextRequest) {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
    
    console.log('[Middleware] User:', userId)
    console.log('[Middleware] Profile:', profile)
    console.log('[Middleware] Error:', error)

    // Default redirect
    let target = '/resident'

    if (profile) {
        switch (profile.role) {
            case 'admin':
                target = '/admin'
                break
            case 'guard':
                target = '/guard/scan'
                break
            case 'resident':
                target = '/resident'
                break
            default:
                console.log('[Middleware] Unhandled role:', profile.role)
                target = '/resident'
                break
        }
    } else {
        console.log('[Middleware] No profile found, defaulting to resident')
    }
    
    console.log('[Middleware] Redirecting to:', target)
    return NextResponse.redirect(new URL(target, request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
