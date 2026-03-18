
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: orderId } = await params
        const { status, message, notes, trackingNumber, courier, estimatedDelivery } = await req.json()

        if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 })
        }

        // 1. Update Order table
        const updateData: any = { 
            status, 
            updatedAt: new Date().toISOString() 
        }
        
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
        if (courier !== undefined) updateData.courier = courier
        if (estimatedDelivery !== undefined) updateData.estimatedDelivery = estimatedDelivery

        const { error: updateError } = await supabaseAdmin
            .from('Order')
            .update(updateData)
            .eq('id', orderId)

        if (updateError) throw updateError

        // 2. Add to History
        const { error: historyError } = await supabaseAdmin
            .from('OrderStatusHistory')
            .insert({
                orderId,
                status,
                message: message || `Order status updated to ${status}`,
                notes,
                timestamp: new Date().toISOString()
            })

        if (historyError) {
            console.error("History recording failed but order was updated:", historyError)
        }

        // 3. Trigger Notifications (Async)
        try {
            // Fetch order details for notification context
            const { data: order } = await supabaseAdmin
                .from('Order')
                .select('*, items:OrderItem(*)')
                .eq('id', orderId)
                .single()

            if (order) {
                console.log(`[Notification] Sending update to ${order.customerEmail || 'customer'}: Order ${order.orderNumber} is now ${status}`)
                // In a real app, you'd call SendGrid, Twilio, etc. here
                // triggerEmail(order.customerEmail, 'Status Update', status, message)
                // triggerSMS(order.shippingAddress.phone, `Your order ${order.orderNumber} is now ${status}`)
            }
        } catch (notifierError) {
            console.error("Notification trigger failed:", notifierError)
        }

        return NextResponse.json({ success: true, status })

    } catch (error: any) {
        console.error("Order Status Update Error:", error)
        return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 })
    }
}
