import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()

        // If status is being changed to CANCELLED, use the RPC for safety
        if (body.status === "CANCELLED") {
            const { data: rpcData, error: rpcError } = await supabase.rpc('cancel_order_v1', {
                p_order_id: id
            })

            if (rpcError) throw rpcError
            
            const { data: updated, error: fetchError } = await supabase
                .from('Order')
                .select('*, items:OrderItem(*)')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError
            return NextResponse.json(updated)
        }

        const { data: updatedOrder, error } = await supabase
            .from('Order')
            .update({ ...body, updatedAt: new Date().toISOString() })
            .eq('id', id)
            .select('*, items:OrderItem(*)')
            .single()

        if (error) throw error

        return NextResponse.json(updatedOrder)
    } catch (error: any) {
        console.error("Supabase Order Update Error:", error)
        return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { error } = await supabase.from('Order').delete().eq('id', id)
        
        if (error) throw error

        return NextResponse.json({ message: "Order deleted successfully" })
    } catch (error) {
        console.error("Supabase Order Deletion Error:", error)
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
    }
}
