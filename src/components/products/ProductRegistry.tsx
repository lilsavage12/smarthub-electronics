"use client"

import React, { useState } from "react"
import { ProductCard } from "@/components/products/ProductCard"
import { cn } from "@/lib/utils"

const CATEGORIES = ["ALL GEAR", "JACKETS", "SHIRTS", "POLOS"]

export function ProductRegistry({ initialProducts = [] }: { initialProducts: any[], cmsData?: any }) {
    const [activeTab, setActiveTab] = useState("ALL GEAR")

    const filtered = activeTab === "ALL GEAR"
        ? initialProducts
        : initialProducts.filter(p => p.category?.toUpperCase() === activeTab)

    return (
        <div className="bg-[#0c0c0e] min-h-screen py-16 px-6 md:px-12 text-white">
            <div className="max-w-[1440px] mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-3 border-b border-white/10 pb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block">
                        THE GRID
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
                        ALL GEAR & <span className="text-[#e10600]">COLLECTIONS</span>
                    </h1>
                    <p className="text-xs text-white/50 max-w-md mt-2">
                        Official Formula One inspired jackets, polos and team streetwear. Available in sizes S to XXL with nationwide delivery across Kenya.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={cn(
                                "px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] border transition-colors",
                                activeTab === cat
                                    ? "bg-[#e10600] border-[#e10600] text-white"
                                    : "border-white/10 text-white/60 hover:border-[#e10600] hover:text-white bg-black/30"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filtered.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    )
}
