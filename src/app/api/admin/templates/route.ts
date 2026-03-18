
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function GET(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data, error } = await supabaseAdmin
            .from('DocumentTemplate')
            .select('*')
            .order('templateType')

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Fetch Templates Error:", error)
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { templateType, ...settings } = body

        if (!templateType) {
            return NextResponse.json({ error: "Template type is required" }, { status: 400 })
        }

        const { data, error } = await supabaseAdmin
            .from('DocumentTemplate')
            .upsert({
                templateType,
                ...settings,
                updatedAt: new Date().toISOString()
            }, {
                onConflict: 'templateType'
            })
            .select()

        if (error) throw error

        return NextResponse.json(data[0])
    } catch (error: any) {
        console.error("Save Template Error:", error)
        return NextResponse.json({ error: error.message || "Failed to save template" }, { status: 500 })
    }
}
