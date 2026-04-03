import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { randomUUID } from "crypto"

export async function GET() {
    try {
        const { data: invites, error } = await supabaseAdmin
            .from('Invite')
            .select('*')
            .eq('status', 'PENDING')
            .order('createdAt', { ascending: false })

        if (error) throw error
        return NextResponse.json(invites)
    } catch (error) {
        console.error("Supabase Invites Fetch Error:", error)
        return NextResponse.json({ error: "Fetch failed" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { data: invite, error } = await supabaseAdmin
            .from('Invite')
            .insert([{
                id: randomUUID(),
                email: body.email,
                token: body.token,
                role: body.role || "ADMIN",
                status: body.status || "PENDING",
                createdAt: new Date().toISOString()
            }])
            .select()
            .single()

        if (error) {
            console.error("SUPABASE ERROR:", error)
            return NextResponse.json({ 
                error: error.message || "Create failed",
                code: error.code,
                hint: error.hint
            }, { status: 500 })
        }
        return NextResponse.json(invite)
    } catch (err: any) {
        console.error("INVITE ROUTE PANIC:", err)
        return NextResponse.json({ error: err.message || "Route error" }, { status: 500 })
    }
}
