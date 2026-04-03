import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: orderId } = await params
        const body = await req.json()
        const { status, message, notes, trackingNumber, courier, estimatedDelivery } = body

        if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 })
        }

        // 1. Prepare Update Metadata
        const updateData: any = { 
            status, 
            updatedAt: new Date().toISOString() 
        }
        
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
        if (courier !== undefined) updateData.courier = courier
        if (estimatedDelivery !== undefined) updateData.estimatedDelivery = estimatedDelivery

        // 2. Update Supabase
        const { data: supabaseOrder, error: fetchError } = await supabaseAdmin
            .from('Order')
            .select('*')
            .eq('id', orderId)
            .maybeSingle()

        if (fetchError) throw fetchError
        if (!supabaseOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        const { error: sbUpdateError } = await supabaseAdmin
            .from('Order')
            .update(updateData)
            .eq('id', orderId)

        if (sbUpdateError) throw sbUpdateError

        // Log to Status History
        await supabaseAdmin.from('OrderStatusHistory').insert({
            orderId,
            status,
            message: message || `Order status updated to ${status}`,
            notes,
            timestamp: new Date().toISOString()
        })

        // 3. Trigger Notifications
        try {
            console.log(`[Notification] Dispatching update for order ${orderId} -> ${status}`)
        } catch (notifierError) {
            console.error("Notification trigger failed:", notifierError)
        }

        return NextResponse.json({ success: true, status })

    } catch (error: any) {
        console.error("Supabase Order Status Update Error:", error)
        return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 })
    }
}

