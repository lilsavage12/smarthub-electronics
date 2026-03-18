import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin, getAuthUser } from "@/lib/server-auth"

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params
        
        // 1. Verify Admin
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }

        const admin = await getAuthUser(req)
        const body = await req.json()
        const { paymentStatus } = body

        if (!paymentStatus) {
            return NextResponse.json({ error: "Payment status is required" }, { status: 400 })
        }

        // 2. Fetch current status for auditing
        const { data: currentOrder, error: fetchError } = await supabaseAdmin
            .from('Order')
            .select('paymentStatus, orderNumber')
            .eq('id', orderId)
            .single()

        if (fetchError || !currentOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        const previousStatus = currentOrder.paymentStatus

        // 3. Update Status
        const { data: updatedOrder, error: updateError } = await supabaseAdmin
            .from('Order')
            .update({ 
                paymentStatus,
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId)
            .select()
            .single()

        if (updateError) throw updateError

        // 4. Log the change for auditing
        // Using the existing AuditLog table which has strict NOT NULL constraints
        const { error: logError } = await supabaseAdmin.from('AuditLog').insert([{
            id: crypto.randomUUID(),
            action: 'UPDATE_PAYMENT_STATUS',
            category: 'FINANCIAL',
            details: `Updated payment status for order ${currentOrder.orderNumber} from ${previousStatus} to ${paymentStatus}`,
            orderId,
            previousPaymentStatus: previousStatus || 'N/A',
            newPaymentStatus: paymentStatus,
            adminId: admin?.id || '00000000-0000-0000-0000-000000000000',
            adminName: (admin?.user_metadata?.full_name || admin?.email || 'System Admin'),
            adminEmail: admin?.email || 'admin@smarthub.com',
            timestamp: new Date().toISOString()
        }])

        if (logError) {
            console.error("Audit Logging Failed:", logError.message)
            // We don't fail the request if logging fails, but we log it to console
        }

        return NextResponse.json(updatedOrder)
    } catch (error: any) {
        console.error("Admin Payment Status Update Error:", error)
        return NextResponse.json({ 
            error: error.message || "Failed to update payment status" 
        }, { status: 500 })
    }
}
