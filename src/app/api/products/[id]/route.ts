import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Helper: safely parse specs and images JSON strings back to objects
function parseProduct(product: any, promotions: any[] = []) {
    if (!product) return null
    
    let parsedSpecs = {}
    if (typeof product.specs === "string" && product.specs.length > 2) {
        try { parsedSpecs = JSON.parse(product.specs) } catch { parsedSpecs = {} }
    } else {
        parsedSpecs = product.specs || {}
    }

    let parsedImages = []
    const rawGallery = product.galleryImages || product.images // Support both for transition
    if (typeof rawGallery === "string" && rawGallery.length > 2) {
        try { parsedImages = JSON.parse(rawGallery) } catch { parsedImages = [] }
    } else {
        parsedImages = Array.isArray(rawGallery) ? rawGallery : []
    }

    const finalImages = (Array.isArray(parsedImages) && parsedImages.length > 0) ? parsedImages : (product.image ? [product.image] : [])
    
    const rawCat = (product.category || "Smartphones").trim()
    const normalizedCategory = rawCat.toLowerCase().includes("phone") ? "Smartphones" : (rawCat.charAt(0).toUpperCase() + rawCat.slice(1))

    // Parse Variants
    const enrichedVariants = (product.variants || []).map((v: any) => {
        let vImages = []
        if (typeof v.images === "string") {
            try { vImages = JSON.parse(v.images) } catch { vImages = [] }
        } else { vImages = v.images || [] }

        let vColors = []
        if (typeof v.productColors === "string") {
            try { vColors = JSON.parse(v.productColors) } catch { vColors = [] }
        } else { vColors = v.productColors || [] }

        let vFields = []
        if (typeof v.customFields === "string") {
            try { vFields = JSON.parse(v.customFields) } catch { vFields = [] }
        } else { vFields = v.customFields || [] }

        return {
            ...v,
            images: Array.isArray(vImages) ? vImages : [],
            productColors: Array.isArray(vColors) ? vColors : [],
            customFields: Array.isArray(vFields) ? vFields : []
        }
    })

    const productPromos = (promotions || []).filter(p => {
        // Only include promotions that explicitly target this product ID
        return (p.products || []).some((link: any) => String(link.productId) === String(product.id)) || String(product.id) === String(p.productId)
    }).map(p => {
        // Extract product-specific stock values from the junction link
        const link = (p.products || []).find((l: any) => String(l.productId) === String(product.id))
        return {
            ...p,
            saleStock: link?.saleStock !== undefined && link?.saleStock !== null ? link.saleStock : p.saleStock,
            soldInPromo: link?.soldInPromo !== undefined && link?.soldInPromo !== null ? link.soldInPromo : p.soldInPromo,
            discount: p.value || p.discount,
            productId: product.id 
        }
    })

    return {
        ...product,
        name: (product.name || "").trim(),
        price: Number(product.price || 0),
        category: normalizedCategory,
        brand: (product.brand || "").trim(),
        specs: parsedSpecs,
        images: finalImages,
        variants: enrichedVariants,
        promotions: productPromos,
        traditionalSpecs: { ...parsedSpecs }
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        console.log(`Supabase: Resolving product for ID: "${id}"`)

        // Strategy: Use UUID if it matches pattern, otherwise treat as slug/name
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || id.length > 30
        
        let query = supabaseAdmin
            .from('Product')
            .select('*, variants:ProductVariant(*)')
        
        if (isUUID) {
            query = query.eq('id', id)
        } else {
            // SLUG RESOLUTION (CLEAN MATCHING)
            // Replace dashes back to spaces and attempt a targeted name match
            const searchPattern = id.split('-').join(' ')
            query = query.or(`name.ilike.${searchPattern}, name.ilike.${searchPattern} %`) // Handle trailing spaces or prefixes
        }

        const { data: product, error: productError } = await query.maybeSingle()

        if (productError || !product) {
            console.log(`Supabase: Failure to resolve product "${id}".`)
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        // 2. Fetch Active Promotions (Syncing with Indefinite Campaigns)
        const nowStr = new Date().toISOString()
        const { data: cloudPromos } = await supabaseAdmin
            .from('Promotion')
            .select('*, products:PromotionProduct(productId, saleStock, soldInPromo)')
            .eq('isActive', true)
            .lte('startDate', nowStr)

        const activePromos = (cloudPromos || []).filter(p => !p.endDate || new Date(p.endDate) >= new Date())

        const enrichedProduct = parseProduct(product, activePromos || [])

        // 3. Fetch Related Products
        const { data: relatedProducts } = await supabaseAdmin
            .from('Product')
            .select('*, variants:ProductVariant(*)')
            .eq('category', product.category)
            .neq('id', product.id)
            .limit(4)

        const enrichedRelated = (relatedProducts || []).map(p => parseProduct(p, cloudPromos || []))
        
        return NextResponse.json({
            ...enrichedProduct,
            relatedProducts: enrichedRelated
        })
    } catch (error: any) {
        console.error("Supabase Database Sync Failure:", error)
        return NextResponse.json({ 
            error: "Database Error: Failed to resolve product data",
            details: error.message 
        }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    let body: any = {}
    try {
        body = await req.json()
        const { variants, specs, images, ...updateData } = body

        // 1. Explicitly select valid database columns to avoid SQL errors from extra fields
        const validUpdateData = {
            name: updateData.name,
            description: updateData.detailedDescription || updateData.description || "",
            quickDescription: updateData.quickDescription,
            price: parseFloat(updateData.price) || 0,
            stock: parseInt(updateData.stock) || 0,
            image: updateData.image,
            category: updateData.category,
            brand: updateData.brand,
            sku: updateData.sku,
            condition: updateData.condition,
            isNew: !!updateData.isNew,
            id: id,
            isSale: !!updateData.isSale || !!updateData.discountPrice || !!updateData.discountPercent,
            discount: updateData.discountPercent ? Number(updateData.discountPercent) : (updateData.discountPrice ? Math.round(((Number(updateData.price) - Number(updateData.discountPrice)) / Number(updateData.price)) * 100) : null),
            isFeatured: !!updateData.isFeatured,
            specs: specs ? JSON.stringify(specs) : undefined,
            galleryImages: images ? JSON.stringify(images) : undefined,
        }

        const { error: productError } = await supabaseAdmin
            .from('Product')
            .update(validUpdateData)
            .eq('id', id)

        if (productError) throw productError

        // 2. Update Variants using resilient Upsert logic
        if (variants !== undefined) {
             const variantsToUpsert = variants.map((v: any) => ({
                 id: (v.id && !v.id.startsWith('new_')) ? v.id : crypto.randomUUID(),
                 productId: id,
                 ram: v.ram || "",
                 storage: v.storage || "",
                 color: "", 
                 price: v.price ? parseFloat(v.price) : null,
                 productColors: JSON.stringify(v.productColors || []),
                 customFields: JSON.stringify(v.customFields || []),
                 images: JSON.stringify([]) 
             }))

             if (variantsToUpsert.length > 0) {
                 const { error: variantsError } = await supabaseAdmin
                    .from('ProductVariant')
                    .upsert(variantsToUpsert, { onConflict: 'id' })

                 if (variantsError) {
                     console.error("Supabase: Variant synchronization warning:", variantsError.message);
                 }
             }
        }

        return NextResponse.json({ message: "Product record updated" })
    } catch (error: any) {
        try { require('fs').appendFileSync('tmp/api_trace.log', `\n[PATCH ERROR ${new Date().toISOString()}] ${id}: ${error.stack || error.message}\nPAYLOAD: ${JSON.stringify(body || {}, null, 2)}\n`) } catch {}
        console.error("Supabase Database Update Failure:", error)
        return NextResponse.json({ error: "Update failed", details: error.message }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const { error } = await supabaseAdmin.from('Product').delete().eq('id', id)
        if (error) throw error
        
        return NextResponse.json({ message: "Product removed from database" })
    } catch (error: any) {
        console.error("Supabase Database Deletion Failure:", error)
        return NextResponse.json({ error: "Delete failed", details: error.message }, { status: 500 })
    }
}
