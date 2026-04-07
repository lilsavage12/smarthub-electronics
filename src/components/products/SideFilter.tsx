"use client"

import React, { useState } from "react"
import { Smartphone, Filter, ChevronDown, CheckCircle2, SlidersHorizontal, RefreshCw, Star, Box, Zap, Tag, Coins, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const RATINGS = [4, 3, 2, 1]
const RAM_OPTIONS = ["4GB", "6GB", "8GB", "12GB", "16GB", "32GB"]
const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"]

export const SideFilter = ({ brands = [], activeFilters, setActiveFilters, counts, isMobile = false }: { 
    brands?: any[], 
    activeFilters: any, 
    setActiveFilters: any,
    counts?: { brands: Record<string, number>, categories: Record<string, number> },
    isMobile?: boolean
}) => {
    const [expandedSections, setExpandedSections] = useState(["brand", "category", "price", "mobile"])

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
            maxPrice: 1000000, 
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
                    <span className={cn("text-[9px] font-bold opacity-40 ml-1", active ? "text-white" : "text-muted-foreground")}>({count})</span>
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

            {/* Section: Dynamic Brands */}
            <div className="flex flex-col gap-5" suppressHydrationWarning>
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase  group"
                    onClick={() => toggleSection("brand")}
                >
                    <div suppressHydrationWarning className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        Brands
                    </div>
                </button>
                {expandedSections.includes("brand") && (
                    <div className="flex flex-wrap gap-2">
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
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase "
                    onClick={() => toggleSection("category")}
                >
                    <div suppressHydrationWarning className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        Categories
                    </div>
                </button>
                {expandedSections.includes("category") && (
                    <div className="flex flex-col gap-2">
                        {Object.keys(counts?.categories || {}).map((cat) => (
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
                    <div className="grid grid-cols-2 gap-3 mt-1" suppressHydrationWarning>
                         <div className="flex flex-col gap-2">
                            <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Min</span>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={activeFilters.minPrice}
                                    onChange={(e) => setActiveFilters({ ...activeFilters, minPrice: parseInt(e.target.value) || 0 })}
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
                                    onChange={(e) => setActiveFilters({ ...activeFilters, maxPrice: parseInt(e.target.value) || 0 })}
                                    className="h-12 bg-muted/20 border border-border/50 rounded-xl px-4 text-[10px] font-black w-full outline-none focus:border-primary transition-all pr-10"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-30 ">KSh</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}
