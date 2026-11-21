import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { sendOrderEmails } from "@/lib/email-service"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            customerName,
            customerEmail,
            customerPhone,
            address,
            city,
            area,
            deliveryFee = 0,
            paymentMethod = "M-PESA ON WHATSAPP",
            items = [],
            notes,
            userId,
            promoCode,
            transactionCode
        } = body

        if (!customerName || !customerPhone || !items.length) {
            return NextResponse.json({ 
                error: "Customer Name, Phone and at least one item are required" 
            }, { status: 400 })
        }

        // 1. Group requested quantities by productId and size
        const requestedBySize: Record<string, Record<string, number>> = {}
        const requestedByProduct: Record<string, number> = {}

        for (const item of items) {
            const pId = item.productId
            const size = (item.variant || item.color || item.size || 'L').toUpperCase().trim()
            const qty = Number(item.quantity) || 1
            if (pId) {
                requestedByProduct[pId] = (requestedByProduct[pId] || 0) + qty
                if (!requestedBySize[pId]) requestedBySize[pId] = {}
                requestedBySize[pId][size] = (requestedBySize[pId][size] || 0) + qty
            }
        }

        // 2. Pre-validate individual size stock and total stock
        for (const pId of Object.keys(requestedByProduct)) {
            const { data: p } = await supabaseAdmin.from('Product').select('*').eq('id', pId).maybeSingle()
            if (p) {
                const totalReq = requestedByProduct[pId]
                if (typeof p.stock === 'number' && p.stock < totalReq) {
                    return NextResponse.json({
                        error: `Stock limit reached: ${p.name} only has ${p.stock} unit${p.stock === 1 ? '' : 's'} available across all sizes (you requested ${totalReq}).`
                    }, { status: 400 })
                }

                let specs: any = {}
                try { specs = typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || {}) } catch {}
                const sizeStockMap: Record<string, number> = specs?.sizes || {}

                for (const [size, reqQty] of Object.entries(requestedBySize[pId])) {
                    if (typeof sizeStockMap[size] === 'number' && sizeStockMap[size] < reqQty) {
                        return NextResponse.json({
                            error: `Stock limit reached: Size ${size} of ${p.name} only has ${sizeStockMap[size]} unit${sizeStockMap[size] === 1 ? '' : 's'} available (you requested ${reqQty}).`
                        }, { status: 400 })
                    }
                }
            }
        }

        const orderNumber = `F1-${Date.now().toString().slice(-6)}`
        const now = new Date().toISOString()
        const verifiedItems: any[] = []
        let subtotal = 0

        for (const item of items) {
            let product: any = null

            // 1. Try fetching by ID
            if (item.productId) {
                const { data: p } = await supabaseAdmin
                    .from('Product')
                    .select('*, variants:ProductVariant(*)')
                    .eq('id', item.productId)
                    .maybeSingle()
                product = p
            }

            // 2. Fallback to name or first available product
            if (!product) {
                const { data: pList } = await supabaseAdmin
                    .from('Product')
                    .select('*, variants:ProductVariant(*)')
                    .limit(1)
                product = pList?.[0]
            }

            const itemPrice = Number(item.price || product?.price || 2500)
            const itemName = item.name || product?.name || "F1 Apparel"
            const itemQuantity = Number(item.quantity) || 1
            const itemImage = item.image || product?.image || "/images/f1/media_1795204502659_c168030c.jpg"
            const itemSize = (item.variant || item.color || item.size || 'L').toUpperCase().trim()

            // Safely decrement size stock and product stock
            if (product && typeof product.stock === 'number' && product.stock > 0) {
                let specs: any = {}
                try { specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : (product.specs || {}) } catch {}
                const currentSizes: Record<string, number> = { ...(specs?.sizes || {}) }

                if (typeof currentSizes[itemSize] === 'number') {
                    currentSizes[itemSize] = Math.max(0, currentSizes[itemSize] - itemQuantity)
                    specs.sizes = currentSizes
                }

                const newStock = Math.max(0, product.stock - itemQuantity)
                await supabaseAdmin
                    .from('Product')
                    .update({ 
                        stock: newStock, 
                        specs: JSON.stringify(specs),
                        updatedAt: now 
                    })
                    .eq('id', product.id)
            }

            verifiedItems.push({
                productId: product?.id || crypto.randomUUID(),
                variantId: null,
                color: item.variant || item.size || 'L',
                name: itemName,
                quantity: itemQuantity,
                price: itemPrice,
                originalPrice: Number(item.originalPrice) || Number(product?.originalPrice) || itemPrice,
                image: itemImage
            })

            subtotal += itemPrice * itemQuantity
        }

        // Apply discount if provided
        let discountDeduction = 0
        if (promoCode) {
            const { data: disc } = await supabaseAdmin
                .from('Discount')
                .select('*')
                .eq('code', promoCode.toUpperCase())
                .eq('status', 'Active')
                .maybeSingle()

            if (disc) {
                if (disc.type === 'Percentage') {
                    const pct = parseFloat(String(disc.value).replace('%', '')) || 0
                    discountDeduction = Math.round(subtotal * (pct / 100))
                } else if (disc.type === 'Fixed Amount' || disc.type === 'Amount') {
                    const val = parseFloat(String(disc.value).replace(/[^0-9.]/g, '')) || 0
                    discountDeduction = Math.min(subtotal, val)
                }

                // Increment usedCount
                await supabaseAdmin
                    .from('Discount')
                    .update({ usedCount: (disc.usedCount || 0) + 1, updatedAt: now })
                    .eq('id', disc.id)
            }
        }

        const parsedDeliveryFee = Number(deliveryFee) || 0
        const totalAmount = Math.max(0, subtotal - discountDeduction) + parsedDeliveryFee

        // 3. Save Order
        const orderId = crypto.randomUUID()
        const fallbackEmail = `${(customerPhone || "guest").replace(/[^a-zA-Z0-9]/g, "") || "order"}@f1gear.co.ke`
        const { data: order, error: orderError } = await supabaseAdmin
            .from('Order')
            .insert({
                id: orderId,
                orderNumber,
                userId: userId || null,
                customerName: customerName.trim(),
                customerEmail: (customerEmail && customerEmail.trim()) || fallbackEmail,
                customerPhone: customerPhone.trim(),
                address: (address && address.trim()) || "Nairobi, Kenya",
                city: (city && city.trim()) || "Nairobi",
                area: area || null,
                deliveryFee: parsedDeliveryFee,
                totalAmount,
                paymentMethod: paymentMethod || "M-PESA ON WHATSAPP",
                paymentStatus: "Pending", 
                transactionCode: transactionCode || null,
                notes: notes || null,
                promoCode: promoCode || null,
                status: "Processing", 
                createdAt: now,
                updatedAt: now
            })
            .select()
            .single()

        if (orderError) {
            console.error("[ORDERS_API] Order insertion error:", orderError)
            throw orderError
        }

        // 4. Save Order Items
        const orderItemsToInsert = verifiedItems.map(vi => ({
            id: crypto.randomUUID(),
            orderId: order.id,
            productId: vi.productId || "5373c633-4d97-4367-bc1e-5204fab17609",
            variantId: vi.variantId || null,
            color: vi.color || "Standard",
            name: vi.name || "F1 Gear Item",
            quantity: Number(vi.quantity) || 1,
            price: Number(vi.price) || 0,
            originalPrice: vi.originalPrice ? Number(vi.originalPrice) : null,
            image: vi.image || "/favicon.png",
            createdAt: now,
            updatedAt: now
        }))

        const { error: itemsError } = await supabaseAdmin
            .from('OrderItem')
            .insert(orderItemsToInsert)

        if (itemsError) {
            console.error("[ORDERS_API] OrderItem insertion warning:", itemsError)
        }

        // 5. Dispatch Notification Emails (Admin & Customer) - Awaited for serverless execution lifecycle
        try {
            await sendOrderEmails({ order, items: verifiedItems })
        } catch (e) {
            console.error("[ORDERS_API] Email trigger notice:", e)
        }

        return NextResponse.json({ 
            success: true, 
            orderId: order.id, 
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            items: verifiedItems 
        }, { status: 201 })

    } catch (error: any) {
        console.error("[ORDERS_API] Fatal order processing error:", error)
        return NextResponse.json({ 
            error: error.message || "Failed to process order" 
        }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const email = searchParams.get("email")
        const userId = searchParams.get("userId")

        let query = supabaseAdmin
            .from('Order')
            .select('*, items:OrderItem(*)')
            .order('createdAt', { ascending: false })

        if (userId && userId !== "undefined" && userId !== "null") {
            query = query.eq('userId', userId)
        } else if (email && email !== "undefined" && email !== "null") {
            query = query.ilike('customerEmail', email)
        }

        const { data: orders, error } = await query

        if (error) throw error

        return NextResponse.json(orders || [])
    } catch (error: any) {
        console.error("[ORDERS_API] Fetch error:", error)
        return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 })
    }
}
