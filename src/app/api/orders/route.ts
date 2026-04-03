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
            const product = products.find(p => p.id === item.productId)
            if (!product) throw new Error(`Product ${item.productId} not found`)
            
            // Capture the specific variant name and price from the request
            const itemPrice = item.price || product.price
            const itemName = item.name || product.name
            const originalPrice = item.originalPrice || product.price

            // STOCK DEDUCTION LOGIC
            // 1. Deduct from base product regardless (global availability)
            const newProductStock = (product.stock || 0) - item.quantity
            console.log(`Inventory: Deducting ${item.quantity} from Base Product ${product.id} stock (${product.stock} -> ${newProductStock})`)
            
            const { error: stockError } = await supabaseAdmin
                .from('Product')
                .update({ stock: Math.max(0, newProductStock) })
                .eq('id', product.id)
            
            if (stockError) {
                console.error(`Inventory: Base stock update error for ${product.id}:`, stockError)
                // Continue though, try to update variants
            }

            let matchedVariantId = null
            
            // 2. Identify and Deduct from Variant Stock
            // Use storage and ram to find the variant
            if (item.ram || item.storage) {
                const variant = (product.variants || []).find((v: any) => 
                    String(v.ram) === String(item.ram) && String(v.storage) === String(item.storage)
                )
                if (variant) {
                    matchedVariantId = variant.id
                    // Deduct from variant colors if color provided
                    if (item.color) {
                        let vColors = []
                        try { vColors = typeof variant.productColors === 'string' ? JSON.parse(variant.productColors) : (variant.productColors || []) } catch { vColors = [] }
                        
                        const colorIdx = vColors.findIndex((c: any) => String(c.color || '').toLowerCase() === String(item.color || '').toLowerCase())
                        if (colorIdx >= 0) {
                            const currentStockValue = parseInt(vColors[colorIdx].stock) || 0
                            vColors[colorIdx].stock = Math.max(0, currentStockValue - item.quantity).toString()
                            
                            console.log(`Inventory: Deducting from Variant ${variant.id} - Color ${item.color} (${currentStockValue} -> ${vColors[colorIdx].stock})`)
                            
                            const { error: variantError } = await supabaseAdmin
                                .from('ProductVariant')
                                .update({ productColors: JSON.stringify(vColors) })
                                .eq('id', variant.id)
                            
                            if (variantError) {
                                console.error(`Inventory: Variant stock update error for ${variant.id}:`, variantError)
                                throw new Error(`Failed to update stock for variant ${variant.id}`)
                            }
                        } else {
                            console.warn(`Inventory: Color ${item.color} not found in Variant ${variant.id}`)
                        }
                    }
                } else {
                    console.warn(`Inventory: No variant found matching RAM: ${item.ram}, Storage: ${item.storage} for Product ${product.id}`)
                }
            } else if (item.color) {
                // Deduct from master product colors if no specific RAM/Storage variant
                let pSpecs = product.specs || {}
                if (typeof pSpecs === 'string') try { pSpecs = JSON.parse(pSpecs) } catch { pSpecs = {} }
                
                let pColors = pSpecs.productColors || []
                const colorIdx = pColors.findIndex((c: any) => String(c.color || '').toLowerCase() === String(item.color || '').toLowerCase())
                if (colorIdx >= 0) {
                    const currentStockValue = parseInt(pColors[colorIdx].stock) || 0
                    pColors[colorIdx].stock = Math.max(0, currentStockValue - item.quantity).toString()
                    pSpecs.productColors = pColors
                    
                    console.log(`Inventory: Deducting from Master Specs - Color ${item.color} (${currentStockValue} -> ${pColors[colorIdx].stock})`)
                    
                    const { error: specsError } = await supabaseAdmin
                        .from('Product')
                        .update({ specs: JSON.stringify(pSpecs) })
                        .eq('id', product.id)
                    
                    if (specsError) console.error(`Inventory: Master specs update error for ${product.id}:`, specsError)
                }
            }

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

