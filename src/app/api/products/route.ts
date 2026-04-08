import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
export const dynamic = "force-dynamic"

// Helper: safely parse specs and images JSON strings back to objects
function parseProduct(product: any, promotions: any[] = []) {
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

    const finalImages = parsedImages.length > 0 ? parsedImages : (product.image ? [product.image] : [])
    const rawCat = (product.category || "Smartphones").trim()
    const normalizedCategory = rawCat.toLowerCase().includes("phone") ? "Smartphones" : (rawCat.charAt(0).toUpperCase() + rawCat.slice(1))

    // Unified filter across all promotion sources
    const productPromos = promotions.map(p => ({
        ...p,
        discount: p.discount || p.value || 0,
        value: p.discount || p.value || 0,
        saleStock: p.saleStock || null,
        soldInPromo: p.soldInPromo || 0,
        productId: product.id 
    }))

    // Parse Variants deep
    const enrichedVariants = (product.variants || []).map((v: any) => {
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
            productColors: Array.isArray(vColors) ? vColors : [],
            customFields: Array.isArray(vFields) ? vFields : []
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

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const category = searchParams.get("category")
        const limitStr = searchParams.get("limit")
        const showAll = searchParams.get("all") === "true"
        const limit = limitStr ? parseInt(limitStr) : 100

        console.log(`Supabase: Product fetch request - Category: ${category || 'ALL'}, Limit: ${limit}`)
        
        // 1. Fetch Cloud Products from Supabase with Variants
        let query = supabaseAdmin
            .from('Product')
            .select('*, variants:ProductVariant(*)')
            .order('createdAt', { ascending: false })
            .limit(limit)
        
        if (category) {
            query = query.eq('category', category)
        }

        const { data: products, error: productsError } = await query
        
        if (productsError) throw productsError

        // 2. Fetch Active Promotions (Handling Indefinite Campaigns)
        const nowStr = new Date().toISOString()
        const { data: rawPromos } = await supabaseAdmin
            .from('Promotion')
            .select('*, products:PromotionProduct(productId, saleStock, soldInPromo)')
            .eq('isActive', true)
            .lte('startDate', nowStr)

        const activePromotions = (rawPromos || []).filter(p => !p.endDate || new Date(p.endDate) >= new Date())

        // Map promotions to products for high-performance lookup
        const promoMap: Record<string, any[]> = {}
        activePromotions.forEach(p => {
            // Priority 1: Direct Link (Legacy/Singular)
            if (p.productId) {
                if (!promoMap[p.productId]) promoMap[p.productId] = []
                promoMap[p.productId].push(p)
            }
            // Priority 2: Junction Table Links (Modern) - Override stock with link-specific values
            (p.products || []).forEach((l: any) => {
                const productSpecificPromo = {
                    ...p,
                    saleStock: l.saleStock ?? p.saleStock,
                    soldInPromo: l.soldInPromo ?? p.soldInPromo
                }
                if (!promoMap[l.productId]) promoMap[l.productId] = []
                promoMap[l.productId].push(productSpecificPromo)
            })
        })

        const enrichedProducts = (products || []).map((p: any) => {
            const raw = promoMap[p.id] || []
            const uniquePromos = Array.from(new Map(raw.map(item => [item.id, item])).values())
            const parsed = parseProduct(p, uniquePromos)
            return {
                ...parsed,
                price: Math.round(Number(parsed.price || 0))
            }
        })

        const filteredProducts = enrichedProducts.filter((p: any) => {
            if (showAll) return true
            return !p.specs?.identity?.isHidden
        })

        return NextResponse.json(filteredProducts)
    } catch (error: any) {
        console.error("Supabase Database Fetch Failure:", error)
        return NextResponse.json({ 
            error: "Database Error: Failed to fetch product data",
            details: error.message || error 
        }, { status: 500 })
    }
}

export async function POST(req: Request) {
    let body: any = {}
    try {
        body = await req.json()
        const { variants, specs, images, ...productData } = body

        console.log(`Supabase: Initiating new product creation for "${productData.name}"`)
        require('fs').appendFileSync('tmp/api_payload_debug.log', JSON.stringify(productData, null, 2) + '\n');
        console.log("DEBUG: Reloading API context...")

        // 1. Create Product
        // 1. Explicitly select valid database columns to avoid SQL errors from extra fields
        const validProductData: any = {
            id: crypto.randomUUID(),
            name: productData.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            description: productData.description,
            price: Number(productData.price),
            image: productData.image,
            category: productData.category,
            brand: productData.brand,
            stock: Number(productData.stock) || 0,
            isNew: Boolean(productData.isNew),
            isSale: Boolean(productData.isSale) || !!productData.discountPrice || !!productData.discountPercent,
            discount: productData.discountPercent ? Number(productData.discountPercent) : (productData.discountPrice ? Math.round(((Number(productData.price) - Number(productData.discountPrice)) / Number(productData.price)) * 100) : null),
            galleryImages: JSON.stringify(images || []),
            specs: JSON.stringify(specs || {}),
            isFeatured: Boolean(productData.isFeatured),
            sku: productData.sku || null,
            condition: productData.condition || 'New',
            quickDescription: productData.quickDescription || null
        };

        console.log("DEBUG: Sending to Supabase:", JSON.stringify(validProductData, null, 2));
        require('fs').appendFileSync('tmp/valid_product_debug.log', JSON.stringify(validProductData, null, 2) + '\n');

        const { data: product, error: productError } = await supabaseAdmin
            .from('Product')
            .insert(validProductData)
            .select()
            .single()

        if (productError) throw productError

        // 2. Create Variants using the new decentralized architecture
        if (variants && variants.length > 0) {
            const variantsToInsert = variants.map((v: any) => ({
                id: crypto.randomUUID(),
                productId: product.id,
                ram: v.ram || "",
                storage: v.storage || "",
                color: "", // Suppressing legacy column NOT NULL constraint
                price: v.price ? Math.round(parseFloat(v.price)) : null,
                productColors: JSON.stringify(v.productColors || []),
                customFields: JSON.stringify(v.customFields || []),
                images: JSON.stringify([]) 
            }))

            const { error: variantsError } = await supabaseAdmin
                .from('ProductVariant')
                .insert(variantsToInsert)
            
            if (variantsError) {
                console.error("Supabase: Primary variants creation failure:", variantsError)
                // Continue since parent product was created
            }
        }

        return NextResponse.json(parseProduct(product), { status: 201 })
    } catch (error: any) {
        try { require('fs').appendFileSync('tmp/api_trace.log', `\n[POST ERROR ${new Date().toISOString()}]: ${error.stack || error.message}\nPAYLOAD: ${JSON.stringify(body || {}, null, 2)}\n`) } catch {}
        console.error("Supabase Database Creation Failure:", error)
        return NextResponse.json({ 
            error: "Database Error: Product creation failed",
            details: error.message 
        }, { status: 500 })
    }
}

