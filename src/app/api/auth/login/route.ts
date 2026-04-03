import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 })
        }

        // 1. Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (authError) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // 2. Fetch profile data from User table
        // We use email as the bridge because auth.users.id (UUID) 
        // doesn't match User.id (CUID) for many existing accounts.
        const { data: profile, error: profileError } = await supabase
            .from('User')
            .select('*')
            .eq('email', authData.user.email)
            .maybeSingle()

        if (!profile) {
            const SESSION_MODIFIER = 90 * 24 * 60 * 60 // 90 days
            
            const userData = {
                id: authData.user.id,
                email: authData.user.email,
                role: 'USER',
                displayName: authData.user.user_metadata?.display_name || null
            }
            const response = NextResponse.json({
                success: true,
                user: userData
            })
            // Set cookie for proxy
            response.cookies.set('sb-access-token', authData.session.access_token, {
                path: '/',
                maxAge: SESSION_MODIFIER,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                httpOnly: true
            })
            return response
        }

        const SESSION_MODIFIER = 90 * 24 * 60 * 60 // 90 days
        
        const response = NextResponse.json({
            success: true,
            user: {
                id: authData.user.id, // CRITICAL: Use Supabase UUID for database compatibility
                email: profile.email,
                role: profile.role,
                displayName: profile.displayName,
                profileId: profile.id // Optional: keep for legacy references
            }
        })

        // Set cookie for proxy
        response.cookies.set('sb-access-token', authData.session.access_token, {
            path: '/',
            maxAge: SESSION_MODIFIER,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: true
        })

        return response
    } catch (error: any) {
        console.error("Supabase Login error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
