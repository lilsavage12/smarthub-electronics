import React, { Suspense } from "react"
import { Smartphone, ChevronRight } from "lucide-react"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase"
import ClientProductDetail from "@/components/products/ClientProductDetail"
import { notFound } from "next/navigation"

// Enable ISR (Every 1 hour)
export const revalidate = 3600

// Optimistic static generation for the top 50 products
export async function generateStaticParams() {
    const { data: products } = await supabaseAdmin
        .from('Product')
        .select('id, name')
        .order('createdAt', { ascending: false })
        .limit(50)
    
    return (products || []).map(p => ({
        id: `${p.name.toLowerCase().replace(/ /g, '-') || 'product'}--${p.id}`,
    }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: rawId } = await params
    // Extract ID using the unique double-hyphen separator to handle UUIDs safely
    const id = rawId.includes('--') ? rawId.split('--').pop() : rawId

    try {
        console.log(`Server Prefetching SKU: ${id}`)
        
        // 1. Primary Product Data
        const { data: product, error: pErr } = await supabaseAdmin.from('Product').select('*, variants:ProductVariant(*)').eq('id', id).maybeSingle()
        if (!product || pErr) return notFound()

        // 2. High-precision Related Inventory Retrieval
        // Priority: Same Brand -> Same Category (Excluding self)
        const [
            { data: brandRes },
            { data: catRes },
            { data: promos }
        ] = await Promise.all([
            supabaseAdmin.from('Product').select('*, variants:ProductVariant(*)').eq('brand', product.brand).neq('id', id).limit(12),
            supabaseAdmin.from('Product').select('*, variants:ProductVariant(*)').eq('category', product.category).neq('brand', product.brand).neq('id', id).limit(12),
            supabaseAdmin.from('Promotion').select('*, products:PromotionProduct(*)').eq('isActive', true)
        ])

        const relatedRes = [...(brandRes || []), ...(catRes || [])].slice(0, 12)

        // 2. High-speed Promotion Enrichment
        const productPromos = (promos || []).filter(p => 
            p.productId === id || p.products?.some((lp: any) => lp.productId === id)
        ).map(p => ({ ...p, discount: p.discount || p.value }))

        // 3. Serialization
        let specs = {} as any
        try { specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs } catch {}
        
        const gallery = specs?.gallery || []
        const colors = specs?.productColors || []

        const fullProduct = {
            ...product,
            price: Number(product.price || 0),
            originalPrice: Number(product.originalPrice || product.price || 0),
            specs: specs,
            images: [product.image, ...(Array.isArray(gallery) ? gallery : [])].filter(Boolean),
            productColors: colors,
            promotions: productPromos
        }

        return (
            <div className="min-h-screen bg-background text-foreground" suppressHydrationWarning>
                {/* BREADCRUMBS (High-precision) */}
                <div suppressHydrationWarning className="max-w-7xl mx-auto px-6 pt-12">
                    <nav className="flex flex-wrap items-center gap-2 text-[11px] md:text-[13px] font-medium tracking-tight text-muted-foreground/60">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="opacity-30">/</span>
                        <Link href={`/products?category=${product.category}`} className="hover:text-primary transition-colors truncate max-w-[100px] md:max-w-none">{product.category}</Link>
                        <span className="opacity-30">/</span>
                        <Link href={`/products?brand=${product.brand}`} className="hover:text-primary transition-colors truncate max-w-[100px] md:max-w-none">{product.brand}</Link>
                        <span className="opacity-30">/</span>
                        <span className="text-foreground font-bold truncate max-w-[150px] md:max-w-none">{product.name}</span>
                    </nav>
                </div>

                <Suspense fallback={
                    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                        <Smartphone className="w-12 h-12 text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]  opacity-50">Calibrating Product Experience...</span>
                    </div>
                }>
                    <ClientProductDetail product={fullProduct} relatedProducts={relatedRes || []} />
                </Suspense>
            </div>
        )
    } catch (e) {
        console.error("SKU RETRIEVAL ERROR:", e)
        return notFound()
    }
}
