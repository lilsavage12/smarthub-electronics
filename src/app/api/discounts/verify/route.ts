import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const { code } = await req.json()

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 })
        }

        const { data: discount, error } = await supabase
            .from('Discount')
            .select('*')
            .eq('code', code)
            .maybeSingle()

        if (error) throw error
        
        if (!discount) {
            return NextResponse.json({ error: "Invalid discount code" }, { status: 404 })
        }

        if (discount.status !== "Active") {
            return NextResponse.json({ error: "This discount code is paused or inactive" }, { status: 400 })
        }

        if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
            return NextResponse.json({ error: "This discount code has reached its usage limit" }, { status: 400 })
        }

        return NextResponse.json({
            message: "Promo code applied successfully",
            discount: {
                id: discount.id,
                code: discount.code,
                name: discount.campaign, // Map campaign to name for clarity in front-end
                type: discount.type,
                value: discount.value
            }
        })

    } catch (error) {
        console.error("Supabase Discount Verification Error:", error)
        return NextResponse.json({ error: "Failed to verify discount" }, { status: 500 })
    }
}
