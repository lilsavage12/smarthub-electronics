import React from "react"
import { supabaseAdmin } from "@/lib/supabase"
import { ClientHome } from "@/components/home/ClientHome"
import fallbackProducts from "@/lib/fallback-products.json"

export const dynamic = "force-dynamic"

export default async function Home() {
    try {
        const [
            { data: products },
            { data: settings },
            { data: banners },
            { data: categories },
            { data: brands },
            { data: promos },
            { data: hpMatrixConfig }
        ] = await Promise.all([
            supabaseAdmin.from('Product').select('*, variants:ProductVariant(*)').order('createdAt', { ascending: false }).limit(100),
            supabaseAdmin.from('HomepageSettings').select('*').eq('id', 'singleton').maybeSingle(),
            supabaseAdmin.from('HeroSlide').select('*').order('order', { ascending: true }),
            supabaseAdmin.from('HomepageCategory').select('*').eq('isActive', true).order('order', { ascending: true }),
            supabaseAdmin.from('BrandLogo').select('*').eq('isActive', true).order('order', { ascending: true }),
            supabaseAdmin.from('Promotion').select('*, products:PromotionProduct(*)').eq('isActive', true).lte('startDate', new Date().toISOString()),
            supabaseAdmin.from('HomepageSettings').select('*').eq('id', 'hp-matrix').maybeSingle()
        ])

        // Parse hpConfig
        let hpConfig = {
            newArrivals: { visible: true, order: 1, title: "NEW ARRIVALS" },
            featured: { visible: true, order: 2, title: "BEST SELLERS" },
            dynamicSections: []
        }
        try {
            if (hpMatrixConfig?.contactInfo) {
                hpConfig = JSON.parse(hpMatrixConfig.contactInfo)
            }
        } catch (e) {
            console.error("HP Config parse failed", e)
        }

        // Promotions mapping
        const promoMap = new Map()
        promos?.forEach(p => {
            if (p.productId) {
                const existing = promoMap.get(p.productId) || []
                promoMap.set(p.productId, [...existing, { ...p, discount: p.discount || p.value }])
            }
            p.products?.forEach((lp: any) => {
                const existing = promoMap.get(lp.productId) || []
                promoMap.set(lp.productId, [...existing, { ...p, discount: p.discount || p.value }])
            })
        })

        const { data: orders } = await supabaseAdmin.from('OrderItem').select('productId')
        const popularityMap = new Map()
        orders?.forEach(({ productId }) => {
            popularityMap.set(productId, (popularityMap.get(productId) || 0) + 1)
        })

        // Enriched Dataset Serialization (falls back to bundled catalog if DB returns empty)
        const rawProducts = (products && products.length > 0) ? products : (fallbackProducts as any[])
        const enrichedProducts = rawProducts.map((p: any) => {
            let parsedSpecs: any = {}
            if (typeof p.specs === "string" && p.specs.length > 2) {
                try { parsedSpecs = JSON.parse(p.specs) } catch { parsedSpecs = {} }
            } else {
                parsedSpecs = p.specs || {}
            }

            const gallery = Array.isArray(p.galleryImages) 
                ? p.galleryImages 
                : (typeof p.galleryImages === "string" ? (JSON.parse(p.galleryImages || "[]")) : [])
            const variants = p.variants || []
            
            const getPriceInfo = () => {
                const dbPrice = Number(p.price || 0)
                if (dbPrice > 0) return dbPrice
                if (variants.length > 0) {
                    const vPrices = variants.map((v: any) => Number(v.price || 0)).filter((v: any) => v > 0)
                    if (vPrices.length > 0) return Math.min(...vPrices)
                }
                const specPrice = Number(parsedSpecs?.identity?.price || 0)
                if (specPrice > 0) return specPrice
                return 2500
            }

            const basePrice = getPriceInfo()
            const specDiscountPrice = Number(parsedSpecs?.identity?.discountPrice || 0)
            const specDiscountPercent = Number(parsedSpecs?.identity?.discountPercent || p.discount || 0)
            const pDiscountPrice = Number(p.discountPrice || specDiscountPrice || 0)

            let finalPrice = basePrice
            let finalOriginalPrice: number | null = null

            if (pDiscountPrice > 0 && pDiscountPrice < basePrice) {
                finalPrice = pDiscountPrice
                finalOriginalPrice = basePrice
            } else if (specDiscountPercent > 0 && specDiscountPercent < 100) {
                finalPrice = Math.round(basePrice * (1 - specDiscountPercent / 100))
                finalOriginalPrice = basePrice
            }

            return {
                ...p,
                name: (p.name || "").trim(),
                brand: (p.brand || "").trim(),
                price: finalPrice,
                originalPrice: finalOriginalPrice,
                stock: Number(p.stock || 0),
                orderCount: popularityMap.get(p.id) || 0,
                specs: parsedSpecs,
                galleryImages: gallery,
                promotions: promoMap.get(p.id) || []
            }
        }).filter((p: any) => !p.specs?.identity?.isHidden).sort((a: any, b: any) => {
            const aS = (Number(a.stock) || 0) > 0 ? 0 : 1
            const bS = (Number(b.stock) || 0) > 0 ? 0 : 1
            if (aS !== bS) return aS - bS
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        })

        const cmsData = {
            settings: settings || {},
            banners: banners || [],
            categories: categories || [],
            brands: brands || []
        }

        return <ClientHome allProducts={enrichedProducts} cmsData={cmsData} hpConfig={hpConfig} />
    } catch (e: any) {
        console.error("Home render failure:", e)
        const enrichedFallback = (fallbackProducts as any[]).map((p: any) => {
            let parsedSpecs: any = {}
            if (typeof p.specs === "string" && p.specs.length > 2) {
                try { parsedSpecs = JSON.parse(p.specs) } catch { parsedSpecs = {} }
            } else {
                parsedSpecs = p.specs || {}
            }
            const gallery = Array.isArray(p.galleryImages) 
                ? p.galleryImages 
                : (typeof p.galleryImages === "string" ? (JSON.parse(p.galleryImages || "[]")) : [])
            return {
                ...p,
                name: (p.name || "").trim(),
                brand: (p.brand || "").trim(),
                price: Number(p.price || 2500),
                originalPrice: null,
                stock: Number(p.stock || 17),
                orderCount: 0,
                specs: parsedSpecs,
                galleryImages: gallery,
                promotions: []
            }
        })
        return <ClientHome allProducts={enrichedFallback} />
    }
}
