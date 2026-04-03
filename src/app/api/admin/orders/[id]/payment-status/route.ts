import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin, getAuthUser } from "@/lib/server-auth"

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params
        console.log(`[PAYMENT] Updating status for order ${orderId}...`)
        
        // 1. Verify Admin
        const isAdmin = await verifyAdmin(req)
        if (!isAdmin) {
            const diag = (req as any).authDiagnostics
            console.warn(`[AUTH] Access denied for manifest ${orderId}. Diagnostics:`, diag)
            return NextResponse.json({ 
                error: "Unauthorized access",
                diagnostics: diag
            }, { status: 401 })
        }

        const admin = await getAuthUser(req)
        const body = await req.json()
        const { paymentStatus } = body

        if (!paymentStatus) {
            return NextResponse.json({ error: "Missing payment status in request" }, { status: 400 })
        }

        // 2. Fetch current status for auditing
        console.log(`[SYNC] Finding order ${orderId}...`)
        
        const { data: currentOrder, error: sbFetchError } = await supabaseAdmin
            .from('Order')
            .select('*')
            .eq('id', orderId)
            .maybeSingle()

        if (sbFetchError) throw sbFetchError
        if (!currentOrder) {
            console.error(`[SYNC] Order ${orderId} not found.`)
            return NextResponse.json({ error: "Order record not found" }, { status: 404 })
        }

        const previousStatus = currentOrder.paymentStatus
        const orderNumber = currentOrder.orderNumber

        // 3. Update Status
        console.log(`[TRANSITION] Updating ${orderNumber} from ${previousStatus} to ${paymentStatus}...`)

        const { data: updatedOrder, error: sbUpdateError } = await supabaseAdmin
            .from('Order')
            .update({ 
                paymentStatus,
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId)
            .select()
            .single()

        if (sbUpdateError) {
            console.error(`[TRANSITION] Cloud Core update failed:`, sbUpdateError.message)
            throw sbUpdateError
        }

        console.log(`[TRANSITION] Cloud Core update successful.`)

        // 4. Log the change for auditing
        try {
            await supabaseAdmin.from('AuditLog').insert([{
                id: crypto.randomUUID(),
                action: 'UPDATE_PAYMENT_STATUS',
                category: 'FINANCIAL',
                details: `Payment update: ${orderNumber} -> ${paymentStatus}`,
                orderId,
                previousPaymentStatus: previousStatus || 'N/A',
                newPaymentStatus: paymentStatus,
                adminId: admin?.id || '00000000-0000-0000-0000-000000000000',
                adminName: (admin?.user_metadata?.full_name || admin?.email || 'System Admin'),
                adminEmail: admin?.email || 'admin@smarthub.com',
                timestamp: new Date().toISOString()
            }])
        } catch (logErr) {
            console.warn("[AUDIT] Logging failure. Operation continued anyway.")
        }

        return NextResponse.json(updatedOrder)
    } catch (error: any) {
        console.error("[CRITICAL] Financial status update crashed:", error.message)
        return NextResponse.json({ 
            error: error.message || "Payment system error" 
        }, { status: 500 })
    }
}

