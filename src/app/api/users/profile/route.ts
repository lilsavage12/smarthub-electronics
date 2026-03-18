import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { userId, displayName, email } = body

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update({
                display_name: displayName || undefined,
                email: email || undefined,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({
            id: updatedProfile.id,
            email: updatedProfile.email,
            displayName: updatedProfile.display_name,
            role: updatedProfile.role
        })
    } catch (error) {
        console.error("Supabase Profile Update Error:", error)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }
}
