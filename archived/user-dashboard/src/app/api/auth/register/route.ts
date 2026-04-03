/**
 * @deprecated THIS FILE IS ARCHIVED AND NOT IN USE AS PER USER REQUEST.
 * User authentication and related APIs have been detached.
 */
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const { email, password, displayName, role = "USER" } = await req.json()

        if (!email || !password || !displayName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // 1. Register with Supabase Auth
        // Using admin client to avoid confirmation email for now (simplifies migration/dev)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                display_name: displayName,
                role: role
            }
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        const user = authData.user

        // 2. Sync to public.User table (used for role management and profile fetching)
        const { error: syncError } = await supabaseAdmin
            .from('User')
            .upsert({
                id: user.id, // Match the Auth UUID
                email: user.email!,
                role: role,
                displayName: displayName,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })

        if (syncError) {
            console.error("User Sync Error:", syncError)
            // We don't necessarily fail the whole request since auth exists, 
            // but we log it for audit purposes.
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: role,
                displayName: displayName
            }
        })
    } catch (error: any) {
        console.error("Supabase Register error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

