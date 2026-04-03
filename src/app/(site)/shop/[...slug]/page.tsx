"use client"

import React, { useState, useEffect, useMemo, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Smartphone, Zap, Filter, X, LayoutGrid, List, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/components/products/ProductCard"
import { SideFilter } from "@/components/products/SideFilter"
import { cn } from "@/lib/utils"

function ShopCollection() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // params.slug is an array: ['brand', 'Samsung'] or ['category', 'Smartphones']
    const slug = params.slug as string[]
    const type = slug?.[0] || "" // 'brand' or 'category'
    const value = slug?.[1] || ""

    const [allProducts, setAllProducts] = useState<any[]>([])
    const [cmsData, setCmsData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [displayLimit, setDisplayLimit] = useState(12)

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
    const [activeFilters, setActiveFilters] = useState({
        brands: type === "brand" ? [value] : searchParams.getAll("brands"),
        categories: type === "category" ? [value] : searchParams.getAll("categories"),
        minPrice: 0,
        maxPrice: 1000000,
        rating: 0,
        inStock: false,
        onSale: false
    })

    useEffect(() => {
        const loadCollection = async () => {
            try {
                const [productsRes, cmsRes] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/cms/homepage")
                ])
                if (productsRes.ok) setAllProducts(await productsRes.json())
                if (cmsRes.ok) setCmsData(await cmsRes.json())
            } catch (err) {
                console.error("Connection failed")
            } finally {
                setIsLoading(false)
            }
        }
        loadCollection()
    }, [])

    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesBrand = activeFilters.brands.length === 0 || activeFilters.brands.includes(p.brand)
            const matchesCategory = activeFilters.categories.length === 0 || activeFilters.categories.includes(p.category)
            return matchesSearch && matchesBrand && matchesCategory
        })
    }, [activeFilters, searchQuery, allProducts])

    if (isLoading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-12 pt-[140px] md:pt-0" suppressHydrationWarning>
            <Smartphone className="w-12 h-12 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Loading {value.toUpperCase()} Collection</span>
        </div>
    )

    return (
        <div className="min-h-screen bg-background text-foreground pb-40 pt-[140px] md:pt-[180px]" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
                
                <header className="flex flex-col gap-4 border-b border-border/50 pb-12">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Official Collection</span>
                    <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none font-outfit">{value || "Product Collection"}</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic mt-2">Live: Connected to the {type || "global"} product database.</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-16 relative">
                    <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-52 h-fit">
                        <SideFilter 
                            brands={cmsData?.brands?.map((b: any) => b.name) || []} 
                            activeFilters={activeFilters} 
                            setActiveFilters={setActiveFilters} 
                            counts={{
                                brands: allProducts.reduce((acc: any, p: any) => { acc[p.brand] = (acc[p.brand] || 0) + 1; return acc }, {}),
                                categories: allProducts.reduce((acc: any, p: any) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc }, {})
                            }}
                        />
                    </aside>

                    <div className="flex-1 flex flex-col gap-12">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.slice(0, displayLimit).map((product) => (
                                <ProductCard key={product.id} product={product} viewMode={viewMode} />
                            ))}
                        </div>
                        
                        {filteredProducts.length === 0 && (
                            <div className="py-40 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[4rem] opacity-30">
                                <X size={48} />
                                <span className="mt-8 text-[10px] font-black uppercase tracking-widest italic font-black uppercase tracking-widest italic">No Products Found</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Smartphone className="animate-pulse text-primary h-12 w-12" /></div>}>
            <ShopCollection />
        </Suspense>
    )
}
