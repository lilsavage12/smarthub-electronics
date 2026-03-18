import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

// Helper: safely parse specs JSON string back to object if needed
function parseProduct(product: any) {
    const parsedSpecs = typeof product.specs === "string" ? (() => {
        try { return JSON.parse(product.specs) } catch { return {} }
    })() : (product.specs || {});

    // Category Normalization (Standardize 'smartphone' to 'Smartphones')
    const rawCat = (product.category || "Smartphones").trim();
    const normalizedCategory = rawCat.toLowerCase().includes("phone") ? "Smartphones" : (rawCat.charAt(0).toUpperCase() + rawCat.slice(1));

    return {
        ...product,
        name: (product.name || "").trim(),
        price: Number(product.price || 0),
        category: normalizedCategory,
        brand: (product.brand || "").trim(),
        specs: parsedSpecs,
        variants: product.variants?.map((v: any) => ({
            ...v,
            images: typeof v.images === "string" ? (() => {
                try { return JSON.parse(v.images) } catch { return [] }
            })() : (v.images || [])
        })) ?? [],
        // Data Normalization for filters
        traditionalSpecs: {
            ...(parsedSpecs?.identity || {}),
            ...(parsedSpecs?.display || {}),
            ...(parsedSpecs?.performance || {}),
            ...(parsedSpecs?.camera || {}),
            ...(parsedSpecs?.battery || {}),
            ...(parsedSpecs?.connectivity || {}),
            ...(parsedSpecs?.physical || {}),
            ...parsedSpecs // Fallback for already flat specs
        }
    }
}

export async function GET() {
    try {
        // 1. Fetch base products
        const { data: products, error } = await supabase
            .from('Product')
            .select('*, variants:ProductVariant(*)')
            .order('createdAt', { ascending: false })

        if (error) throw error

        // 2. Fetch active promotions
        const now = new Date().toISOString()
        const { data: promotions, error: promoError } = await supabase
            .from('Promotion')
            .select('*, products:PromotionProduct(productId, saleStock, soldInPromo)')
            .eq('isActive', true)
            .lte('startDate', now)
            .gte('endDate', now)

        if (promoError) {
            console.warn("Promotion fetch failed, continuing without promos:", promoError)
        }

        // 3. Enrich products with their promos
        const enrichedProducts = products.map((p: any) => {
            const parsed = parseProduct(p)
            const productPromos = promotions?.filter(promo => 
                promo.products?.some((pp: any) => pp.productId === p.id)
            ).map(promo => {
                const link = promo.products?.find((pp: any) => pp.productId === p.id)
                
                // Normalization for Home Dashboard Display
                let category = promo.category || "";
                if (category.toLowerCase().includes("flash")) category = "FLASH_SALE";
                else if (category.toLowerCase().includes("deal") || category.toLowerCase().includes("daily")) category = "DAILY_DEAL";

                return {
                    ...promo,
                    category,
                    saleStock: link?.saleStock,
                    soldInPromo: link?.soldInPromo
                }
            }) || []
            return {
                ...parsed,
                promotions: productPromos
            }
        })

        return NextResponse.json(enrichedProducts)
    } catch (error: any) {
        console.error("Detailed API Error:", error)
        return NextResponse.json({ 
            error: "Failed to fetch products",
            details: error.message || error 
        }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const body = await req.json()
        const { variants, specs, ...productData } = body

        // Generate a unique ID if not provided (slug-like)
        const slug = `${productData.brand}-${body.model || 'product'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const id = `${slug}-${Math.random().toString(36).substring(2, 7)}`

        // 1. Create Product
        const { data: product, error: productError } = await supabase
            .from('Product')
            .insert([{
                id,
                ...productData,
                name: `${productData.brand} ${body.model || ''}`.trim(),
                specs: specs ? JSON.stringify(specs) : null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }])
            .select()
            .single()

        if (productError) throw productError

        // 2. Create Variants if any
        if (variants && variants.length > 0) {
            const variantData = variants.map((v: any) => ({
                productId: product.id,
                color: v.color || "",
                stock: parseInt(v.stock) || 0,
                price: v.price ? parseFloat(v.price) : null,
                images: JSON.stringify(Array.isArray(v.images) ? v.images : [])
            }))

            const { error: variantError } = await supabase
                .from('ProductVariant')
                .insert(variantData)

            if (variantError) throw variantError
        }

        // Fetch again to include variants
        const { data: completeProduct, error: fetchError } = await supabase
            .from('Product')
            .select('*, variants:ProductVariant(*)')
            .eq('id', product.id)
            .single()

        if (fetchError) throw fetchError

        return NextResponse.json(parseProduct(completeProduct))
    } catch (error) {
        console.error("Supabase Create Error:", error)
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }
}
