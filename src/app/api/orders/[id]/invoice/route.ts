import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getAuthUser, verifyAdmin } from "@/lib/server-auth"
import { jsPDF } from "jspdf"

// Polyfills for reliable Node.js PDF assembly
if (typeof btoa === 'undefined') { global.btoa = (str) => Buffer.from(str, 'binary').toString('base64'); }
if (typeof atob === 'undefined') { global.atob = (str) => Buffer.from(str, 'base64').toString('binary'); }

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params
        console.log(`[INVOICE] Generating document for ID: ${orderId}`)
        
        const user = await getAuthUser(req)
        const isAdmin = await verifyAdmin(req)

        if (!user && !isAdmin) {
            console.warn("[AUTH] Denied document access: No valid user or admin session.")
            return NextResponse.json({ error: "Unauthorized access to private record" }, { status: 401 })
        }

        // 1. Fetch Order Metadata
        console.log(`[SYNC] Querying database for order ${orderId}...`)
        const { data: order, error: sbErr } = await supabaseAdmin
            .from('Order')
            .select('*, items:OrderItem(*)')
            .eq('id', orderId)
            .maybeSingle()
        
        if (sbErr) throw sbErr

        if (!order) {
            console.error(`[SYNC] Failure: Order ${orderId} does not exist in the database.`)
            return NextResponse.json({ error: "Order record not found" }, { status: 404 })
        }

        // 2. Authorization Handshake
        const isOwner = order.userId === user?.id || (user?.email && order.customerEmail === user?.email);
        if (!isAdmin && !isOwner) {
            console.warn(`[AUTH] Access forbidden for user ${user?.email} on record ${orderId}`)
            return NextResponse.json({ error: "Access Denied: You do not have permission to view this order record" }, { status: 403 })
        }

        // 3. Document Template Configuration
        let s = {
            primaryColor: '#3B82F6',
            headerBgColor: '#0F0F12',
            storeName: 'SmartHub Electronics',
            storeAddress: 'Precision High-Tech Solutions Records',
            fontFamily: 'helvetica'
        }
        
        try {
            const { data: template } = await supabaseAdmin.from('DocumentTemplate').select('*').eq('templateType', 'invoice').maybeSingle()
            if (template) {
                s = { 
                    ...s, 
                    ...template,
                    headerBgColor: template.headerBgColor?.startsWith('#') ? template.headerBgColor : s.headerBgColor
                }
            }
        } catch (e) {
            console.warn("[TEMPLATE] Using hardcoded fail-safes.")
        }

        // 4. PDF Generation
        console.log("[ASSEMBLY] Initializing PDF engine...")
        const doc = new jsPDF({ unit: 'mm', format: 'a4' })
        
        // Safely parse colors
        const safeHexToRgb = (hex: string, fallback: number[]) => {
            try {
                if (!hex || hex.length < 7) return fallback
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)
                return isNaN(r) || isNaN(g) || isNaN(b) ? fallback : [r, g, b]
            } catch {
                return fallback
            }
        }

        const headerColor = safeHexToRgb(s.headerBgColor, [15, 15, 18])

        // Header Graphic
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2])
        doc.rect(0, 0, 210, 40, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(22)
        doc.text(s.storeName.toUpperCase(), 20, 26)
        doc.setFontSize(8)
        doc.text(s.storeAddress.toUpperCase(), 20, 33)
        
        doc.setFontSize(18)
        doc.text("OFFICIAL INVOICE", 140, 26)

        // Metadata Block
        doc.setTextColor(40, 40, 40)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text(`REFERENCE: ${order.orderNumber || 'SH-ORD-000'}`, 20, 55)
        doc.setFont("helvetica", "normal")
        doc.text(`ORDER DATE: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 60)
        doc.text(`RECORD ID: ${order.id.toUpperCase()}`, 20, 65)

        // Customer Block
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.text("SHIP TO:", 20, 80)
        doc.setFont("helvetica", "normal")
        doc.text((order.customerName || "Customer").toUpperCase(), 20, 87)
        doc.text(order.customerEmail || "No Email Registered", 20, 92)
        doc.text(order.address || "Address Not Available", 20, 97)
        doc.text(order.city || "", 20, 102)

        // Table Header
        let y = 120
        doc.setFillColor(30, 30, 30)
        doc.rect(20, y, 170, 8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(7)
        doc.text("ITEM SPECIFICATION", 25, y+5)
        doc.text("QTY", 120, y+5)
        doc.text("UNIT PRICE", 140, y+5)
        doc.text("SUBTOTAL", 170, y+5)
        y += 12

        // Table Rows
        doc.setTextColor(40, 40, 40)
        const items = order.items || []
        items.forEach((item: any) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont("helvetica", "bold")
            doc.text(`${item.name || 'Product Item'}`, 25, y)
            doc.setFont("helvetica", "normal")
            doc.text(`${item.quantity || 1}`, 120, y)
            doc.text(`$${(item.price || 0).toLocaleString()}`, 140, y)
            doc.text(`$${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`, 170, y)
            y += 7
            doc.setDrawColor(240, 240, 240)
            doc.line(20, y-2, 190, y-2)
            y += 2
        })

        // Summary Block
        y += 10
        if (y > 250) { doc.addPage(); y = 30; }
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor( headerColor[0], headerColor[1], headerColor[2] )
        doc.text("TOTAL AMOUNT:", 100, y)
        doc.text(`$${(order.totalAmount || 0).toLocaleString()}`, 170, y)
        
        doc.setFontSize(7)
        doc.setFont("helvetica", "normal")
        doc.text(`PAYMENT METHOD: ${order.paymentMethod?.toUpperCase() || 'EXTERNAL'}`, 100, y+6)
        doc.text(`STATUS: ${order.paymentStatus?.toUpperCase() || 'UNVERIFIED'}`, 100, y+11)

        // Metadata Seal
        doc.setFontSize(6)
        doc.setTextColor(180, 180, 180)
        doc.text("Digitally Generated by SmartHub • Valid as Official Transaction Record", 105, 280, { align: 'center' })

        // Finalization
        console.log("[ASSEMBLY] Generation complete. Delivering PDF stream...")
        const pdfBuffer = doc.output('arraybuffer')
        return new Response(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename=Invoice-${order.orderNumber || order.id.slice(0, 8)}.pdf`
            }
        })
    } catch (error: any) {
        console.error("[CRITICAL] Invoice generation failure:", error.message, error.stack)
        return NextResponse.json({ 
            error: "Failed to generate invoice document", 
            details: error.message,
            diagnosticTrace: error.stack?.split('\n')[0] 
        }, { status: 500 })
    }
}
