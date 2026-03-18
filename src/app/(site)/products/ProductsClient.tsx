"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Grid, List, ChevronDown, SlidersHorizontal, ArrowUpDown, Smartphone, Search, Zap, Filter, LayoutGrid, Sparkles, TrendingUp, ShieldCheck } from "lucide-react"
import { SideFilter } from "@/components/products/SideFilter"
import { ProductCard } from "@/components/products/ProductCard"
import { PRODUCTS, BRANDS } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"

function ProductsContent() {
    const searchParams = useSearchParams()
    const urlBrand = searchParams.get("brand")
    const urlSearch = searchParams.get("search")
    const urlFilter = searchParams.get("filter")

    const router = useRouter()
    const [liveProducts, setLiveProducts] = useState<any[]>([])
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
        condition: string[],
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
        condition: [],
        camera: []
    })
    const [searchQuery, setSearchQuery] = useState(urlSearch || "")
    const [sortBy, setSortBy] = useState("newest")
    const [viewMode, setViewMode] = useState("grid")
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [displayLimit, setDisplayLimit] = useState(9)

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
        if (activeFilters.ram.length > 0) params.set("ram", activeFilters.ram.join(","))
        if (activeFilters.storage.length > 0) params.set("storage", activeFilters.storage.join(","))
        if (activeFilters.os.length > 0) params.set("os", activeFilters.os.join(","))
        if (activeFilters.network.length > 0) params.set("network", activeFilters.network.join(","))
        if (activeFilters.condition.length > 0) params.set("condition", activeFilters.condition.join(","))
        if (activeFilters.camera.length > 0) params.set("camera", activeFilters.camera.join(","))
        if (searchQuery) params.set("search", searchQuery)
        if (sortBy !== "newest") params.set("sortBy", sortBy)

        const query = params.toString()
        router.push(query ? `?${query}` : "/products", { scroll: false })
    }, [activeFilters, searchQuery, sortBy])

    // Initial Load Sync from URL
    useEffect(() => {
        const brands = searchParams.get("brands")?.split(",") || []
        const categories = searchParams.get("categories")?.split(",") || []
        const minPrice = parseInt(searchParams.get("minPrice") || "0")
        const maxPrice = parseInt(searchParams.get("maxPrice") || "3000")
        const rating = parseInt(searchParams.get("rating") || "0")
        const inStock = searchParams.get("inStock") === "true"
        const onSale = searchParams.get("onSale") === "true" || searchParams.get("filter") === "flash"
        const ram = searchParams.get("ram")?.split(",") || []
        const storage = searchParams.get("storage")?.split(",") || []
        const os = searchParams.get("os")?.split(",") || []
        const network = searchParams.get("network")?.split(",") || []
        const condition = searchParams.get("condition")?.split(",") || []
        const camera = searchParams.get("camera")?.split(",") || []
        const search = searchParams.get("search") || ""
        const sort = searchParams.get("sortBy") || "newest"

        setActiveFilters({ brands, categories, minPrice, maxPrice, rating, inStock, onSale, ram, storage, os, network, condition, camera })
        setSearchQuery(search)
        setSortBy(sort)
    }, [])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/products")
                const data = await res.json()
                if (Array.isArray(data)) {
                    setLiveProducts(data)
                } else {
                    console.error("Catalog sync returned invalid format:", data)
                    setLiveProducts([])
                }
            } catch (error) {
                console.error("Catalog sync error", error)
                setLiveProducts([])
            }
        }
        fetchProducts()
    }, [])

    const allProducts = useMemo(() => {
        return [...PRODUCTS, ...liveProducts]
    }, [liveProducts])

    const filteredProducts = useMemo(() => {
        return allProducts.filter((product) => {
            if (!product) return false;
            
            // Brand Filter
            const brand = product.brand || "";
            if (activeFilters.brands.length > 0 && !activeFilters.brands.includes(brand.toLowerCase())) {
                return false
            }

            // Category Filter
            const category = product.category || "Smartphones";
            if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(category)) {
                return false
            }

            // Price Filter
            if (product.price < activeFilters.minPrice || product.price > activeFilters.maxPrice) {
                return false
            }

            // Rating Filter
            if (activeFilters.rating > 0 && product.rating < activeFilters.rating) {
                return false
            }

            // RAM Filter
            const s = product.traditionalSpecs || product.specs || {};
            if (activeFilters.ram.length > 0 && !activeFilters.ram.includes(s.ram || "")) {
                return false
            }

            // Storage Filter
            if (activeFilters.storage.length > 0 && !activeFilters.storage.includes(s.storage || "")) {
                return false
            }

            // OS Filter
            if (activeFilters.os.length > 0 && !activeFilters.os.includes(s.os || "")) {
                return false
            }

            // Network Filter
            if (activeFilters.network.length > 0 && !activeFilters.network.includes(s.network || "")) {
                return false
            }

            // Condition Filter
            if (activeFilters.condition.length > 0 && !activeFilters.condition.includes(s.condition || "")) {
                return false
            }

            // Camera Filter
            if (activeFilters.camera?.length > 0 && !activeFilters.camera.includes(s.camera?.split(' ')[0] || "")) {
                return false
            }

            // Search Query
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false
            }

            // Availability Filter
            if (activeFilters.inStock && product.stock === 0) {
                return false
            }

            // Flash / Sale Filter
            if (activeFilters.onSale && !product.isSale && !product.tags?.includes("Flash")) {
                return false
            }

            return true
        }).sort((a, b) => {
            if (sortBy === "price-low") return a.price - b.price
            if (sortBy === "price-high") return b.price - a.price
            if (sortBy === "rating") return b.rating - a.rating
            if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            if (sortBy === "best-selling") return (b.salesCount || 0) - (a.salesCount || 0)
            return 0 
        })
    }, [activeFilters, searchQuery, sortBy, allProducts])

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8" suppressHydrationWarning>
                {/* Horizontal Brand Bar - Sleek Scroll */}
                <div className="w-full flex items-center gap-8 overflow-x-auto no-scrollbar pb-4 border-b border-slate-200 dark:border-white/5" suppressHydrationWarning>
                    <button
                        onClick={() => setActiveFilters({ ...activeFilters, brands: [] })}
                        className={cn("px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all", activeFilters.brands.length === 0 ? "bg-primary text-primary-foreground shadow-lg" : "bg-card text-muted-foreground hover:bg-muted")}
                    >
                        ALL PRODUCTS
                    </button>
                    {BRANDS.map((brand) => (
                        <button
                            key={brand.slug}
                            onClick={() => {
                                const isSelected = activeFilters.brands.includes(brand.slug);
                                setActiveFilters({ ...activeFilters, brands: isSelected ? activeFilters.brands.filter(b => b !== brand.slug) : [...activeFilters.brands, brand.slug] });
                            }}
                            className={cn("px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap", activeFilters.brands.includes(brand.slug) ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-card hover:bg-muted text-muted-foreground")}
                        >
                            {brand.name}
                        </button>
                    ))}
                </div>

                {/* Search & Sort Hub */}
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <div className="relative flex-1 w-full max-w-xl group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by model, brand, or features..."
                            className="h-16 w-full bg-card border-2 border-transparent focus:border-primary/20 rounded-3xl pl-14 pr-6 text-sm font-bold uppercase tracking-widest outline-none transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                        <div className="flex bg-card p-1.5 rounded-2xl shadow-sm border border-border">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest px-4 cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                                <option value="best-selling">Best Selling</option>
                            </select>
                            <div className="w-[1px] bg-border mx-2" />
                            <Button
                                variant="ghost"
                                className={cn("h-12 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 transition-all", viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground")}
                                onClick={() => setViewMode("grid")}
                            >
                                <LayoutGrid size={16} /> Grid
                            </Button>
                            <Button
                                variant="ghost"
                                className={cn("h-12 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 transition-all", viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground")}
                                onClick={() => setViewMode("list")}
                            >
                                <List size={16} /> List
                            </Button>
                        </div>
                        <Button
                            className="lg:hidden h-14 w-14 rounded-2xl bg-card border-2 border-border text-foreground shadow-sm"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <SlidersHorizontal size={20} />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left: Enhanced Sidebar */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <SideFilter 
                            brands={BRANDS} 
                            activeFilters={activeFilters} 
                            setActiveFilters={setActiveFilters} 
                            counts={{
                                brands: allProducts.reduce((acc: any, p: any) => {
                                    const b = (p.brand || "").toLowerCase();
                                    acc[b] = (acc[b] || 0) + 1;
                                    return acc;
                                }, {}),
                                categories: allProducts.reduce((acc: any, p: any) => {
                                    const c = p.category || "Smartphones";
                                    acc[c] = (acc[c] || 0) + 1;
                                    return acc;
                                }, {})
                            }}
                        />
                    </div>

                    {/* Right: Active Products Hub */}
                    <div className="flex-1 flex flex-col gap-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Stock Status: Available</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{filteredProducts.length} PRODUCTS FOUND</span>
                        </div>

                        {/* Staggered Grid Reveal */}
                        <motion.div
                            layout
                            className={cn(
                                "grid gap-6",
                                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                            )}
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.slice(0, displayLimit).map((product, i) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4, delay: i * 0.05 }}
                                    >
                                        <ProductCard product={product} viewMode={viewMode as any} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Pagination: Load More Area */}
                        {filteredProducts.length > displayLimit && (
                            <div className="flex justify-center pt-10">
                                <Button 
                                    variant="outline" 
                                    className="h-16 px-16 rounded-[2rem] border-border bg-card font-black italic tracking-[0.2em] uppercase text-[10px] hover:bg-muted transition-all gap-3 shadow-xl shadow-black/5"
                                    onClick={() => setDisplayLimit(prev => prev + 6)}
                                >
                                    <Sparkles size={16} className="text-primary" />
                                    Explore More Products
                                    <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                                </Button>
                            </div>
                        )}

                        {/* Empty Products state */}
                        {filteredProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="bg-muted p-16 rounded-[4rem] mb-10">
                                    <Smartphone size={64} className="text-muted-foreground/30 animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-black font-outfit uppercase italic mb-4">No Results Found</h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-10 font-medium">No products matched your search. Try resetting the filters.</p>
                                <Button className="h-14 px-12 rounded-2xl bg-primary text-white font-black italic tracking-widest uppercase shadow-xl shadow-primary/20" onClick={() => { setActiveFilters({ brands: [], categories: [], minPrice: 0, maxPrice: 3000, rating: 0, inStock: false, onSale: false, ram: [], storage: [], os: [], network: [], condition: [], camera: [] }); setSearchQuery("") }}>
                                    RESET FILTERS
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quality Uplink Bar */}
            <section className="bg-muted py-12 mt-20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { title: "2-YEAR WARRANTY", sub: "Standard on all brand new flagship units", icon: <ShieldCheck className="text-primary" /> },
                        { title: "EXPRESS SHIPPING", sub: "1-hour delivery active in metro zones", icon: <Zap className="text-amber-500" /> },
                        { title: "ZERO FINANCING", sub: "Split payments over 12 months with 0% APR", icon: <TrendingUp className="text-emerald-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-6">
                            <div className="p-4 bg-white/10 rounded-[2rem]">
                                {React.cloneElement(item.icon, { size: 28 })}
                            </div>
                            <div className="flex flex-col">
                                <h4 className="text-sm font-black text-white italic uppercase tracking-widest">{item.title}</h4>
                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default ProductsContent
