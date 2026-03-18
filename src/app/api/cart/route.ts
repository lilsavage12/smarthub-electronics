import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

// GET /api/cart - Fetch cart items for user or device
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        let userId = searchParams.get("userId")
        const cookieStore = await cookies()
        const deviceId = cookieStore.get('deviceId')?.value

        if (!userId && !deviceId) {
            return NextResponse.json({ items: [] })
        }

        // 1. Identity Migration Engine (CUID -> UUID Bridge)
        if (userId) {
            let email: string | null = null;
            let cuid: string | null = null;
            let uuid: string | undefined | null = null;

            if (userId.startsWith('cm')) {
                const { data: userData } = await supabaseAdmin.from('User').select('email').eq('id', userId).maybeSingle();
                if (userData?.email) {
                    email = userData.email;
                    cuid = userId;
                    const { data: usersData, error: uError } = await supabaseAdmin.auth.admin.listUsers();
                    if (!uError && usersData?.users) {
                        uuid = usersData.users.find(u => u.email === email)?.id;
                    }
                }
            } else {
                const { data: usersData, error: uError } = await supabaseAdmin.auth.admin.listUsers();
                if (!uError && usersData?.users) {
                    const authUser = usersData.users.find(u => u.id === userId);
                    if (authUser?.email) {
                        email = authUser.email;
                        uuid = userId;
                        const { data: userData } = await supabaseAdmin.from('User').select('id').eq('email', email).maybeSingle();
                        cuid = userData?.id;
                    }
                }
            }

            if (cuid && uuid && cuid !== uuid) {
                await supabaseAdmin.from('CartItem').update({ userId: uuid }).eq('userId', cuid);
                userId = uuid;
            }
        }

        let query = supabase
            .from('CartItem')
            .select('*, product:Product(name, image, price)')

        if (userId) {
            query = query.eq('userId', userId)
        } else {
            query = query.eq('deviceId', deviceId)
        }

        const { data: items, error } = await query.order('createdAt', { ascending: true })
        if (error) throw error

        const productIds = items?.map((i: any) => i.productId) || []
        const nowStr = new Date().toISOString()
        const { data: promotions } = await supabase
            .from('Promotion')
            .select('*, products:PromotionProduct(productId, saleStock, soldInPromo)')
            .eq('isActive', true)
            .lte('startDate', nowStr)
            .gte('endDate', nowStr)

        const formattedItems = (items || []).map((item: any) => {
            const productPromoLink = promotions?.find(promo => 
                promo.products?.some((pp: any) => pp.productId === item.productId)
            )
            
            let finalUnitPrice = item.product?.price || 0
            let bestPromo = null

            if (productPromoLink && item.product) {
                const promoProduct = productPromoLink.products.find((pp: any) => pp.productId === item.productId)
                const saleStock = promoProduct?.saleStock
                const soldInPromo = promoProduct?.soldInPromo || 0
                const remainingPromoStock = saleStock !== null && saleStock !== undefined ? Math.max(0, saleStock - soldInPromo) : Infinity
                const discountedQuantity = Math.min(item.quantity, remainingPromoStock)
                const fullPriceQuantity = Math.max(0, item.quantity - discountedQuantity)
                
                let discountedUnitPrice = item.product.price
                if (productPromoLink.type === 'PERCENTAGE') {
                    discountedUnitPrice = item.product.price * (1 - productPromoLink.value / 100)
                } else {
                    discountedUnitPrice = item.product.price - productPromoLink.value
                }
                discountedUnitPrice = Math.max(0, discountedUnitPrice)

                const totalItemCost = (discountedQuantity * discountedUnitPrice) + (fullPriceQuantity * item.product.price)
                finalUnitPrice = totalItemCost / item.quantity
                
                if (discountedQuantity > 0) {
                    bestPromo = { 
                        title: productPromoLink.title, 
                        category: productPromoLink.category,
                        isLimited: saleStock !== null,
                        remainingStock: remainingPromoStock 
                    }
                }
            }

            return {
                id: item.id,
                productId: item.productId,
                name: item.product?.name,
                price: Number(finalUnitPrice.toFixed(2)),
                originalPrice: item.product?.price,
                quantity: item.quantity,
                image: item.product?.image,
                color: item.color,
                storage: item.storage,
                promotion: bestPromo
            }
        })

        return NextResponse.json({ items: formattedItems })
    } catch (error) {
        console.error("Cart Fetch Error:", error)
        return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
    }
}

// POST /api/cart - Add or Update item
export async function POST(req: Request) {
    try {
        const body = await req.json()
        let { productId, quantity, priceSnapshot, color, storage, userId } = body

        // Bridge CUID to UUID
        if (userId && userId.startsWith('cm')) {
            const { data: userData } = await supabaseAdmin.from('User').select('email').eq('id', userId).maybeSingle();
            if (userData?.email) {
                const { data: usersData, error: uError } = await supabaseAdmin.auth.admin.listUsers();
                if (!uError && usersData?.users) {
                    const au = usersData.users.find(u => u.email === userData.email);
                    if (au) userId = au.id;
                }
            }
        }
        const cookieStore = await cookies()
        const deviceId = cookieStore.get('deviceId')?.value

        if (!userId && !deviceId) {
            return NextResponse.json({ error: "Identification required" }, { status: 400 })
        }

        // 1. Fetch current product and active promos
        const { data: product, error: pError } = await supabase.from('Product').select('stock, price').eq('id', productId).single();
        if (pError || !product) throw new Error("Product not found");

        const nowCount = new Date().toISOString();
        const { data: activePromo } = await supabase
            .from('Promotion')
            .select('*, products:PromotionProduct(*)')
            .eq('isActive', true).lte('startDate', nowCount).gte('endDate', nowCount)
            .filter('products.productId', 'eq', productId).maybeSingle();

        // 2. Validate against Sale Stock if applicable
        if (activePromo && activePromo.products?.[0]?.saleStock !== null) {
            const lp = activePromo.products[0];
            const remaining = Math.max(0, lp.saleStock - (lp.soldInPromo || 0));
            if (quantity > remaining) {
                return NextResponse.json({ 
                    error: `Only ${remaining} items available at this discounted price.`, 
                    available: remaining 
                }, { status: 400 });
            }
        }

        // Check if item already exists in cart
        let existingQuery = supabase
            .from('CartItem')
            .select('*')
            .eq('productId', productId)
            .eq('color', color || null)
            .eq('storage', storage || null)

        if (userId) {
            existingQuery = existingQuery.eq('userId', userId)
        } else {
            existingQuery = existingQuery.eq('deviceId', deviceId).is('userId', null)
        }

        const { data: existingItems, error: fetchError } = await existingQuery

        if (fetchError) throw fetchError

        if (existingItems && existingItems.length > 0) {
            const existingItem = existingItems[0]
            const totalRequested = (existingItem.quantity || 0) + (quantity || 1)
            
            if (totalRequested > product.stock) {
                return NextResponse.json({ 
                    error: `Only ${product.stock} items available. You already have ${existingItem.quantity} in your cart.`,
                    available: product.stock 
                }, { status: 400 })
            }

            const { data: updated, error: updateError } = await supabaseAdmin
                .from('CartItem')
                .update({ 
                    quantity: totalRequested,
                    priceSnapshot: priceSnapshot || existingItem.priceSnapshot,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', existingItem.id)
                .select()
                .single()

            if (updateError) throw updateError
            return NextResponse.json(updated)
        }

        // New Item Stock Check
        if ((quantity || 1) > product.stock) {
             return NextResponse.json({ 
                error: `Only ${product.stock} items available in stock.`,
                available: product.stock 
            }, { status: 400 })
        }

        const { data: newItem, error: createError } = await supabaseAdmin
            .from('CartItem')
            .insert([{
                userId: userId || null,
                deviceId: userId ? null : deviceId,
                productId,
                quantity: quantity || 1,
                priceSnapshot,
                color,
                storage,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }])
            .select()
            .single()

        if (createError) throw createError
        return NextResponse.json(newItem)
    } catch (error) {
        console.error("Cart Add Error:", error)
        return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
    }
}

// PATCH /api/cart - Update quantity
export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { id, quantity } = body

        if (!id) return NextResponse.json({ error: "Item ID required" }, { status: 400 })

        if (quantity <= 0) {
            const { error: deleteError } = await supabase.from('CartItem').delete().eq('id', id)
            if (deleteError) throw deleteError
            return NextResponse.json({ success: true, removed: true })
        }

        // Fetch CartItem to get productId
        const { data: cartItem, error: ciError } = await supabase
            .from('CartItem')
            .select('productId')
            .eq('id', id)
            .single()
        
        if (ciError || !cartItem) throw new Error("Cart item not found")

        // Fetch Product to get current stock
        const { data: product, error: pError } = await supabase
            .from('Product')
            .select('stock')
            .eq('id', cartItem.productId)
            .single()
        
        if (pError || !product) throw new Error("Product not found")

        if (quantity > product.stock) {
            return NextResponse.json({ 
                error: `Only ${product.stock} items available.`,
                available: product.stock 
            }, { status: 400 })
        }

        const { data: updated, error: updateError } = await supabaseAdmin
            .from('CartItem')
            .update({ quantity, updatedAt: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (updateError) throw updateError
        return NextResponse.json(updated)
    } catch (error) {
        console.error("Cart Update Error:", error)
        return NextResponse.json({ error: "Failed to update cart" }, { status: 500 })
    }
}

// DELETE /api/cart - Remove item or clear cart
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        const userId = searchParams.get("userId")
        const cookieStore = await cookies()
        const deviceId = cookieStore.get('deviceId')?.value

        if (id) {
            const { error: deleteError } = await supabase.from('CartItem').delete().eq('id', id)
            if (deleteError) throw deleteError
            return NextResponse.json({ success: true })
        }

        let deleteQuery = supabaseAdmin.from('CartItem').delete()
        if (userId) {
            deleteQuery = deleteQuery.eq('userId', userId)
        } else if (deviceId) {
            deleteQuery = deleteQuery.eq('deviceId', deviceId)
        }

        const { error: clearError } = await deleteQuery
        if (clearError) throw clearError

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Cart Delete Error:", error)
        return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 })
    }
}
