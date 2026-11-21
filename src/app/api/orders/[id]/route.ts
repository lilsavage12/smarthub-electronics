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

        const isRestockingStatus = (status: string) => {
            const s = (status || '').toUpperCase()
            return s === 'CANCELLED' || s === 'RETURNED'
        }

        const isMarkingRestock = body.status && isRestockingStatus(body.status)
        const alreadyRestocked = isRestockingStatus(order.status)

        if (isMarkingRestock && !alreadyRestocked) {
            // RESTORE STOCK LOGIC
            for (const item of (order.items || [])) {
                if (item.productId) {
                    const { data: product } = await supabaseAdmin.from('Product').select('stock').eq('id', item.productId).maybeSingle()
                    if (product && typeof product.stock === 'number') {
                        const restoredStock = product.stock + (Number(item.quantity) || 1)
                        await supabaseAdmin.from('Product').update({ stock: restoredStock }).eq('id', item.productId)
                    }
                }
            }

            // Update status to Cancelled or Returned
            const { error } = await supabaseAdmin
                .from('Order')
                .update({ ...body, updatedAt: new Date().toISOString() })
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

