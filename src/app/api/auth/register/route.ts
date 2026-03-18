import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const { email, password, displayName } = await req.json()

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
                role: "USER"
            }
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        const user = authData.user

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: "USER",
                displayName: displayName
            }
        })
    } catch (error: any) {
        console.error("Supabase Register error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
