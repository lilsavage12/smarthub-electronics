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
