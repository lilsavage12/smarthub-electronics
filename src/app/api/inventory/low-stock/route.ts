import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function GET(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const { searchParams } = new URL(req.url)
        const threshold = parseInt(searchParams.get("threshold") || "10")

        const { data: lowStockProducts, error } = await supabase
            .from('Product')
            .select('id, name, stock, price, image, category')
            .lte('stock', threshold)
            .order('stock', { ascending: true })

        if (error) throw error

        return NextResponse.json({
            count: lowStockProducts.length,
            products: lowStockProducts
        })
    } catch (error) {
        console.error("Supabase Inventory Check Error:", error)
        return NextResponse.json({ error: "Failed to check inventory" }, { status: 500 })
    }
}
