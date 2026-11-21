import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const productId = searchParams.get("productId")
        const limit = parseInt(searchParams.get("limit") || "200")

        let query = supabaseAdmin
            .from('StockLog')
            .select('*')
            .order('createdAt', { ascending: false })
            .limit(limit)

        if (productId) query = query.eq('productId', productId)

        const { data, error } = await query
        if (error) throw error
        return NextResponse.json(data || [])
    } catch (error: any) {
        return NextResponse.json([])
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { productId, productName, variantId, identifier, previousStock, newStock, note } = body

        const quantityChanged = newStock - previousStock
        const type = previousStock === 0 && newStock > 0
            ? "first_entry"
            : quantityChanged > 0
            ? "restock"
            : quantityChanged < 0
            ? "deduction"
            : "adjustment"

        const { data, error } = await supabaseAdmin
            .from('StockLog')
            .insert({
                productId,
                productName,
                variantId: variantId || null,
                identifier,
                type,
                previousStock,
                quantityChanged,
                newStock,
                note: note || null,
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        console.error("StockLog insert error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
