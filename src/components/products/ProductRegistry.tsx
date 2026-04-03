"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Smartphone, Search as SearchIcon, Filter, X, LayoutGrid, List, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/components/products/ProductCard"
import { SideFilter } from "@/components/products/SideFilter"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface ProductRegistryProps {
    initialProducts: any[]
    cmsData: any
}

export function ProductRegistry({ initialProducts, cmsData: initialCmsData }: ProductRegistryProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [allProducts, setAllProducts] = useState<any[]>(initialProducts)
    const [cmsData, setCmsData] = useState<any>(initialCmsData)
    const [isLoading, setIsLoading] = useState(false) // Ready from server
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const PRODUCTS_PER_PAGE = 50

    // Persistent Filter State
    const [activeFilters, setActiveFilters] = useState({
        brands: [...new Set([...searchParams.getAll("brands"), ...searchParams.getAll("brand")])],
        categories: [...new Set([...searchParams.getAll("categories"), ...searchParams.getAll("category")])],
        minPrice: parseInt(searchParams.get("minPrice") || "0"),
        maxPrice: parseInt(searchParams.get("maxPrice") || "1000000"),
        rating: 0,
        inStock: false,
        onSale: false
    })

    // Re-sync if server data changes (though unlikely in same session)
    useEffect(() => {
        setAllProducts(initialProducts)
    }, [initialProducts])

    useEffect(() => {
        const params = new URLSearchParams()
        activeFilters.brands.forEach(b => params.append("brands", b))
        activeFilters.categories.forEach(c => params.append("categories", c))
        if (activeFilters.minPrice > 0) params.set("minPrice", activeFilters.minPrice.toString())
        if (activeFilters.maxPrice < 1000000) params.set("maxPrice", activeFilters.maxPrice.toString())
        
        const query = params.toString()
        router.replace(query ? `?${query}` : "/products", { scroll: false })
    }, [activeFilters, router])

    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            if (p.isHidden || p.specs?.identity?.isHidden) return false
            const matchesBrand = activeFilters.brands.length === 0 || activeFilters.brands.includes(p.brand)
            const matchesCategory = activeFilters.categories.length === 0 || activeFilters.categories.includes(p.category)
            const matchesPrice = p.price >= activeFilters.minPrice && p.price <= activeFilters.maxPrice
            const matchesStock = !activeFilters.inStock || p.stock > 0
            
            return matchesBrand && matchesCategory && matchesPrice && matchesStock
        })
    }, [activeFilters, allProducts])

    return (
        <div className="min-h-screen bg-background text-foreground pb-40" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12 pt-10" suppressHydrationWarning>
                
                {/* 1. Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-12" suppressHydrationWarning>
                    <div className="flex flex-col gap-4">
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none font-outfit">Shop <span className="text-primary italic">All</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">Browse our full range of products and devices.</p>
                    </div>
                    {/* MOBILE FILTER TRIGGER */}
                    <Button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden h-14 w-full md:w-auto rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-[10px] gap-3 shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)]"
                    >
                        <Filter size={18} /> OPEN FILTERS
                    </Button>
                </div>


                <div className="flex flex-col lg:flex-row gap-16 relative" suppressHydrationWarning>
                    {/* 3. SIDEBAR REFINEMENT */}
                    <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-48 h-fit">
                        <SideFilter 
                            brands={cmsData?.brands?.length > 0 ? cmsData.brands.map((b: any) => b.name) : [...new Set(allProducts.map(p => p.brand))]} 
                            activeFilters={activeFilters} 
                            setActiveFilters={setActiveFilters} 
                            counts={{
                                brands: allProducts.reduce((acc: any, p: any) => { const b = (p.brand || "").toLowerCase(); acc[b] = (acc[b] || 0) + 1; return acc }, {}),
                                categories: allProducts.reduce((acc: any, p: any) => { const c = p.category || "Smartphones"; acc[c] = (acc[c] || 0) + 1; return acc }, {})
                            }}
                        />
                    </aside>

                    {/* 4. PRODUCT MATRIX */}
                    <div className="flex-1 flex flex-col gap-6" suppressHydrationWarning>
                        <div suppressHydrationWarning className="grid gap-0 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE).map((product) => (
                                <ProductCard key={product.id} product={product} viewMode="grid" />
                            ))}
                        </div>

                        {filteredProducts.length > PRODUCTS_PER_PAGE && (
                            <div className="flex items-center justify-center gap-2 pt-12">
                                {Array.from({ length: Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className={cn(
                                            "w-10 h-10 rounded-xl font-black text-[10px] uppercase transition-all border",
                                            currentPage === i + 1 
                                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                                : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/40"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {filteredProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-border rounded-[4rem] opacity-40">
                                <X size={60} className="mb-8" />
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">No items found</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest max-w-sm">We couldn't find any items matching your search. Try different keywords or filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MOBILE FILTER DRAWER */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000]" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 h-[80vh] bg-background border-t border-border z-[1010] p-8 overflow-y-auto rounded-t-[3rem]">
                            <div className="flex items-center justify-between mb-12">
                                <h3 className="text-2xl font-black italic tracking-tight uppercase leading-none">Filters</h3>
                                <button onClick={() => setIsSidebarOpen(false)} className="rounded-2xl h-14 w-14 bg-muted border border-border flex items-center justify-center"><X className="w-6 h-6" /></button>
                            </div>
                            <SideFilter brands={cmsData?.brands?.map((b: any) => b.name) || []} activeFilters={activeFilters} setActiveFilters={setActiveFilters} isMobile={true} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
