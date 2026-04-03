import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: orderId } = await params

        const { data: order, error: sbError } = await supabaseAdmin
            .from('Order')
            .select('*, items:OrderItem(*)')
            .eq('id', orderId)
            .maybeSingle()

        if (sbError) throw sbError
        if (!order) {
            return NextResponse.json({ error: "Order record not found" }, { status: 404 })
        }

        return NextResponse.json(order)
    } catch (error: any) {
        console.error("Supabase Order Fetch Error:", error)
        return NextResponse.json({ error: error.message || "Failed to retrieve order record" }, { status: 500 })
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: orderId } = await params
        const body = await req.json()

        const { data: order, error: fetchError } = await supabaseAdmin
            .from('Order')
            .select('*, items:OrderItem(*)')
            .eq('id', orderId)
            .maybeSingle()

        if (fetchError) throw fetchError
        if (!order) {
            return NextResponse.json({ error: "Order record not found" }, { status: 404 })
        }

        const isMarkingCancelled = body.status === "Cancelled" || body.status === "CANCELLED"
        const alreadyCancelled = order.status === "Cancelled" || order.status === "CANCELLED"

        if (isMarkingCancelled && !alreadyCancelled) {
            // RESTORE STOCK LOGIC
            for (const item of (order.items || [])) {
                // 1. Restore Base Product Stock
                const { data: product } = await supabaseAdmin.from('Product').select('stock, specs').eq('id', item.productId).single()
                if (product) {
                    await supabaseAdmin.from('Product').update({ stock: (product.stock || 0) + item.quantity }).eq('id', item.productId)
                    
                    // 2. Restore Variant/Color Stock
                    if (item.variantId) {
                        const { data: variant } = await supabaseAdmin.from('ProductVariant').select('productColors').eq('id', item.variantId).single()
                        if (variant) {
                            let vColors = []
                            try { vColors = typeof variant.productColors === 'string' ? JSON.parse(variant.productColors) : (variant.productColors || []) } catch { vColors = [] }
                            
                            const colorIdx = vColors.findIndex((c: any) => c.color?.toLowerCase() === item.color?.toLowerCase())
                            if (colorIdx >= 0) {
                                vColors[colorIdx].stock = (parseInt(vColors[colorIdx].stock || '0') + item.quantity).toString()
                                await supabaseAdmin.from('ProductVariant').update({ productColors: JSON.stringify(vColors) }).eq('id', item.variantId)
                            }
                        }
                    } else if (item.color) {
                        // Master color restoration
                        let pSpecs = typeof product.specs === 'string' ? JSON.parse(product.specs) : (product.specs || {})
                        let pColors = pSpecs.productColors || []
                        const colorIdx = pColors.findIndex((c: any) => c.color?.toLowerCase() === item.color?.toLowerCase())
                        if (colorIdx >= 0) {
                            pColors[colorIdx].stock = (parseInt(pColors[colorIdx].stock || '0') + item.quantity).toString()
                            pSpecs.productColors = pColors
                            await supabaseAdmin.from('Product').update({ specs: JSON.stringify(pSpecs) }).eq('id', item.productId)
                        }
                    }
                }
            }

            // Update status to Cancelled
            const { error } = await supabaseAdmin
                .from('Order')
                .update({ status: "CANCELLED", updatedAt: new Date().toISOString() })
                .eq('id', orderId)
            if (error) throw error
        } else {
            // Normal status update
            const { error } = await supabaseAdmin
                .from('Order')
                .update({ 
                    ...body, 
                    updatedAt: new Date().toISOString() 
                })
                .eq('id', orderId)
            if (error) throw error
        }

        const { data: updated, error: finalFetchError } = await supabaseAdmin
            .from('Order')
            .select('*, items:OrderItem(*)')
            .eq('id', orderId)
            .single()

        if (finalFetchError) throw finalFetchError
        return NextResponse.json(updated)
    } catch (error: any) {
        console.error("Supabase Order Update Error:", error)
        return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: orderId } = await params
        
        const { error: sbError } = await supabaseAdmin
            .from('Order')
            .delete()
            .eq('id', orderId)
        
        if (sbError) throw sbError

        return NextResponse.json({ message: "Order record removed from database" })
    } catch (error: any) {
        console.error("Supabase Order Deletion Error:", error)
        return NextResponse.json({ error: error.message || "Failed to delete order" }, { status: 500 })
    }
}

