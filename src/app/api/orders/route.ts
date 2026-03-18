import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        let { items, promoCode, userId, ...orderData } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in order" }, { status: 400 })
        }

        // 0. ID Resilience: Bridge CUID to UUID if necessary
        if (userId && userId.startsWith('cm')) {
            const { data: userData } = await supabaseAdmin.from('User').select('email').eq('id', userId).single();
            if (userData?.email) {
                // Fetch from Auth directly (Service Role needed)
                const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
                const actualUser = users.find(u => u.email === userData.email);
                if (actualUser) userId = actualUser.id;
            }
        }

        const orderNumber = `SH-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`

        // 1. Re-verify prices and stock limits for each item
        const nowStr = new Date().toISOString()
        const productIds = items.map((i: any) => i.productId)
        
        // Fetch base prices
        const { data: baseProducts } = await supabase
            .from('Product')
            .select('id, price')
            .in('id', productIds)

        // Fetch active promos
        const { data: activePromos } = await supabase
            .from('Promotion')
            .select('*, products:PromotionProduct(productId, saleStock, soldInPromo)')
            .eq('isActive', true)
            .lte('startDate', nowStr)
            .gte('endDate', nowStr)

        const verifiedItems = items.map((item: any) => {
            const product = baseProducts?.find(p => p.id === item.productId)
            if (!product) return item // Fallback if missing, but should handle error

            const promoLink = activePromos?.find(p => 
                p.products?.some((pp: any) => pp.productId === item.productId)
            )

            let finalPrice = product.price
            if (promoLink) {
                const promoProduct = promoLink.products.find((pp: any) => pp.productId === item.productId)
                const saleStock = promoProduct?.saleStock
                const soldInPromo = promoProduct?.soldInPromo || 0
                const remaining = saleStock !== null && saleStock !== undefined ? Math.max(0, saleStock - soldInPromo) : Infinity
                
                const discountedQty = Math.min(item.quantity, remaining)
                const fullPriceQty = Math.max(0, item.quantity - discountedQty)
                
                let discountedPrice = product.price
                if (promoLink.type === 'PERCENTAGE') {
                    discountedPrice = product.price * (1 - promoLink.value / 100)
                } else {
                    discountedPrice = product.price - promoLink.value
                }
                
                finalPrice = ((discountedQty * discountedPrice) + (fullPriceQty * product.price)) / item.quantity
            }

            return {
                ...item,
                id: item.productId, // Ensure consistently using productId
                price: Number(finalPrice.toFixed(2))
            }
        })

        // Re-calculate Total for security + Tax
        const itemsSubtotal = verifiedItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)
        const serverTax = itemsSubtotal * 0.08
        const serverTotal = Number((itemsSubtotal + serverTax).toFixed(2))

        // Use the RPC v2 for atomic transaction with promo code support
        const { data, error } = await supabase.rpc('create_order_v2', {
            p_user_id: userId || null,
            p_order_number: orderNumber,
            p_customer_name: orderData.customerName,
            p_customer_email: orderData.customerEmail,
            p_customer_phone: orderData.customerPhone,
            p_address: orderData.address,
            p_city: orderData.city,
            p_total_amount: serverTotal,
            p_payment_method: orderData.paymentMethod,
            p_items: verifiedItems,
            p_promo_code: promoCode || null
        })

        if (error) {
            console.error("RPC Error:", error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        // 3. Post-Order: Increment soldInPromo for items that had active promotions
        // This ensures the global stock limit is enforced even if the RPC didn't do it
        try {
            const promoItems = verifiedItems.filter((i: any) => i.price < i.originalPrice)
            for (const item of promoItems) {
                // Find which promo this belongs to (best active one)
                // Note: ideally we'd pass promoId from the frontend, but we can do a best-match
                const promoLink = activePromos?.find(p => p.products?.some((pp: any) => pp.productId === item.productId))
                if (promoLink) {
                   await supabase.rpc('increment_sold_in_promo', {
                       p_promo_id: promoLink.id,
                       p_product_id: item.productId,
                       p_amount: item.quantity
                   })
                }
            }
        } catch (soldError) {
            console.error("Failed to increment soldInPromo:", soldError)
            // Still return success since the order was created
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Order Creation Error:", error)
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
        const limit = searchParams.get("limit")
        
        // If no specific filters, must be admin to see ALL orders
        if (!email && !userId) {
            if (!(await verifyAdmin(req))) {
                return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
            }
        }

        let query = supabase.from('Order').select('*, items:OrderItem(*)')

        if (email) query = query.eq('customerEmail', email)
        if (userId) query = query.eq('userId', userId)

        if (limit) {
            query = query.limit(parseInt(limit))
        }

        const { data: orders, error } = await query.order('createdAt', { ascending: false })

        if (error) throw error

        return NextResponse.json(orders)
    } catch (error) {
        console.error("Supabase Order Fetch Error:", error)
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }
}
