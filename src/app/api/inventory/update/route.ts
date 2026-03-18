import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { productId, quantity, operation } = body

        if (!productId || typeof quantity !== 'number') {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
        }

        const { data: product, error: fetchError } = await supabase
            .from('Product')
            .select('id, name, stock')
            .eq('id', productId)
            .single()

        if (fetchError || !product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        let newStock = product.stock

        if (operation === 'add') {
            newStock += quantity
        } else if (operation === 'subtract') {
            newStock -= quantity
            if (newStock < 0) newStock = 0
        } else if (operation === 'set') {
            newStock = quantity
        } else {
            return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
        }

        const { data: updatedProduct, error: updateError } = await supabase
            .from('Product')
            .update({ stock: newStock, updatedAt: new Date().toISOString() })
            .eq('id', productId)
            .select()
            .single()

        if (updateError) throw updateError

        return NextResponse.json({
            productId: updatedProduct.id,
            name: updatedProduct.name,
            previousStock: product.stock,
            newStock: updatedProduct.stock
        })
    } catch (error) {
        console.error("Supabase Inventory Update Error:", error)
        return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 })
    }
}
