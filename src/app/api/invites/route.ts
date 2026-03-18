import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
    try {
        const { data: invites, error } = await supabase
            .from('Invite')
            .select('*')
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
        const { data: invite, error } = await supabase
            .from('Invite')
            .insert([{
                ...body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }])
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(invite)
    } catch (error) {
        console.error("Supabase Invite Create Error:", error)
        return NextResponse.json({ error: "Create failed" }, { status: 500 })
    }
}
