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
        const { id: orderId } = await params
        console.log(`[RECEIPT] Starting document generation for order: ${orderId}`)
        const user = await getAuthUser(req)
        const isAdmin = await verifyAdmin(req)

        if (!user && !isAdmin) {
             return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }

        // 1. Fetch Order Metadata
        console.log("[SYNC] Querying database...")
        const { data: order, error: sbErr } = await supabaseAdmin
            .from('Order')
            .select('*, items:OrderItem(*)')
            .eq('id', orderId)
            .maybeSingle()
        
        if (sbErr) throw sbErr

        if (!order) {
            console.error(`[SYNC] FAILURE: Order ${orderId} missing from database.`)
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // 2. Authorization Verification
        const isOwner = order.userId === user?.id || (user?.email && order.customerEmail === user?.email);
        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Access Denied: You do not have permission to view this order record" }, { status: 403 })
        }

        // Fetch Template (Safe Fallback)
        let template = null;
        try {
            const { data } = await supabaseAdmin.from('DocumentTemplate').select('*').eq('templateType', 'receipt').maybeSingle()
            template = data;
        } catch (e) {
            console.warn("[TEMPLATE] Using default slip configuration.")
        }

        const s: DocumentTemplate = template || {
            primaryColor: '#3B82F6',
            headerBgColor: '#0F0F12',
            storeName: 'SmartHub Electronics',
            storeAddress: 'Precision High-Tech Solutions',
            fontFamily: 'helvetica',
            sectionVisibility: {
                storeHeader: true, orderId: true, paymentConfirmation: true,
                productList: true, amountPaid: true, paymentMethod: true,
                transactionRef: true, thankYouMessage: true
            }
        }

        const vis = s.sectionVisibility || {}
        const items = order.items || []
        const itemHeight = items.length * 15
        const slipHeight = Math.max(160, 80 + itemHeight)
        
        console.log("[ASSEMBLY] Initializing PDF engine...")
        const doc = new jsPDF({
            unit: 'mm',
            format: [80, slipHeight] 
        }) as jsPDFWithPlugin

        const safeHexToRgb = (hex: string, fallback: number[]) => {
            try {
                if (!hex || hex.length < 7) return fallback
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)
                return isNaN(r) || isNaN(g) || isNaN(b) ? fallback : [r, g, b]
            } catch { return fallback }
        }

        const headerBgRgb = safeHexToRgb(s.headerBgColor || '#0F0F12', [15, 15, 18])
        const center = 40
        let y = 12

        // Header
        if (vis.storeHeader !== false) {
            doc.setFillColor(headerBgRgb[0], headerBgRgb[1], headerBgRgb[2])
            doc.rect(0, 0, 80, 28, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.text((s.storeName || "SMARTHUB").toUpperCase(), center, y, { align: "center" })
            y += 5
            doc.setFontSize(7)
            doc.setFont("helvetica", "normal")
            doc.text((s.storeAddress || "Official Store Terminal").toUpperCase(), center, y, { align: "center" })
            y += 18
        } else {
            y += 5
        }

        // Details
        doc.setFontSize(6)
        doc.setTextColor(100, 100, 100)
        doc.text(`RECORD ID: ${(order.id || "N/A").toUpperCase()}`, 5, y)
        y += 3.5
        doc.text(`ORDER NO: ${order.orderNumber || "ORD-000"}`, 5, y)
        y += 3.5
        doc.text(`DATE: ${order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}`, 5, y)
        y += 3.5
        doc.text(`CUSTOMER: ${(order.customerName || "CUSTOMER").toUpperCase()}`, 5, y)
        y += 8

        doc.setDrawColor(220, 220, 220)
        doc.line(5, y, 75, y)
        y += 5

        // Items
        if (vis.productList !== false) {
            doc.setFont("helvetica", "bold")
            doc.setFontSize(8)
            doc.setTextColor(30, 30, 30)
            doc.text("PURCHASED ITEMS", 5, y)
            doc.text("AMOUNT", 75, y, { align: "right" })
            y += 4
            doc.line(5, y, 75, y)
            y += 6

            doc.setFont("helvetica", "normal")
            doc.setFontSize(7)
            items.forEach((item: any) => {
                const lines = doc.splitTextToSize(`${item.quantity || 1}x ${item.name || 'Item'}`, 50)
                doc.text(lines, 5, y)
                doc.text(`$${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`, 75, y, { align: "right" })
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
            doc.setFont("helvetica", "bold")
            doc.text("TOTAL AMOUNT", 5, y)
            doc.text(`$${(order.totalAmount || 0).toLocaleString()}`, 75, y, { align: "right" })
            y += 8
        }

        doc.setFontSize(7)
        doc.text(`PAYMENT METHOD: ${order.paymentMethod || 'SECURE'}`, 5, y)
        y += 3.5
        doc.text(`PAYMENT STATUS: ${order.paymentStatus || 'VERIFIED'}`, 5, y)

        const pdfBuffer = doc.output('arraybuffer')
        console.log("[ASSEMBLY] Success. Generating PDF stream...")
        return new Response(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename=Receipt-${order.orderNumber || order.id.slice(0, 8)}.pdf`
            }
        })
    } catch (error: any) {
        console.error("[CRITICAL] Receipt generation failure:", error.message, error.stack)
        return NextResponse.json({ 
            error: "Failed to generate receipt document", 
            details: error.message,
            diagnosticTrace: error.stack?.split('\n')[0]
        }, { status: 500 })
    }
}

