import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

function parseProduct(product: any) {
    if (!product) return null
    return {
        ...product,
        specs: typeof product.specs === "string" ? (() => {
            try { return JSON.parse(product.specs) } catch { return {} }
        })() : (product.specs || {}),
        variants: product.variants?.map((v: any) => ({
            ...v,
            images: typeof v.images === "string" ? (() => {
                try { return JSON.parse(v.images) } catch { return [] }
            })() : (v.images || [])
        })) ?? []
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        // 1. Fetch base product
        const { data: product, error } = await supabase
            .from('Product')
            .select('*, variants:ProductVariant(*)')
            .eq('id', id)
            .single()

        if (error) throw error
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        // 2. Fetch active promotions for this product
        const now = new Date().toISOString()
        const { data: promotions } = await supabase
            .from('Promotion')
            .select('*, products:PromotionProduct(productId, saleStock, soldInPromo)')
            .eq('isActive', true)
            .lte('startDate', now)
            .gte('endDate', now)

        const productPromos = promotions?.filter(promo => {
            const match = promo.products?.some((pp: any) => 
                String(pp.productId).trim().toLowerCase() === String(id).trim().toLowerCase()
            )
            return match
        }).map(promo => {
            const link = promo.products?.find((pp: any) => 
                String(pp.productId).trim().toLowerCase() === String(id).trim().toLowerCase()
            )
            return {
                ...promo,
                saleStock: link?.saleStock,
                soldInPromo: link?.soldInPromo
            }
        }) || []

        console.log(`[API DEBUG] Querying promos for ID: "${id}"`)
        console.log(`[API DEBUG] Found ${productPromos.length} matching promotions out of ${promotions?.length || 0} active ones`)

        const enrichedProduct = {
            ...parseProduct(product),
            promotions: productPromos
        }

        return NextResponse.json(enrichedProduct)
    } catch (error: any) {
        console.error("Supabase Fetch error:", error)
        return NextResponse.json({ error: "Fetch failure", details: error.message }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const body = await req.json()
        const { variants, specs, ...updateData } = body

        // 1. Update main product
        const { data: product, error: productError } = await supabase
            .from('Product')
            .update({
                ...updateData,
                specs: specs !== undefined ? JSON.stringify(specs) : undefined,
                updatedAt: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (productError) throw productError

        // 2. Clear and recreate variants (matching old Prisma behavior)
        if (variants !== undefined) {
            await supabase.from('ProductVariant').delete().eq('productId', id)
            
            if (variants.length > 0) {
                const variantData = variants.map((v: any) => ({
                    productId: id,
                    color: v.color || "",
                    stock: parseInt(v.stock) || 0,
                    price: v.price ? parseFloat(v.price) : null,
                    images: JSON.stringify(Array.isArray(v.images) ? v.images : [])
                }))
                await supabase.from('ProductVariant').insert(variantData)
            }
        }

        const { data: updated, error: fetchError } = await supabase
            .from('Product')
            .select('*, variants:ProductVariant(*)')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        return NextResponse.json(parseProduct(updated))
    } catch (error) {
        console.error("Supabase Update error:", error)
        return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const { error } = await supabase.from('Product').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ message: "Product deleted" })
    } catch (error) {
        console.error("Supabase Deletion error:", error)
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}
