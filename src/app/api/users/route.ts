import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function GET(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const { data: users, error } = await supabase
            .from('profiles')
            .select(`
                *,
                sessions:DeviceSession(updatedAt)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(users)
    } catch (error) {
        console.error("Supabase Users Fetch Error:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}
