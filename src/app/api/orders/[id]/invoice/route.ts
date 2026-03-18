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
        console.log("Invoice API: Initializing secure document request...")
        const { id: orderId } = await params
        const user = await getAuthUser(req)
        const isAdmin = await verifyAdmin(req)

        if (!user && !isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // 1. Fetch Order Metadata
        const { data: order, error: orderError } = await supabaseAdmin
            .from('Order')
            .select('*, items:OrderItem(*)')
            .eq('id', orderId)
            .single()

        if (orderError || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        // 2. Authorization Handshake (Primary ID + Verified Email)
        const isOwner = order.userId === user?.id || (user?.email && order.customerEmail === user.email);
        if (!isAdmin && !isOwner) return NextResponse.json({ error: "Forbidden access" }, { status: 403 })

        // 3. Document Template Retrieval
        let s = {
            primaryColor: '#3B82F6',
            headerBgColor: '#0F0F12',
            storeName: 'SmartHub Electronics',
            storeAddress: '123 Tech Avenue, Silicon Valley',
            fontFamily: 'helvetica'
        }
        
        try {
            const { data: template } = await supabaseAdmin.from('DocumentTemplate').select('*').eq('templateType', 'invoice').maybeSingle()
            if (template) s = { ...s, ...template }
        } catch (e) {
            console.warn("Using enterprise defaults for invoice rendering")
        }

        // 4. PDF Vector Assembly
        const doc = new jsPDF({ unit: 'mm', format: 'a4' })
        
        // Header Graphic
        doc.setFillColor(15, 15, 18) // Dark Slate
        doc.rect(0, 0, 210, 40, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFont(s.fontFamily, "bold")
        doc.setFontSize(22)
        doc.text(s.storeName.toUpperCase(), 20, 26)
        doc.setFontSize(8)
        doc.text(s.storeAddress.toUpperCase(), 20, 33)
        
        doc.setFontSize(18)
        doc.text("OFFICIAL INVOICE", 140, 26)

        // Metadata Block
        doc.setTextColor(40, 40, 40)
        doc.setFontSize(9)
        doc.setFont(s.fontFamily, "bold")
        doc.text(`REFERENCE: ${order.orderNumber}`, 20, 55)
        doc.setFont(s.fontFamily, "normal")
        doc.text(`ISSUED: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 60)
        doc.text(`AUTH ID: ${order.id.toUpperCase()}`, 20, 65)

        // Customer Block
        doc.setFontSize(10)
        doc.setFont(s.fontFamily, "bold")
        doc.text("REGISTERED SHIPMENT TO:", 20, 80)
        doc.setFont(s.fontFamily, "normal")
        doc.text(order.customerName || "Asset Holder", 20, 87)
        doc.text(order.customerEmail || "", 20, 92)
        doc.text(order.address || "", 20, 97)
        doc.text(order.city || "", 20, 102)

        // Table Rendering (Native Vector - NO PLUGIN REQUIRED)
        let y = 120
        doc.setFillColor(30, 30, 30) // Header row
        doc.rect(20, y, 170, 8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.text("HARDWARE SPECIFICATION", 25, y+5)
        doc.text("QTY", 120, y+5)
        doc.text("UNIT PRICE", 140, y+5)
        doc.text("SUBTOTAL", 170, y+5)
        y += 12

        doc.setTextColor(60, 60, 60)
        order.items.forEach((item: any, i: number) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont(s.fontFamily, "bold")
            doc.text(`${item.name}`, 25, y)
            doc.setFont(s.fontFamily, "normal")
            doc.text(`${item.quantity}`, 120, y)
            doc.text(`$${item.price.toLocaleString()}`, 140, y)
            doc.text(`$${(item.price * item.quantity).toLocaleString()}`, 170, y)
            y += 7
            doc.setDrawColor(240, 240, 240)
            doc.line(20, y-2, 190, y-2)
            y += 2
        })

        // Summary Block
        y += 10
        if (y > 250) { doc.addPage(); y = 30; }
        doc.setFont(s.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(15, 15, 18)
        doc.text("TOTAL SETTLEMENT VALUE:", 100, y)
        doc.text(`$${order.totalAmount.toLocaleString()}`, 170, y)
        
        doc.setFontSize(8)
        doc.setFont(s.fontFamily, "normal")
        doc.text(`PROTOCOL: ${order.paymentMethod.toUpperCase()}`, 100, y+6)
        doc.text(`STATUS: ${order.paymentStatus.toUpperCase()}`, 100, y+11)

        // Finalization
        const pdfBuffer = doc.output('arraybuffer')
        return new Response(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=Invoice-${order.orderNumber}.pdf`
            }
        })
    } catch (error: any) {
        console.error("CRITICAL MANIFEST FAULT:", error)
        return NextResponse.json({ error: "Failed to generate invoice", details: error.message }, { status: 500 })
    }
}
