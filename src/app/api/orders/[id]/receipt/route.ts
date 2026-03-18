import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getAuthUser, verifyAdmin } from "@/lib/server-auth"
import { jsPDF } from "jspdf"

// Polyfill for Node environment (jsPDF requirements)
if (typeof btoa === 'undefined') {
    global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
if (typeof atob === 'undefined') {
    global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
}

interface jsPDFWithPlugin extends jsPDF {
    autoTable?: (options: any) => jsPDF
    setLineDash: (dashArray: number[], dashPhase: number) => jsPDF
}

interface DocumentTemplate {
    primaryColor?: string
    headerBgColor?: string
    storeName?: string
    storeAddress?: string
    storeContact?: string
    websiteUrl?: string
    fontFamily?: string
    footerText?: string
    sectionVisibility?: {
        [key: string]: boolean
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log("Receipt API: Starting...")
        const { id: orderId } = await params
        const user = await getAuthUser(req)
        const isAdmin = await verifyAdmin(req)

        if (!user && !isAdmin) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: order, error: orderError } = await supabaseAdmin
            .from('Order')
            .select('*, items:OrderItem(*)')
            .eq('id', orderId)
            .single()

        if (orderError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Ownership Check (Identity Bridge)
        const isOwner = order.userId === user?.id || (user?.email && order.customerEmail === user.email);
        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 })
        }

        // Fetch Template (Safe Fallback)
        let template = null;
        try {
            const { data } = await supabaseAdmin.from('DocumentTemplate').select('*').eq('templateType', 'receipt').maybeSingle()
            template = data;
        } catch (e) {
            console.log("Receipt API: DocumentTemplate lookup failed, using defaults")
        }

        const s: DocumentTemplate = template || {
            primaryColor: '#3B82F6',
            headerBgColor: '#0F0F12',
            storeName: 'SmartHub Electronics',
            storeAddress: '123 Tech Avenue, Silicon Valley',
            storeContact: '+1 (555) 123-4567',
            websiteUrl: 'www.smarthub.com',
            fontFamily: 'helvetica',
            sectionVisibility: {
                storeHeader: true, orderId: true, paymentConfirmation: true,
                productList: true, amountPaid: true, paymentMethod: true,
                transactionRef: true, thankYouMessage: true
            }
        }

        const vis = s.sectionVisibility || {}
        const itemHeight = order.items.length * 15
        const slipHeight = Math.max(180, 100 + itemHeight)
        
        console.log("Receipt API: Initializing jsPDF...")
        const doc = new jsPDF({
            unit: 'mm',
            format: [80, slipHeight] 
        }) as jsPDFWithPlugin

        const hexToRgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            return [r, g, b]
        }

        const headerBgRgb = hexToRgb(s.headerBgColor || '#0F0F12')
        const center = 40
        let y = 12

        // Header
        if (vis.storeHeader !== false) {
            doc.setFillColor(headerBgRgb[0], headerBgRgb[1], headerBgRgb[2])
            doc.rect(0, 0, 80, 28, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(14)
            doc.setFont(s.fontFamily || "helvetica", "bold")
            doc.text((s.storeName || "SMARTHUB").toUpperCase(), center, y, { align: "center" })
            y += 5
            doc.setFontSize(7)
            doc.setFont(s.fontFamily || "helvetica", "normal")
            doc.text((s.storeAddress || "Official POS Terminal").toUpperCase(), center, y, { align: "center" })
            y += 18
        } else {
            y += 5
        }

        // Details
        doc.setFontSize(6)
        doc.setTextColor(100, 100, 100)
        doc.text(`TRACE ID: ${order.id.toUpperCase()}`, 5, y)
        y += 3.5
        doc.text(`ORDER NO: ${order.orderNumber}`, 5, y)
        y += 3.5
        doc.text(`STAMP: ${new Date(order.createdAt).toLocaleString()}`, 5, y)
        y += 3.5
        doc.text(`HOLDER: ${order.customerName.toUpperCase()}`, 5, y)
        y += 8

        doc.setDrawColor(220, 220, 220)
        doc.line(5, y, 75, y)
        y += 5

        // Items
        if (vis.productList !== false) {
            doc.setFont(s.fontFamily || "helvetica", "bold")
            doc.setFontSize(8)
            doc.setTextColor(30, 30, 30)
            doc.text("PURCHASED ASSETS", 5, y)
            doc.text("VALUE", 75, y, { align: "right" })
            y += 4
            doc.line(5, y, 75, y)
            y += 6

            doc.setFont(s.fontFamily || "helvetica", "normal")
            doc.setFontSize(7)
            order.items.forEach((item: any) => {
                const lines = doc.splitTextToSize(`${item.quantity}x ${item.name}`, 50)
                doc.text(lines, 5, y)
                doc.text(`$${(item.price * item.quantity).toLocaleString()}`, 75, y, { align: "right" })
                y += (lines.length * 4) + 2
            })
            y += 4
            doc.setLineDash([1, 1], 0)
            doc.line(5, y, 75, y)
            doc.setLineDash([], 0)
            y += 8
        }

        // Footer Totals
        if (vis.amountPaid !== false) {
            doc.setFontSize(10)
            doc.setFont(s.fontFamily || "helvetica", "bold")
            doc.text("TOTAL SETTLEMENT", 5, y)
            doc.text(`$${order.totalAmount.toLocaleString()}`, 75, y, { align: "right" })
            y += 8
        }

        doc.setFontSize(7)
        doc.text(`GW METHOD: ${order.paymentMethod}`, 5, y)
        y += 3.5
        doc.text(`PROTOCOL STATUS: ${order.paymentStatus}`, 5, y)

        const pdfBuffer = doc.output('arraybuffer')
        console.log("Receipt API: Success")
        return new Response(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=Receipt-${order.orderNumber}.pdf`
            }
        })
    } catch (error: any) {
        console.error("FATAL RECEIPT ERROR:", error.message, error.stack)
        return NextResponse.json({ error: "Failed to generate receipt", details: error.message }, { status: 500 })
    }
}
