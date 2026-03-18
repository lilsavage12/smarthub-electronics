import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const { code } = await req.json()
        if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 })

        const { data: discount, error } = await supabase
            .from('Discount')
            .select('*')
            .eq('code', code.toUpperCase())
            .maybeSingle()

        if (error) throw error
        if (!discount) {
            return NextResponse.json({ error: "Invalid promo protocol" }, { status: 404 })
        }

        if (discount.status !== "Active") {
            return NextResponse.json({ error: "Discount protocol inactive" }, { status: 400 })
        }

        if (discount.maxUses && discount.usedCount >= discount.maxUses) {
            return NextResponse.json({ error: "Usage threshold exceeded" }, { status: 400 })
        }

        let percent = 0
        if (discount.type === "Percentage") {
            // Support both "15%" string and number
            percent = typeof discount.value === 'string' 
                ? parseInt(discount.value.replace("%", "")) 
                : discount.value
        } else if (discount.type === "Free Shipping") {
            percent = 0
        }

        return NextResponse.json({
            code: discount.code,
            type: discount.type,
            value: discount.value,
            percent: percent
        })
    } catch (error) {
        console.error("Supabase Promo Validation Error:", error)
        return NextResponse.json({ error: "Validation error" }, { status: 500 })
    }
}
