import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function GET(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const { data: logs, error } = await supabase
            .from('AuditLog')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100)

        if (error) throw error
        return NextResponse.json(logs)
    } catch (error) {
        console.error("Supabase Audit Log Fetch Error:", error)
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { data: log, error } = await supabase
            .from('AuditLog')
            .insert([{
                ...body,
                timestamp: new Date().toISOString()
            }])
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(log)
    } catch (error) {
        console.error("Supabase Audit Log Create Error:", error)
        return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 })
    }
}
