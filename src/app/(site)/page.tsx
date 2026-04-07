import React, { Suspense } from "react"
import { Smartphone } from "lucide-react"
import { supabaseAdmin } from "@/lib/supabase"
import { ClientHome } from "@/components/home/ClientHome"

// Static revalidation for lightning fast initial loads (Every 10 minutes)
export const revalidate = 600

export default async function Home() {
    try {
        // 1. Parallel execution at the edge / server VPC
        const [
            { data: products },
            { data: settings },
            { data: banners },
            { data: categories },
            { data: brands },
            { data: trustMarkers },
            { data: promos },
            { data: hpMatrixConfig }
        ] = await Promise.all([
            supabaseAdmin.from('Product').select('*, variants:ProductVariant(*)').order('createdAt', { ascending: false }).limit(100),
            supabaseAdmin.from('HomepageSettings').select('*').eq('id', 'singleton').maybeSingle(),
            supabaseAdmin.from('HeroSlide').select('*').order('order', { ascending: true }),
            supabaseAdmin.from('HomepageCategory').select('*').eq('isActive', true).order('order', { ascending: true }),
            supabaseAdmin.from('BrandLogo').select('*').eq('isActive', true).order('order', { ascending: true }),
            supabaseAdmin.from('TrustMarker').select('*').eq('isActive', true).order('order', { ascending: true }),
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

        // 2. High-performance Promotion Mapping (O(N) vs O(N*M))
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

        // Create popularity map
        const popularityMap = new Map()
        orders?.forEach(({ productId }) => {
            popularityMap.set(productId, (popularityMap.get(productId) || 0) + 1)
        })

        // 3. Enriched Dataset Serialization with Normalization
        const enrichedProducts = (products || []).map((p: any) => {
            let parsedSpecs = {}
            if (typeof p.specs === "string") {
                try { parsedSpecs = JSON.parse(p.specs) } catch { parsedSpecs = {} }
            } else { parsedSpecs = p.specs || {} }

            let gallery = []
            const rawGallery = p.galleryImages || p.images
            if (typeof rawGallery === "string") {
                try { gallery = JSON.parse(rawGallery) } catch { gallery = [] }
            } else { gallery = Array.isArray(rawGallery) ? rawGallery : [] }

            const price = Number(p.price || 0)
            const dbOrig = p.originalPrice ? Number(p.originalPrice) : null
            const discount = Number(p.discount || 0)
            
            // If discount is set, calculate original as price + discount (Amount based)
            // If originalPrice exists and > price, use it. 
            // Fallback to price.
            let finalOriginal = dbOrig || price
            if (discount > 0 && (!dbOrig || dbOrig <= price)) {
                finalOriginal = price + discount
            }

            return {
                ...p,
                name: (p.name || "").trim(),
                brand: (p.brand || "").trim(),
                price: price,
                originalPrice: finalOriginal,
                orderCount: popularityMap.get(p.id) || 0,
                specs: parsedSpecs,
                galleryImages: gallery,
                promotions: promoMap.get(p.id) || []
            }
        })

        const cmsData = {
            settings: settings || {},
            banners: banners || [],
            categories: categories || [],
            brands: brands || [],
            trust: trustMarkers || []
        }

        return (
            <Suspense fallback={<div className="min-h-screen bg-background flex flex-col items-center justify-center gap-10"><Smartphone className="w-16 h-16 text-primary animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.4em] ">Synchronizing Storefront...</span></div>}>
                <ClientHome 
                    allProducts={enrichedProducts} 
                    cmsData={cmsData} 
                    hpConfig={hpConfig} 
                />
            </Suspense>
        )
    } catch (error) {
        console.error("CRITICAL DATA SYNC FAILURE:", error)
        // Fallback to simple shell if DB is down
        return <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-20"><Smartphone className="w-10 h-10 opacity-20 mb-4" /><h1 className="text-sm font-black uppercase tracking-[0.5em] opacity-40 ">System Offline</h1></div>
    }
}
