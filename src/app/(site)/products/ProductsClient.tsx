"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Grid, List, ChevronDown, SlidersHorizontal, ArrowUpDown, Smartphone, Search, Zap, Filter, LayoutGrid, Sparkles, TrendingUp, ShieldCheck, Box, ChevronRight, Tags } from "lucide-react"
import { SideFilter } from "@/components/products/SideFilter"
import { ProductCard } from "@/components/products/ProductCard"
import { SkeletonLoader } from "@/components/products/SkeletonLoader"
import { PRODUCTS, BRANDS } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function ProductsContent() {
    const searchParams = useSearchParams()
    const urlSearch = searchParams.get("search")
    const router = useRouter()
    
    const [liveProducts, setLiveProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeFilters, setActiveFilters] = useState<{ 
        brands: string[], 
        categories: string[],
        minPrice: number,
        maxPrice: number,
        rating: number,
        inStock: boolean,
        onSale: boolean,
        ram: string[],
        storage: string[],
        os: string[],
        network: string[],
        camera: string[]
    }>({
        brands: [],
        categories: [],
        minPrice: 0,
        maxPrice: 3000,
        rating: 0,
        inStock: false,
        onSale: false,
        ram: [],
        storage: [],
        os: [],
        network: [],
        camera: []
    })
    const [searchQuery, setSearchQuery] = useState(urlSearch || "")
    const [sortBy, setSortBy] = useState("newest")
    const [viewMode, setViewMode] = useState("grid")
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [displayLimit, setDisplayLimit] = useState(12)

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const res = await fetch("/api/products")
                const data = await res.json()
                if (Array.isArray(data)) setLiveProducts(data)
            } catch (error) {
                console.error("Catalog sync error", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    const allProducts = useMemo(() => [...PRODUCTS, ...liveProducts], [liveProducts])

    // URL Persistence Sync
    useEffect(() => {
        const params = new URLSearchParams()
        if (activeFilters.brands.length > 0) params.set("brands", activeFilters.brands.join(","))
        if (activeFilters.categories.length > 0) params.set("categories", activeFilters.categories.join(","))
        if (activeFilters.minPrice > 0) params.set("minPrice", activeFilters.minPrice.toString())
        if (activeFilters.maxPrice < 3000) params.set("maxPrice", activeFilters.maxPrice.toString())
        if (activeFilters.rating > 0) params.set("rating", activeFilters.rating.toString())
        if (activeFilters.inStock) params.set("inStock", "true")
        if (activeFilters.onSale) params.set("onSale", "true")
        if (searchQuery) params.set("search", searchQuery)
        if (sortBy !== "newest") params.set("sortBy", sortBy)

        const query = params.toString()
        router.push(query ? `?${query}` : "/products", { scroll: false })
    }, [activeFilters, searchQuery, sortBy, router])

    const filteredProducts = useMemo(() => {
        return allProducts.filter((product) => {
            if (!product) return false
            const brand = product.brand || ""
            if (activeFilters.brands.length > 0 && !activeFilters.brands.includes(brand.toLowerCase())) return false
            const category = product.category || "Smartphones"
            if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(category)) return false
            if (product.price < activeFilters.minPrice || product.price > activeFilters.maxPrice) return false
            if (activeFilters.rating > 0 && product.rating < activeFilters.rating) return false
            const s = product.traditionalSpecs || product.specs || {}
            if (activeFilters.ram.length > 0 && !activeFilters.ram.includes(s.ram || "")) return false
            if (activeFilters.storage.length > 0 && !activeFilters.storage.includes(s.storage || "")) return false
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
            if (activeFilters.inStock && product.stock === 0) return false
            if (activeFilters.onSale && !product.isSale && !product.tags?.includes("Flash")) return false
            return true
        }).sort((a, b) => {
            if (sortBy === "price-low") return a.price - b.price
            if (sortBy === "price-high") return b.price - a.price
            if (sortBy === "rating") return b.rating - a.rating
            if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            return 0 
        })
    }, [activeFilters, searchQuery, sortBy, allProducts])

    return (
        <div className="min-h-screen bg-background text-foreground" suppressHydrationWarning>
            {/* 1. IMMERSIVE HERO HEADER */}
            <section className="relative h-[25vh] md:h-[40vh] overflow-hidden flex items-center border-b border-border shadow-2xl shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
                
                <div className="container relative z-10 px-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 py-10 md:py-0">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ">
                            <Link href="/" className="hover:text-primary transition-colors">STOREFRONT</Link>
                            <ChevronRight size={10} />
                            <span className="text-primary ">Catalog</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black  tracking-tighter uppercase leading-none">
                            The <span className="text-primary font-black">Digital</span> Collection
                        </h1>
                        <p className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 max-w-md leading-relaxed">
                            Premium Gadgets & Electronics. Curated for Tech Enthusiasts.
                        </p>
                    </div>

                    <div className="flex items-center gap-8 border-l border-border pl-8 py-2">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black  tracking-tighter leading-none">{allProducts.length}</span>
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1.5 opacity-40 ">PRODUCTS AVAILABLE</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black  tracking-tighter leading-none text-emerald-500">{allProducts.filter(p => !p.stock || p.stock > 0).length}</span>
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1.5 opacity-40 ">IN STOCK</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col gap-12" suppressHydrationWarning>
                
                {/* 2. COMMAND CENTER SEARCH */}
                <div className="flex flex-col lg:flex-row gap-8 items-center justify-between sticky top-[72px] z-[40] bg-background/80 backdrop-blur-xl py-4 border-y border-border/40 px-2 rounded-2xl md:-mx-2 transition-all shadow-xl shadow-black/5" suppressHydrationWarning>
                    <div className="relative flex-1 w-full max-w-2xl group" suppressHydrationWarning>
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all h-5 w-5" />
                        <input
                            type="text"
                            placeholder="SEARCH PRODUCTS..."
                            className="h-14 md:h-20 w-full bg-muted/20 border-border border rounded-2xl md:rounded-[2rem] pl-16 pr-8 text-xs md:text-sm font-black uppercase tracking-widest outline-none transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary/20 placeholder:opacity-20 "
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="flex items-center bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest px-4 cursor-pointer h-10"
                            >
                                <option value="newest">LATEST ADDITIONS</option>
                                <option value="price-low">PRICE: ASCENDING</option>
                                <option value="price-high">PRICE: DESCENDING</option>
                                <option value="rating">TOP RATED</option>
                            </select>
                            <div className="w-[1px] h-6 bg-border mx-2" />
                            <div className="flex items-center gap-1">
                                <button
                                    className={cn("h-10 w-10 p-0 rounded-xl transition-all flex items-center justify-center", viewMode === "grid" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted")}
                                    onClick={() => setViewMode("grid")}
                                >
                                    <LayoutGrid size={16} />
                                </button>
                                <button
                                    className={cn("h-10 w-10 p-0 rounded-xl transition-all flex items-center justify-center", viewMode === "list" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted")}
                                    onClick={() => setViewMode("list")}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                        <Button
                            className="lg:hidden h-14 w-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Filter size={20} />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 relative">
                    {/* 3. REFINED SIDEBAR FILTER */}
                    <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-48 h-fit">
                        <SideFilter 
                            brands={BRANDS} 
                            activeFilters={activeFilters} 
                            setActiveFilters={setActiveFilters} 
                            counts={{
                                brands: allProducts.reduce((acc: any, p: any) => {
                                    const b = (p.brand || "").toLowerCase()
                                    acc[b] = (acc[b] || 0) + 1
                                    return acc
                                }, {}),
                                categories: allProducts.reduce((acc: any, p: any) => {
                                    const c = p.category || "Smartphones"
                                    acc[c] = (acc[c] || 0) + 1
                                    return acc
                                }, {})
                            }}
                        />
                    </aside>

                    {/* 4. PRODUCT GRID / LOADING STATE */}
                    <div className="flex-1 flex flex-col gap-12">
                        <div className="flex items-center justify-between border-b border-border pb-6">
                            <div className="flex flex-col">
                                <h3 className="text-xl font-black  tracking-tight uppercase leading-none">Product Catalog</h3>
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] mt-2 opacity-50 px-0.5">CONNECTING TO STORE...</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{filteredProducts.length} PRODUCTS ONLINE</span>
                        </div>

                        {loading ? (
                            <SkeletonLoader viewMode={viewMode as any} />
                        ) : (
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    layout
                                    className={cn(
                                        "grid gap-0",
                                        viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                                    )}
                                >
                                    {filteredProducts.slice(0, displayLimit).map((product, i) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4, delay: (i % 8) * 0.05 }}
                                        >
                                            <ProductCard product={product} viewMode={viewMode as any} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        )}

                        {/* 5. ELITE PAGINATION */}
                        {filteredProducts.length > displayLimit && (
                            <div className="flex justify-center pt-20">
                                <Button 
                                    variant="outline" 
                                    className="h-20 lg:h-24 px-12 lg:px-24 rounded-[2.5rem] lg:rounded-[3rem] border-primary/20 bg-card font-black  tracking-[0.3em] uppercase text-xs hover:bg-muted transition-all gap-4 shadow-2xl shadow-primary/5 hover:border-primary group"
                                    onClick={() => setDisplayLimit(prev => prev + 12)}
                                >
                                    <Sparkles size={20} className="text-primary group-hover:rotate-12 transition-transform" />
                                    LOAD MORE PRODUCTS
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                </Button>
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!loading && filteredProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-40 text-center">
                                <div className="bg-muted/30 p-20 rounded-[4rem] mb-12 border border-border/50">
                                    <Smartphone size={80} className="text-muted-foreground/20 animate-pulse" />
                                </div>
                                <h2 className="text-4xl font-black font-outfit uppercase  mb-6">No Products Found</h2>
                                <p className="text-muted-foreground max-w-sm mb-12 font-black uppercase text-[10px] tracking-widest opacity-40 leading-relaxed">The current filters returned no results. Please adjust your search parameters.</p>
                                <Button className="h-16 px-16 rounded-2xl bg-primary text-white font-black  tracking-widest uppercase shadow-2xl shadow-primary/20" onClick={() => setActiveFilters({ brands: [], categories: [], minPrice: 0, maxPrice: 3000, rating: 0, inStock: false, onSale: false, ram: [], storage: [], os: [], network: [], camera: [] })}>
                                    CLEAR FILTERS
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MOBILE DRAWER */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[85%] max-w-[450px] bg-background border-l border-border z-[110] lg:hidden shadow-2xl p-8 overflow-y-auto no-scrollbar"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-2xl font-black  tracking-tight uppercase leading-none">Filters</h3>
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest  opacity-40">Mobile Store Navigation</span>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="rounded-2xl h-14 w-14 bg-muted/50 border border-border flex items-center justify-center">
                                    <Tags className="w-6 h-6 text-foreground" />
                                </button>
                            </div>
                            <SideFilter
                                brands={BRANDS}
                                activeFilters={activeFilters}
                                setActiveFilters={setActiveFilters}
                                isMobile={true}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Quality Uplink Bar */}
            <section className="bg-muted py-20 mt-20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { title: "2-YEAR WARRANTY", sub: "Standard on all products", icon: <ShieldCheck size={32} className="text-primary" /> },
                        { title: "EXPRESS SHIPPING", sub: "1-hour delivery active", icon: <Zap size={32} className="text-amber-500" /> },
                        { title: "ZERO FINANCING", sub: "Split over 12 mo at 0%", icon: <TrendingUp size={32} className="text-emerald-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-6 group">
                            <div className="p-4 bg-background border border-border rounded-2xl group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <div className="flex flex-col">
                                <h4 className="text-sm font-black  uppercase tracking-widest leading-none">{item.title}</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-50">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

function ProductsClient() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
                <Smartphone className="w-12 h-12 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Loading Store...</span>
            </div>
        }>
            <ProductsContent />
        </React.Suspense>
    )
}

export default ProductsClient
