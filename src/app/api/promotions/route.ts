import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function POST(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const body = await req.json()
        const { 
            name, title, type, value, discount, category, startDate, endDate, 
            productId, productIds, isActive, priority, saleStock, description, showOnHome, isExclusive
        } = body

        // Resolve targeting - Support both singular legacy and modern array-based links
        const targetIds = Array.isArray(productIds) ? productIds : (productId ? [productId] : [])
        
        if (targetIds.length === 0) {
            return NextResponse.json({ error: "At least one product is required for this promotion." }, { status: 400 })
        }

        const promoPayload = {
            productId: String(targetIds[0]), // Legacy support for main column
            title: title || name || "Unnamed Promotion",
            description: description || null,
            value: Math.floor(Number(discount || value || 10)),
            type: type || "PERCENTAGE",
            category: category || "REGULAR",
            startDate: new Date(startDate || Date.now()).toISOString(),
            endDate: endDate ? new Date(endDate).toISOString() : null,
            isActive: isActive !== undefined ? isActive : true,
            priority: Math.floor(Number(priority || 0)),
            saleStock: (saleStock !== undefined && saleStock !== null && saleStock !== "") ? Math.floor(Number(saleStock)) : null,
            showOnHome: showOnHome !== undefined ? showOnHome : true,
            isExclusive: isExclusive !== undefined ? isExclusive : false
        }

        const { data: promotion, error } = await supabaseAdmin
            .from('Promotion')
            .insert(promoPayload)
            .select()
            .single()
        
        if (error) {
            console.error("Supabase Promotion Insert error:", error)
            throw error
        }

        // Link all selected products in the junction table
        if (targetIds.length > 0) {
            const links = targetIds.map(pid => ({
                promotionId: promotion.id,
                productId: String(pid),
                saleStock: promoPayload.saleStock
            }))
            const { error: linkError } = await supabaseAdmin.from('PromotionProduct').insert(links)
            if (linkError) {
                console.error("Supabase PromotionProduct Insert error:", linkError)
                throw linkError
            }
        }
        
        return NextResponse.json(promotion)

    } catch (error: any) {
        console.error("Supabase Promotion creation error DETAIL:", error)
        return NextResponse.json({ 
            error: "Failed to create promotion", 
            details: error.message || "Something went wrong",
            code: error.code
        }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')
        const activeOnly = searchParams.get('activeOnly')

        // 1. Fetch Cloud Promotions from Supabase (Resilient Select)
        let queryBuilder = supabaseAdmin
            .from('Promotion')
            .select('*')
            .order('priority', { ascending: false })
            .order('createdAt', { ascending: false })

        if (category) queryBuilder = queryBuilder.eq('category', category)
        if (activeOnly === 'true') queryBuilder = queryBuilder.eq('isActive', true)

        const { data: promotions, error } = await queryBuilder
        if (error) throw error

        // 2. Fetch Product Links (Safe separate call)
        const { data: links } = await supabaseAdmin.from('PromotionProduct').select('*')
        const linkMap = new Map()
        links?.forEach((l: any) => {
            if (!linkMap.has(l.promotionId)) linkMap.set(l.promotionId, [])
            linkMap.get(l.promotionId).push(l)
        })

        // 3. Fetch Product Metadata
        const productIds: string[] = Array.from(new Set([
            ...(links?.map((l: any) => l.productId) || []),
            ...(promotions?.map((p: any) => p.productId).filter(Boolean) || [])
        ]))
        
        const { data: productMeta } = await supabaseAdmin
            .from('Product')
            .select('id, name, image, price')
            .in('id', productIds)

        const productMetaMap = new Map((productMeta as any[])?.map(p => [p.id, p]) || [])

        // 4. Enrich & Normalize (title -> name, value -> discount)
        const enrichedPromotions = (promotions || []).map((promo: any) => {
            const promoLinks = linkMap.get(promo.id) || []
            const enrichedProducts = promoLinks.map((pp: any) => {
                const lp = productMetaMap.get(pp.productId)
                return {
                    ...pp,
                    name: lp?.name || "Product",
                    image: lp?.image || null,
                    price: lp?.price || 0
                }
            })
            
            // Legacy link check
            if (promo.productId && !enrichedProducts.some((p: any) => p.productId === promo.productId)) {
                const lp = productMetaMap.get(promo.productId)
                if (lp) enrichedProducts.push({ productId: promo.productId, name: lp.name, image: lp.image, price: lp.price })
            }

            return {
                ...promo,
                name: promo.name || promo.title || "Unnamed Promotion",
                discount: promo.discount || promo.value || 0,
                products: enrichedProducts,
                product: enrichedProducts[0] || null
            }
        })

        return NextResponse.json(enrichedPromotions)

    } catch (error: any) {
        console.error("Supabase Promotion load failure DETAIL:", error)
        return NextResponse.json({ 
            error: "Failed to load promotions",
            details: error.message 
        }, { status: 500 })
    }
}
