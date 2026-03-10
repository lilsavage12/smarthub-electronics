"use client"

import React, { useState } from "react"
import { Smartphone, Filter, ChevronDown, CheckCircle2, SlidersHorizontal, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export const SideFilter = ({ brands, activeFilters, setActiveFilters }: { brands: any[], activeFilters: any, setActiveFilters: any }) => {
    const [expandedSections, setExpandedSections] = useState(["brand", "price", "specs"])

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        )
    }

    const toggleBrand = (brandSlug: string) => {
        const currentBrands = activeFilters.brands || []
        const nextBrands = currentBrands.includes(brandSlug)
            ? currentBrands.filter((b: string) => b !== brandSlug)
            : [...currentBrands, brandSlug]
        setActiveFilters({ ...activeFilters, brands: nextBrands })
    }

    const resetFilters = () => {
        setActiveFilters({ brands: [], priceRange: "all", specs: [] })
    }

    return (
        <div className="hidden lg:flex flex-col gap-8 w-64 flex-shrink-0 animate-in fade-in slide-in-from-left duration-500">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    Filter By
                </h3>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors h-8 px-2 flex items-center gap-1" onClick={resetFilters}>
                    <RefreshCw className="w-3 h-3" />
                    Reset
                </Button>
            </div>

            {/* Brand Section */}
            <div className="flex flex-col gap-4 border-b border-border pb-6">
                <button
                    className="flex items-center justify-between font-bold text-sm tracking-wider uppercase group hover:text-primary transition-colors"
                    onClick={() => toggleSection("brand")}
                >
                    Brand
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes("brand") ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {expandedSections.includes("brand") && (
                    <div className="flex flex-col gap-2.5 mt-2">
                        {brands.map((brand) => (
                            <button
                                key={brand.slug}
                                onClick={() => toggleBrand(brand.slug)}
                                className={`flex items-center justify-between text-sm py-1.5 px-3 rounded-lg transition-all border ${activeFilters.brands?.includes(brand.slug) ? "bg-primary/10 border-primary text-primary font-bold translate-x-1" : "bg-transparent border-transparent text-muted-foreground hover:bg-muted"}`}
                            >
                                <span>{brand.name}</span>
                                {activeFilters.brands?.includes(brand.slug) && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Section */}
            <div className="flex flex-col gap-4 border-b border-border pb-6">
                <button
                    className="flex items-center justify-between font-bold text-sm tracking-wider uppercase group hover:text-primary transition-colors"
                    onClick={() => toggleSection("price")}
                >
                    Price Range
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes("price") ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {expandedSections.includes("price") && (
                    <div className="flex flex-col gap-2.5 mt-2">
                        {["all", "0-500", "500-1000", "1000-1500", "1500+"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setActiveFilters({ ...activeFilters, priceRange: range })}
                                className={`text-sm text-left py-1.5 px-3 rounded-lg transition-all ${activeFilters.priceRange === range ? "bg-primary/10 text-primary font-bold border border-primary translate-x-1" : "text-muted-foreground hover:bg-muted border border-transparent"}`}
                            >
                                {range === "all" ? "All Prices" : range === "1500+" ? "Over $1500" : `$${range.replace("-", " - $")}`}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Specs Section */}
            <div className="flex flex-col gap-4 border-b border-border pb-6">
                <button
                    className="flex items-center justify-between font-bold text-sm tracking-wider uppercase group hover:text-primary transition-colors"
                    onClick={() => toggleSection("specs")}
                >
                    Connectivity
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes("specs") ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {expandedSections.includes("specs") && (
                    <div className="flex flex-col gap-2.5 mt-2">
                        {["5G Ready", "4G LTE", "Satellite Support"].map((spec) => (
                            <button
                                key={spec}
                                className="flex items-center gap-3 text-sm text-muted-foreground hover:bg-muted py-1.5 px-3 rounded-lg transition-all"
                            >
                                <div className="w-4 h-4 border border-border rounded flex items-center justify-center group-hover:border-primary transition-colors">
                                    {/* Checkbox Placeholder */}
                                </div>
                                {spec}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-3xl mt-4 border border-primary/20">
                <Smartphone className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-bold text-sm">Need help choosing?</h4>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Try our AI recommendations tool to find your perfect match.</p>
                <Button variant="premium" size="sm" className="w-full text-xs h-9">Ask AI Assistant</Button>
            </div>
        </div>
    )
}
