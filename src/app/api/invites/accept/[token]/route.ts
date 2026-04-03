import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;
    try {
        const { error } = await supabaseAdmin
            .from('Invite')
            .update({ 
                status: 'ACCEPTED' 
            })
            .eq('token', token)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Supabase Invite Accept Error:", error)
        return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 })
    }
}
