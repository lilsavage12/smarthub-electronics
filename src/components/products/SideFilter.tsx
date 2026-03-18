"use client"

import React, { useState } from "react"
import { Smartphone, Filter, ChevronDown, CheckCircle2, SlidersHorizontal, RefreshCw, Star, Box, Zap, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CATEGORIES = ["Smartphones", "Tablets", "Laptops", "Accessories", "Wearables"]
const RATINGS = [4, 3, 2, 1]
const RAM_OPTIONS = ["4GB", "6GB", "8GB", "12GB", "16GB", "32GB"]
const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"]
const OS_OPTIONS = ["Android", "iOS", "macOS", "iPadOS", "Windows"]
const NETWORK_OPTIONS = ["4G", "5G", "Wi-Fi 6E"]
const CONDITION_OPTIONS = ["New", "Refurbished", "Used"]
const CAMERA_OPTIONS = ["48MP", "64MP", "108MP", "200MP"]

export const SideFilter = ({ brands, activeFilters, setActiveFilters, counts }: { 
    brands: any[], 
    activeFilters: any, 
    setActiveFilters: any,
    counts?: { brands: Record<string, number>, categories: Record<string, number> }
}) => {
    const [expandedSections, setExpandedSections] = useState(["brand", "category", "price", "rating", "status", "mobile"])

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
    }

    const FilterButton = ({ active, onClick, children, count }: { active: boolean, onClick: () => void, children: React.ReactNode, count?: number }) => (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center justify-between text-[10px] font-bold py-2 px-3 rounded-xl transition-all border w-full text-left",
                active 
                    ? "bg-primary/5 border-primary/20 text-primary translate-x-1" 
                    : "bg-transparent border-transparent text-muted-foreground hover:bg-muted"
            )}
        >
            <div className="flex items-center gap-2">
                {children}
                {count !== undefined && (
                    <span className="text-[8px] text-muted-foreground opacity-50">({count})</span>
                )}
            </div>
            {active && <CheckCircle2 className="w-3 h-3" />}
        </button>
    )

    return (
        <div className="hidden lg:flex flex-col gap-8 w-64 flex-shrink-0 animate-in fade-in slide-in-from-left duration-500">
            {/* Header Hub */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex flex-col">
                    <h3 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest">
                        <SlidersHorizontal className="w-4 h-4 text-primary" />
                        Refinement
                    </h3>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Advanced Filtering Hub</span>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors h-8 px-2 flex items-center gap-1 group" onClick={resetFilters}>
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-[9px] font-black uppercase">Reset</span>
                </Button>
            </div>

            {/* Active Filters Summary */}
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                {["brands", "categories", "ram", "storage", "os", "network", "condition"].map(field => 
                    activeFilters[field]?.map((val: string) => (
                        <div key={`${field}-${val}`} className="bg-primary/10 text-primary text-[8px] font-black uppercase px-2 py-1 rounded-lg border border-primary/20 flex items-center gap-1">
                            {val}
                            <button onClick={() => toggleArrayFilter(field, val)}>×</button>
                        </div>
                    ))
                )}
            </div>

            {/* Hardware & Specs (Specialized Mobile) */}
            <div className="flex flex-col gap-4 border-b border-border pb-6">
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase group hover:text-primary transition-all text-primary"
                    onClick={() => toggleSection("mobile")}
                >
                    <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Mobile Hardware
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expandedSections.includes("mobile") ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {expandedSections.includes("mobile") && (
                    <div className="flex flex-col gap-6 mt-4 animate-in slide-in-from-top-2">
                        {/* RAM Grid */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Memory (RAM)</span>
                            <div className="grid grid-cols-3 gap-2">
                                {RAM_OPTIONS.map(ram => (
                                    <button
                                        key={ram}
                                        onClick={() => toggleArrayFilter("ram", ram)}
                                        className={cn(
                                            "h-10 rounded-lg text-[9px] font-black border transition-all",
                                            activeFilters.ram.includes(ram) ? "bg-primary border-primary text-white shadow-lg" : "bg-card border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        {ram}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Storage Grid */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Capacity</span>
                            <div className="grid grid-cols-2 gap-2">
                                {STORAGE_OPTIONS.map(cap => (
                                    <button
                                        key={cap}
                                        onClick={() => toggleArrayFilter("storage", cap)}
                                        className={cn(
                                            "h-10 rounded-lg text-[9px] font-black border transition-all",
                                            activeFilters.storage.includes(cap) ? "bg-primary border-primary text-white shadow-lg" : "bg-card border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        {cap}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* OS Selection */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Ecosystem</span>
                            <div className="flex flex-col gap-1">
                                {OS_OPTIONS.map(os => (
                                    <FilterButton 
                                        key={os} 
                                        active={activeFilters.os.includes(os)} 
                                        onClick={() => toggleArrayFilter("os", os)}
                                    >
                                        {os}
                                    </FilterButton>
                                ))}
                            </div>
                        </div>

                        {/* Network Support */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Connectivity</span>
                            <div className="flex flex-col gap-1">
                                {NETWORK_OPTIONS.map(net => (
                                    <FilterButton 
                                        key={net} 
                                        active={activeFilters.network.includes(net)} 
                                        onClick={() => toggleArrayFilter("network", net)}
                                    >
                                        {net}
                                    </FilterButton>
                                ))}
                            </div>
                        </div>

                        {/* Camera Quality */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Optics (Camera)</span>
                            <div className="flex flex-wrap gap-2">
                                {CAMERA_OPTIONS.map(cam => (
                                    <button
                                        key={cam}
                                        onClick={() => toggleArrayFilter("camera", cam)}
                                        className={cn(
                                            "h-10 px-4 rounded-lg text-[9px] font-black border transition-all",
                                            activeFilters.camera?.includes(cam) ? "bg-primary border-primary text-white shadow-lg" : "bg-card border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        {cam}+
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Category Section */}
            <div className="flex flex-col gap-4 border-b border-border pb-6">
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase group hover:text-primary transition-all"
                    onClick={() => toggleSection("category")}
                >
                    <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3" />
                        Categories
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expandedSections.includes("category") ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {expandedSections.includes("category") && (
                    <div className="flex flex-col gap-1 mt-2">
                        {CATEGORIES.map((cat) => (
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

            {/* Brand Section */}
            <div className="flex flex-col gap-4 border-b border-border pb-6">
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase group hover:text-primary transition-all"
                    onClick={() => toggleSection("brand")}
                >
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-3 h-3" />
                        Manufacturers
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expandedSections.includes("brand") ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {expandedSections.includes("brand") && (
                    <div className="flex flex-col gap-1 mt-2">
                        {brands.map((brand) => (
                            <FilterButton 
                                key={brand.slug} 
                                active={activeFilters.brands.includes(brand.slug)} 
                                onClick={() => toggleArrayFilter("brands", brand.slug)}
                                count={counts?.brands?.[brand.slug]}
                            >
                                {brand.name}
                            </FilterButton>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Hub */}
            <div className="flex flex-col gap-4 border-b border-border pb-6">
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase group hover:text-primary transition-all"
                    onClick={() => toggleSection("price")}
                >
                    <div className="flex items-center gap-2">
                        <Filter className="w-3 h-3" />
                        Price Range
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expandedSections.includes("price") ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {expandedSections.includes("price") && (
                    <div className="flex flex-col gap-4 mt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[8px] font-black text-muted-foreground uppercase ml-1">Min USD</span>
                                <input 
                                    type="number" 
                                    value={activeFilters.minPrice}
                                    onChange={(e) => setActiveFilters({ ...activeFilters, minPrice: parseInt(e.target.value) || 0 })}
                                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-black w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[8px] font-black text-muted-foreground uppercase ml-1">Max USD</span>
                                <input 
                                    type="number" 
                                    value={activeFilters.maxPrice}
                                    onChange={(e) => setActiveFilters({ ...activeFilters, maxPrice: parseInt(e.target.value) || 0 })}
                                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-black w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Condition Section */}
            <div className="flex flex-col gap-4 border-b border-border pb-6">
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase group hover:text-primary transition-all"
                    onClick={() => toggleSection("condition")}
                >
                    <div className="flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        Condition
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expandedSections.includes("condition") ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {expandedSections.includes("condition") && (
                    <div className="flex flex-col gap-1 mt-2">
                        {CONDITION_OPTIONS.map(cond => (
                            <FilterButton 
                                key={cond} 
                                active={activeFilters.condition.includes(cond)} 
                                onClick={() => toggleArrayFilter("condition", cond)}
                            >
                                {cond}
                            </FilterButton>
                        ))}
                    </div>
                )}
            </div>

            {/* Ratings Grid */}
            <div className="flex flex-col gap-4 border-b border-border pb-6">
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase group hover:text-primary transition-all"
                    onClick={() => toggleSection("rating")}
                >
                    <div className="flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        Customer Verdict
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expandedSections.includes("rating") ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {expandedSections.includes("rating") && (
                    <div className="flex flex-col gap-2 mt-2">
                        {RATINGS.map((rate) => (
                            <button
                                key={rate}
                                onClick={() => setActiveFilters({ ...activeFilters, rating: rate })}
                                className={cn(
                                    "flex items-center justify-between text-[10px] font-bold py-2 px-3 rounded-xl transition-all border",
                                    activeFilters.rating === rate 
                                        ? "bg-amber-500/5 border-amber-500/20 text-amber-500 translate-x-1" 
                                        : "bg-transparent border-transparent text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <div className="flex items-center gap-1.5">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={8} fill={i < rate ? "currentColor" : "none"} className={i < rate ? "text-amber-500" : "text-muted-foreground/30"} />
                                        ))}
                                    </div>
                                    <span>{rate}+ Stars</span>
                                </div>
                                {activeFilters.rating === rate && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Operational Status */}
            <div className="flex flex-col gap-4 border-b border-border pb-6">
                <button
                    className="flex items-center justify-between font-black text-[10px] tracking-widest uppercase group hover:text-primary transition-all"
                    onClick={() => toggleSection("status")}
                >
                    <div className="flex items-center gap-2">
                        <Box className="w-3 h-3" />
                        Availability & Offers
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expandedSections.includes("status") ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {expandedSections.includes("status") && (
                    <div className="flex flex-col gap-2 mt-2">
                        <button
                            onClick={() => setActiveFilters({ ...activeFilters, inStock: !activeFilters.inStock })}
                            className={cn(
                                "flex items-center gap-3 text-[10px] font-bold py-2 px-3 rounded-xl transition-all border",
                                activeFilters.inStock 
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" 
                                    : "bg-transparent border-transparent text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Box className="w-3 h-3" />
                            In Stock Only
                        </button>
                        <button
                            onClick={() => setActiveFilters({ ...activeFilters, onSale: !activeFilters.onSale })}
                            className={cn(
                                "flex items-center gap-3 text-[10px] font-bold py-2 px-3 rounded-xl transition-all border",
                                activeFilters.onSale 
                                    ? "bg-red-500/5 border-red-500/20 text-red-500" 
                                    : "bg-transparent border-transparent text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Zap className="w-3 h-3" />
                            Flash Sale & Deals
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-[2rem] mt-4 border border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <Smartphone className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-black text-[11px] uppercase tracking-widest">Need help choosing?</h4>
                <p className="text-[9px] font-bold text-muted-foreground mt-2 mb-4 leading-relaxed uppercase opacity-60">Try our AI recommendations tool to find your perfect match.</p>
                <Button variant="premium" className="w-full text-[9px] h-10 font-black italic tracking-widest uppercase group-hover:scale-105 transition-transform">Ask AI Assistant</Button>
            </div>
        </div>
    )
}

