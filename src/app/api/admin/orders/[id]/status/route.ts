import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: orderId } = await params
        const body = await req.json()
        const { status, message, notes, trackingNumber, courier, estimatedDelivery } = body

        if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 })
        }

        // 1. Prepare Update Metadata
        const updateData: any = { 
            status, 
            updatedAt: new Date().toISOString() 
        }
        
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
        if (courier !== undefined) updateData.courier = courier
        if (estimatedDelivery !== undefined) updateData.estimatedDelivery = estimatedDelivery

        // 2. State Check for Inventory Restoration
        const { data: currentOrder, error: fetchError } = await supabaseAdmin
            .from('Order')
            .select('status')
            .eq('id', orderId)
            .maybeSingle()

        if (fetchError) throw fetchError
        if (!currentOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        const normalizedStatus = String(status || "").toLowerCase()
        const currentStatus = String(currentOrder.status || "").toLowerCase()

        const wasDeducted = currentStatus !== "cancelled" && currentStatus !== "returned"
        const isNowCancelled = normalizedStatus === "cancelled" || normalizedStatus === "returned"

        if (isNowCancelled && wasDeducted) {
            console.log(`[Inventory] Order ${orderId} status changed from ${currentStatus} to ${status}. Restoring stock pools...`)
            const { data: items } = await supabaseAdmin.from('OrderItem').select('*').eq('orderId', orderId)
            
            if (items && items.length > 0) {
                // Group items by productId to avoid stale over-writes
                const productGroups: Record<string, any[]> = {}
                items.forEach(item => {
                    if (!productGroups[item.productId]) productGroups[item.productId] = []
                    productGroups[item.productId].push(item)
                })

                for (const productId of Object.keys(productGroups)) {
                    const productItems = productGroups[productId]
                    
                    try {
                        const { data: product } = await supabaseAdmin
                            .from('Product')
                            .select('*, variants:ProductVariant(*)')
                            .eq('id', productId)
                            .maybeSingle()
                        
                        if (!product) continue

                        let pSpecs = typeof product.specs === 'string' ? JSON.parse(product.specs || '{}') : (product.specs || {})
                        const pColors = pSpecs.productColors || []
                        const variantsToUpdate: any[] = []

                        for (const item of productItems) {
                            if (item.variantId) {
                                const variant = product.variants?.find((v: any) => v.id === item.variantId)
                                if (variant) {
                                    let vColors = typeof variant.productColors === 'string' ? JSON.parse(variant.productColors || '[]') : (variant.productColors || [])
                                    
                                    if (item.color) {
                                        const vcIdx = vColors.findIndex((c: any) => String(c.color || '').toLowerCase() === String(item.color || '').toLowerCase())
                                        if (vcIdx >= 0) {
                                            vColors[vcIdx].stock = String((parseInt(vColors[vcIdx].stock) || 0) + item.quantity)
                                            
                                            // Sync Master Pool (Inside same loop context)
                                            const poolIdx = pColors.findIndex((c: any) => String(c.color || '').toLowerCase() === String(item.color || '').toLowerCase())
                                            if (poolIdx >= 0) {
                                                pColors[poolIdx].stock = String((parseInt(pColors[poolIdx].stock) || 0) + item.quantity)
                                            }
                                        }
                                    } else {
                                        variant.stock = (parseInt(variant.stock) || 0) + item.quantity
                                    }
                                    // Track which variants changed
                                    variant.productColors = JSON.stringify(vColors)
                                    variantsToUpdate.push(variant)
                                }
                            } else if (item.color) {
                                const poolIdx = pColors.findIndex((c: any) => String(c.color || '').toLowerCase() === String(item.color || '').toLowerCase())
                                if (poolIdx >= 0) {
                                    pColors[poolIdx].stock = String((parseInt(pColors[poolIdx].stock) || 0) + item.quantity)
                                }
                            } else {
                                product.stock = (product.stock || 0) + item.quantity
                            }
                        }

                        // 1. Commit Variant Changes
                        for (const v of variantsToUpdate) {
                            await supabaseAdmin.from('ProductVariant').update({ 
                                productColors: v.productColors,
                                stock: v.stock 
                            }).eq('id', v.id)
                        }

                        // 2. Commit Global Product Changes (Master Pool Sync)
                        pSpecs.productColors = pColors
                        const finalGlobalStock = pColors.length > 0 
                            ? pColors.reduce((acc: number, c: any) => acc + (parseInt(c.stock) || 0), 0)
                            : (product.stock || 0)

                        await supabaseAdmin.from('Product').update({ 
                            specs: JSON.stringify(pSpecs),
                            stock: finalGlobalStock
                        }).eq('id', product.id)
                        
                        console.log(`[Inventory Success] Product ${productId} pools replenished.`)
                    } catch (restErr) {
                        console.error(`[Inventory Recovery Fail] Product ${productId}:`, restErr)
                    }
                }
            }
        }

        const { error: sbUpdateError } = await supabaseAdmin
            .from('Order')
            .update(updateData)
            .eq('id', orderId)

        if (sbUpdateError) throw sbUpdateError

        // Log to Status History
        await supabaseAdmin.from('OrderStatusHistory').insert({
            orderId,
            status,
            message: message || `Order status updated to ${status}`,
            notes,
            timestamp: new Date().toISOString()
        })

        // 3. Trigger Notifications
        try {
            console.log(`[Notification] Dispatching update for order ${orderId} -> ${status}`)
        } catch (notifierError) {
            console.error("Notification trigger failed:", notifierError)
        }

        return NextResponse.json({ success: true, status })

    } catch (error: any) {
        console.error("Supabase Order Status Update Error:", error)
        return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 })
    }
}

