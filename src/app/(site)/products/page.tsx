import { Suspense } from "react"
import { Smartphone } from "lucide-react"
import { ProductRegistry } from "@/components/products/ProductRegistry"
import { supabaseAdmin } from "@/lib/supabase"

export const revalidate = 600

export default async function ProductsPage() {
    // Parallel fetch from Supabase
    const [
        { data: products },
        { data: settings },
        { data: banners },
        { data: categories },
        { data: brands },
        { data: testimonials },
        { data: trustMarkers },
        { data: promos }
    ] = await Promise.all([
        supabaseAdmin.from('Product').select('*, variants:ProductVariant(*)').order('createdAt', { ascending: false }),
        supabaseAdmin.from('HomepageSettings').select('*').eq('id', 'singleton').maybeSingle(),
        supabaseAdmin.from('HeroSlide').select('*').eq('isActive', true).order('order', { ascending: true }),
        supabaseAdmin.from('HomepageCategory').select('*').eq('isActive', true).order('order', { ascending: true }),
        supabaseAdmin.from('BrandLogo').select('*').eq('isActive', true).order('order', { ascending: true }),
        supabaseAdmin.from('Testimonial').select('*').eq('isActive', true).order('createdAt', { ascending: false }),
        supabaseAdmin.from('TrustMarker').select('*').eq('isActive', true).order('order', { ascending: true }),
        supabaseAdmin.from('Promotion').select('*, products:PromotionProduct(*)').eq('isActive', true)
    ])

    // Final Enrichment
    const enrichedProducts = (products || []).map(p => {
        const productPromos = (promos || [])
            .filter(pr => pr.productId === p.id || pr.products?.some((pp: any) => pp.productId === p.id))
            .map(pr => ({ ...pr, discount: pr.discount || pr.value }))

        return {
            ...p,
            promotions: [...(p.promotions || []), ...productPromos]
        }
    })

    const cmsData = {
        settings: settings || {
            announcementText: "FREE DELIVERY ON ALL ORDERS OVER $1000",
            announcementShow: true,
            newsletterTitle: "JOIN OUR TECH INSIDERS",
            newsletterSub: "Sign up for exclusive product launches and special pricing access.",
            newsletterShow: true,
        },
        banners: banners || [],
        categories: categories || [],
        brands: brands || [],
        testimonials: testimonials || [],
        trust: trustMarkers || [],
    }

    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex flex-col items-center justify-center gap-10"><Smartphone className="w-12 h-12 text-primary animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.4em] ">Loading Catalog</span></div>}>
            <ProductRegistry initialProducts={enrichedProducts} cmsData={cmsData} />
        </Suspense>
    )
}

