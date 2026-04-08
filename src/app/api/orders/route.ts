import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        let { items, promoCode, userId, customerName, customerEmail, customerPhone, address, city, area, deliveryFee, paymentMethod, notes } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in order" }, { status: 400 })
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. Inventory updates will likely fail due to RLS policies.")
        }

        const orderNumber = `SH-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`

        // 1. Fetch & Verify Products (with Active Variants)
        const productIds = items.map((i: any) => i.productId)
        const { data: products, error: productsError } = await supabaseAdmin
            .from('Product')
            .select('*, variants:ProductVariant(*)')
            .in('id', productIds)

        if (productsError) throw productsError

        const verifiedItems = []
        let subtotal = 0

        for (const item of items) {
            // Re-fetch FRESH data for each item to prevent stale overrides in multi-item orders
            const { data: product, error: freshErr } = await supabaseAdmin
                .from('Product')
                .select('*, variants:ProductVariant(*)')
                .eq('id', item.productId)
                .maybeSingle()

            if (!product || freshErr) throw new Error(`Product ${item.id} not found or unavailable`)
            
            const itemPrice = item.price || product.price
            const itemName = item.name || product.name
            const originalPrice = item.originalPrice || product.price

            // Prepare for pool-aware updates
            let pSpecs = typeof product.specs === 'string' ? JSON.parse(product.specs || '{}') : (product.specs || {})
            const pColors = pSpecs.productColors || []
            let matchedVariantId = null

            // 1. Validate & Deduct specifically for Variants
            if (item.ram || item.storage) {
                const variant = (product.variants || []).find((v: any) => 
                    String(v.ram) === String(item.ram) && String(v.storage) === String(item.storage)
                )
                if (!variant) throw new Error(`Specific configuration (${item.ram}/${item.storage}) not available`)
                matchedVariantId = variant.id

                if (item.color) {
                    let vColors = typeof variant.productColors === 'string' ? JSON.parse(variant.productColors || '[]') : (variant.productColors || [])
                    const vcIdx = vColors.findIndex((c: any) => String(c.color || '').toLowerCase() === String(item.color || '').toLowerCase())
                    
                    if (vcIdx < 0) throw new Error(`Color ${item.color} not available for this variant`)
                    const vStock = parseInt(vColors[vcIdx].stock) || 0
                    if (vStock < item.quantity) throw new Error(`Only ${vStock} units of ${item.color} available for this model`)

                    // Deduct from Variant Stock
                    vColors[vcIdx].stock = String(vStock - item.quantity)
                    
                    // Deduct from Master Color Pool in Specs
                    const poolIdx = pColors.findIndex((c: any) => String(c.color || '').toLowerCase() === String(item.color || '').toLowerCase())
                    if (poolIdx >= 0) {
                        const poolStock = parseInt(pColors[poolIdx].stock) || 0
                        pColors[poolIdx].stock = String(Math.max(0, poolStock - item.quantity))
                    }

                    // Save Variant Update
                    await supabaseAdmin.from('ProductVariant').update({ productColors: JSON.stringify(vColors) }).eq('id', variant.id)
                } else {
                    // Standard Variant (no colors)
                    const vStock = parseInt(variant.stock) || 0
                    if (vStock < item.quantity) throw new Error(`Insufficient stock for ${item.ram}/${item.storage}`)
                    await supabaseAdmin.from('ProductVariant').update({ stock: vStock - item.quantity }).eq('id', variant.id)
                }
            } else if (item.color) {
                // 2. Validate & Deduct for Base Color Model
                const poolIdx = pColors.findIndex((c: any) => String(c.color || '').toLowerCase() === String(item.color || '').toLowerCase())
                if (poolIdx < 0) throw new Error(`Color ${item.color} not available`)

                const totalPool = parseInt(pColors[poolIdx].stock) || 0
                
                // Calculate current allocation to all variants of this color
                let currentAllocation = 0
                product.variants?.forEach((v: any) => {
                    const vcs = typeof v.productColors === 'string' ? JSON.parse(v.productColors || '[]') : (v.productColors || [])
                    const vc = vcs.find((c: any) => String(c.color || '').toLowerCase() === String(item.color || '').toLowerCase())
                    if (vc) currentAllocation += (parseInt(vc.stock) || 0)
                })

                const baseRemainder = totalPool - currentAllocation
                if (baseRemainder < item.quantity) {
                    throw new Error(`Only ${baseRemainder} units of ${item.color} available for the base model.`)
                }

                // Deduct from Master Pool
                pColors[poolIdx].stock = String(totalPool - item.quantity)
            } else {
                // 3. Simple Standard Product (no variants, no colors)
                if ((product.stock || 0) < item.quantity) throw new Error(`Only ${product.stock} units available`)
            }

            // Sync Master Specs if updated
            pSpecs.productColors = pColors
            
            // Recalculate Global Product Stock (Sum of Pools)
            const finalProductStock = pColors.length > 0 
                ? pColors.reduce((acc: number, c: any) => acc + (parseInt(c.stock) || 0), 0)
                : (product.stock || 0) - item.quantity

            await supabaseAdmin.from('Product').update({ 
                specs: JSON.stringify(pSpecs),
                stock: Math.max(0, finalProductStock)
            }).eq('id', product.id)

            verifiedItems.push({
                productId: product.id,
                variantId: matchedVariantId,
                color: item.color || null,
                name: itemName,
                quantity: item.quantity,
                price: itemPrice,
                originalPrice: originalPrice,
                image: item.image || product.image
            })

            subtotal += itemPrice * item.quantity
        }

        const total = subtotal 

        // 3. Save Order
        const now = new Date().toISOString()
        const { data: order, error: orderError } = await supabaseAdmin
            .from('Order')
            .insert({
                id: crypto.randomUUID(),
                orderNumber,
                userId: userId || null,
                customerName,
                customerEmail,
                customerPhone,
                address,
                city,
                area: area || null,
                deliveryFee: deliveryFee || 0,
                totalAmount: total,
                paymentMethod,
                paymentStatus: "Pending", 
                transactionCode: body.transactionCode || null,
                notes: notes || null,
                status: "Processing", 
                createdAt: now,
                updatedAt: now
            })
            .select()
            .single()

        if (orderError) throw orderError

        // 4. Save Order Items
        const { error: itemsError } = await supabaseAdmin
            .from('OrderItem')
            .insert(verifiedItems.map(vi => ({
                id: crypto.randomUUID(),
                orderId: order.id,
                productId: vi.productId,
                variantId: vi.variantId,
                color: vi.color,
                name: vi.name,
                quantity: vi.quantity,
                price: vi.price,
                originalPrice: vi.originalPrice || vi.price,
                image: vi.image
            })))

        if (itemsError) throw itemsError

        return NextResponse.json({ ...order, items: verifiedItems })
    } catch (error: any) {
        console.error("Supabase Order Creation Error:", error)
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
        
        console.log(`Supabase: Fetching orders for User: ${userId || 'N/A'}, Email: ${email || 'N/A'}`)

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
        console.error("Supabase Order Fetch Failure:", error)
        return NextResponse.json({ 
            error: "Failed to fetch orders",
            details: error.message
        }, { status: 500 })
    }
}

