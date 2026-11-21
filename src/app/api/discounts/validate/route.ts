import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    try {
        const { code, items = [], subtotal = 0 } = await req.json()
        if (!code) return NextResponse.json({ error: "No discount code entered" }, { status: 400 })

        const cleanCode = String(code).trim().toUpperCase()

        const { data: discount, error } = await supabaseAdmin
            .from('Discount')
            .select('*')
            .eq('code', cleanCode)
            .maybeSingle()

        if (error) {
            console.error("[DISCOUNTS_VALIDATE] Error fetching discount:", error)
            throw error
        }

        if (!discount) {
            return NextResponse.json({ error: "Invalid promo code" }, { status: 404 })
        }

        if (discount.status !== "Active") {
            return NextResponse.json({ error: "This promo code is currently inactive" }, { status: 400 })
        }

        if (discount.maxUses && discount.usedCount >= discount.maxUses) {
            return NextResponse.json({ error: "This code has reached its maximum redemptions" }, { status: 400 })
        }

        // Check Minimum Purchase
        if (discount.minPurchase && Number(subtotal) < Number(discount.minPurchase)) {
            return NextResponse.json({ 
                error: `Minimum order value of Ksh ${Number(discount.minPurchase).toLocaleString()} required` 
            }, { status: 400 })
        }

        let percent = 0
        let discountValue = 0

        if (discount.type === "Percentage") {
            percent = typeof discount.value === 'string'
                ? parseFloat(discount.value.replace("%", "").trim())
                : Number(discount.value || 0)
            discountValue = Math.round(Number(subtotal) * (percent / 100))
        } else if (discount.type === "Fixed Amount" || discount.type === "Amount" || discount.type === "Flat") {
            const rawVal = typeof discount.value === 'string'
                ? parseFloat(discount.value.replace(/[^0-9.]/g, ""))
                : Number(discount.value || 0)
            discountValue = Math.min(Number(subtotal), rawVal)
            percent = subtotal > 0 ? Math.round((discountValue / subtotal) * 100) : 0
        }

        return NextResponse.json({
            code: discount.code,
            name: discount.campaign || "Special Discount",
            type: discount.type,
            value: discount.value,
            percent: percent,
            amount: discountValue
        })
    } catch (error: any) {
        console.error("[DISCOUNTS_VALIDATE] Unhandled error:", error)
        return NextResponse.json({ error: "Could not validate promo code" }, { status: 500 })
    }
}
