import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;
    try {
        const { data: invite, error } = await supabase
            .from('Invite')
            .select('*')
            .eq('token', token)
            .maybeSingle()

        if (error) throw error

        if (!invite || invite.status !== "PENDING") {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 })
        }

        return NextResponse.json(invite)
    } catch (error) {
        console.error("Supabase Invite Verification Error:", error)
        return NextResponse.json({ error: "Verification failed" }, { status: 500 })
    }
}
