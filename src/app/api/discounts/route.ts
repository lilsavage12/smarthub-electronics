import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function POST(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const body = await req.json()
        const { code, type, value, maxUses } = body

        const { data: existing, error: checkError } = await supabase
            .from('Discount')
            .select('code')
            .eq('code', code)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ error: "Code already exists" }, { status: 400 })
        }

        const { data: discount, error } = await supabase
            .from('Discount')
            .insert([{
                code,
                type,
                value: parseFloat(value),
                maxUses: maxUses ? parseInt(maxUses) : null,
                campaign: body.campaign || "General Promotion",
                status: body.status || "Active",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }])
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(discount)
    } catch (error: any) {
        console.error("Supabase Discount creation failed:", error)
        return NextResponse.json({ error: "Failed to create discount" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const { data: discounts, error } = await supabase
            .from('Discount')
            .select('*')
            .order('createdAt', { ascending: false })

        if (error) throw error
        return NextResponse.json(discounts)
    } catch (error) {
        console.error("Supabase Discount Load error:", error)
        return NextResponse.json({ error: "Failed to load discounts" }, { status: 500 })
    }
}
