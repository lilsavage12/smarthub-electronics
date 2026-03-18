import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Check if deviceId cookie exists
    let deviceId = request.cookies.get('deviceId')?.value

    if (!deviceId) {
        // Generate a new UUID for the device
        deviceId = crypto.randomUUID()

        // Set the cookie with a 30-day expiration, HttpOnly, and Secure
        response.cookies.set({
            name: 'deviceId',
            value: deviceId,
            maxAge: 30 * 24 * 60 * 60, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        })
    }

    // Simplified security check for protected routes
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
    const isHubControl = request.nextUrl.pathname.startsWith('/hub-control')
    
    // Check for any Supabase auth related cookies (including chunked ones)
    const allCookies = request.cookies.getAll()
    const hasAuthToken = allCookies.some(c => 
        c.name.includes('auth-token') || 
        c.name.includes('access-token') || 
        c.name.startsWith('sb-')
    )

    if ((isDashboard || isHubControl) && !hasAuthToken && !request.nextUrl.pathname.includes('/login') && !request.nextUrl.pathname.startsWith('/hub-control/invite')) {
        const url = request.nextUrl.clone()
        url.pathname = isHubControl ? '/hub-control/login' : '/login'
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
}
