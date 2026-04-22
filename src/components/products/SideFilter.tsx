"use client"

import React, { useState, useRef, useCallback } from "react"
import { Smartphone, Filter, ChevronDown, CheckCircle2, SlidersHorizontal, RefreshCw, Star, Box, Zap, Tag, Coins, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const RATINGS = [4, 3, 2, 1]
const RAM_OPTIONS = ["4GB", "6GB", "8GB", "12GB", "16GB", "32GB"]
const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"]

export const SideFilter = ({ brands = [], categories = [], activeFilters, setActiveFilters, counts, isMobile = false, maxProductPrice = 1000000 }: {
    brands?: any[],
    categories?: string[],
    activeFilters: any,
    setActiveFilters: any,
    counts?: { brands: Record<string, number>, categories: Record<string, number> },
    isMobile?: boolean,
    maxProductPrice?: number
}) => {
    const [expandedSections, setExpandedSections] = useState(["sort", "brand", "category", "price", "mobile"])

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        )
    }

    const toggleArrayFilter = (field: string, value: string) => {
        const current = activeFilters[field] || []
        const next = current.includes(value)
            ? current.filter((v: string) => v !== value)
            : [...current, value]
        setActiveFilters({ ...activeFilters, [field]: next })
    }

    const resetFilters = () => {
        setActiveFilters({
            brands: [],
            categories: [],
            minPrice: 0,
            maxPrice: maxProductPrice,
            rating: 0,
            inStock: false,
            onSale: false,
            ram: [],
            storage: [],
        })
    }

    const FilterButton = ({ active, onClick, children, count }: { active: boolean, onClick: () => void, children: React.ReactNode, count?: number }) => (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center justify-between text-[11px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all border w-full text-left ",
                active
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
            )}
        >
            <div suppressHydrationWarning className="flex items-center gap-2">
                {children}
                {count !== undefined && (
                    <span className={cn("text-[8px] font-bold opacity-40 ml-1", active ? "text-white" : "text-muted-foreground")}>({count})</span>
                )}
            </div>
            {active && <CheckCircle2 className="w-3.5 h-3.5" />}
        </button>
    )

    return (
        <div
            suppressHydrationWarning
            className={cn(
                "flex flex-col gap-10 animate-in fade-in duration-500",
                isMobile ? "pb-20" : "slide-in-from-left"
            )}
        >
            {/* Header: Filters */}
            {!isMobile && (
                <div className="flex items-center justify-between border-b border-border pb-6 opacity-80">
                    <div className="flex flex-col">
                        <h3 className="font-black flex items-center gap-3 text-xs uppercase tracking-[0.2em]  text-primary">
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                        </h3>
                    </div>
                    <button
                        onClick={resetFilters}
                        className="p-2 bg-muted/40 rounded-xl hover:bg-muted transition-all group"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            )}

            {/* Section: Sort By */}
            <div className="flex flex-col gap-5" suppressHydrationWarning>
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase group"
                    onClick={() => toggleSection("sort")}
                >
                    <div suppressHydrationWarning className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        Sort Catalog
                    </div>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", expandedSections.includes("sort") ? "rotate-180" : "")} />
                </button>
                {expandedSections.includes("sort") && (
                    <div className="flex flex-col gap-2 p-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-b-xl">
                        {[
                            { id: "price_desc", label: "PRICE: HIGH TO LOW" },
                            { id: "price_asc", label: "PRICE: LOW TO HIGH" },
                            { id: "newest", label: "NEWEST ARRIVALS" },
                            { id: "popularity", label: "POPULARITY" },
                            { id: "discount", label: "DISCOUNTS" }
                        ].map((opt) => (
                            <FilterButton
                                key={opt.id}
                                active={activeFilters.sortBy === opt.id}
                                onClick={() => setActiveFilters({ ...activeFilters, sortBy: opt.id })}
                            >
                                {opt.label}
                            </FilterButton>
                        ))}
                    </div>
                )}
            </div>

            {/* Section: Dynamic Brands */}
            <div className="flex flex-col gap-5" suppressHydrationWarning>
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase group"
                    onClick={() => toggleSection("brand")}
                >
                    <div suppressHydrationWarning className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        Brands
                    </div>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", expandedSections.includes("brand") ? "rotate-180" : "")} />
                </button>
                {expandedSections.includes("brand") && (
                    <div className="flex flex-wrap gap-2 p-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-b-xl">
                        {brands.map((brandName) => {
                            const name = typeof brandName === 'string' ? brandName : brandName.name
                            const isActive = activeFilters.brands.includes(name)
                            return (
                                <button
                                    key={name}
                                    onClick={() => toggleArrayFilter("brands", name)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                                        isActive
                                            ? "bg-primary border-primary text-white shadow-xl shadow-primary/20"
                                            : "bg-muted/10 border-border/50 text-muted-foreground hover:border-primary/40"
                                    )}
                                >
                                    {name} {counts?.brands?.[name.toLowerCase()] ? `(${counts?.brands?.[name.toLowerCase()]})` : ''}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Section: Categories */}
            <div className="flex flex-col gap-5" suppressHydrationWarning>
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase group"
                    onClick={() => toggleSection("category")}
                >
                    <div suppressHydrationWarning className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        Categories
                    </div>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", expandedSections.includes("category") ? "rotate-180" : "")} />
                </button>
                {expandedSections.includes("category") && (
                    <div className="flex flex-col gap-2 p-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-b-xl">
                        {categories.map((cat) => (
                            <FilterButton
                                key={cat}
                                active={activeFilters.categories.includes(cat)}
                                onClick={() => toggleArrayFilter("categories", cat)}
                                count={counts?.categories?.[cat]}
                            >
                                {cat}
                            </FilterButton>
                        ))}
                    </div>
                )}
            </div>

            {/* Section: Price Orchestration */}
            <div className="flex flex-col gap-5">
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase "
                    onClick={() => toggleSection("price")}
                >
                    <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-primary" />
                        Price (KSh)
                    </div>
                </button>
                {expandedSections.includes("price") && (
                    <div className="flex flex-col gap-6" suppressHydrationWarning>
                        {/* Dual-Handle Range Slider */}
                        <div className="flex flex-col gap-3 px-1">
                            <div className="relative h-5 flex items-center" suppressHydrationWarning>
                                {/* Track background */}
                                <div className="absolute w-full h-1.5 rounded-full bg-muted" />
                                {/* Active range fill */}
                                <div
                                    className="absolute h-1.5 rounded-full bg-primary"
                                    style={{
                                        left: `${(activeFilters.minPrice / maxProductPrice) * 100}%`,
                                        right: `${100 - (Math.min(activeFilters.maxPrice, maxProductPrice) / maxProductPrice) * 100}%`
                                    }}
                                />
                                {/* Min handle */}
                                <input
                                    type="range"
                                    min="0"
                                    max={maxProductPrice}
                                    step={Math.max(1000, Math.floor(maxProductPrice / 100))}
                                    value={activeFilters.minPrice}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value)
                                        if (val < activeFilters.maxPrice) {
                                            setActiveFilters({ ...activeFilters, minPrice: val })
                                        }
                                    }}
                                    className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
                                />
                                {/* Max handle */}
                                <input
                                    type="range"
                                    min="0"
                                    max={maxProductPrice}
                                    step={Math.max(1000, Math.floor(maxProductPrice / 100))}
                                    value={Math.min(activeFilters.maxPrice, maxProductPrice)}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value)
                                        if (val > activeFilters.minPrice) {
                                            setActiveFilters({ ...activeFilters, maxPrice: val })
                                        }
                                    }}
                                    className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
                                />
                            </div>
                            <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase opacity-40">
                                <span>0 KSh</span>
                                <span>{Math.round(maxProductPrice).toLocaleString()} KSh</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-1" suppressHydrationWarning>
                            <div className="flex flex-col gap-2">
                                <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Min</span>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={activeFilters.minPrice}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0
                                            if (val < activeFilters.maxPrice) setActiveFilters({ ...activeFilters, minPrice: val })
                                        }}
                                        className="h-12 bg-muted/20 border border-border/50 rounded-xl px-4 text-[10px] font-black w-full outline-none focus:border-primary transition-all pr-10"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-30 ">KSh</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Max</span>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={activeFilters.maxPrice}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0
                                            if (val > activeFilters.minPrice) setActiveFilters({ ...activeFilters, maxPrice: val })
                                        }}
                                        className="h-12 bg-muted/20 border border-border/50 rounded-xl px-4 text-[10px] font-black w-full outline-none focus:border-primary transition-all pr-10"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-30 ">KSh</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}
