
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: Request, context: { params: Promise<{ orderNumber: string }> }) {
    try {
        const { orderNumber } = await context.params

        if (!orderNumber) {
            return NextResponse.json({ error: "Order number is required" }, { status: 400 })
        }

        const upperOrderNumber = orderNumber.toUpperCase()

        // 1. Fetch the main order (try both camelCase and snake_case for column names)
        let { data: order, error: orderError } = await supabaseAdmin
            .from('Order')
            .select('*')
            .eq('orderNumber', upperOrderNumber)
            .maybeSingle()

        if (orderError || !order) {
            // Try snake_case if camelCase fails or returns nothing
            const { data: snakeOrder, error: snakeError } = await supabaseAdmin
                .from('Order')
                .select('*')
                .eq('order_number', upperOrderNumber)
                .maybeSingle()
            
            if (snakeError) throw snakeError
            if (snakeOrder) order = snakeOrder
        }
        
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Normalize orderNumber for the frontend
        if (order.order_number && !order.orderNumber) {
            order.orderNumber = order.order_number
        }

        // 2. Fetch order items
        const { data: items, error: itemsError } = await supabaseAdmin
            .from('OrderItem')
            .select('*')
            .eq('orderId', order.id)

        if (!itemsError) order.items = items

        // 3. Fetch status history
        const { data: history, error: historyError } = await supabaseAdmin
            .from('OrderStatusHistory')
            .select('*')
            .eq('orderId', order.id)
            .order('timestamp', { ascending: false })

        if (!historyError) order.history = history

        return NextResponse.json(order)

    } catch (error: any) {
        console.error("Supabase Order Tracking Error:", error)
        return NextResponse.json({ 
            error: "Failed to fetch order tracking info",
            details: error.message || "Unknown error during data retrieval"
        }, { status: 500 })
    }
}
