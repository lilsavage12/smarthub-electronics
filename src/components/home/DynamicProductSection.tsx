"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { ProductCard } from "@/components/products/ProductCard"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DynamicProductSectionProps {
    title: string
    products: any[]
    type: "category" | "brand"
    source: string
    limit?: number
    sort?: string
}

export function DynamicProductSection({ 
    title, 
    products, 
    type, 
    source, 
    limit = 12,
    sort = "newest"
}: DynamicProductSectionProps) {
    if (!products || products.length === 0) return null

    // 1. Filter products by source
    let filtered = products.filter(p => {
        const pSource = (source || "").toLowerCase()
        if (type === "category") {
            const cat = (p.category || "").toLowerCase()
            return cat === pSource || cat === `${pSource}s` || `${cat}s` === pSource
        } else {
            return (p.brand || "").toLowerCase() === pSource
        }
    })

    // 2. Apply Sorting
    const sorted = [...filtered].sort((a, b) => {
        switch(sort) {
            case 'price_asc': return (a.price || 0) - (b.price || 0)
            case 'price_desc': return (b.price || 0) - (a.price || 0)
            case 'stock_high': return (b.stock || 0) - (a.stock || 0)
            case 'newest':
            default:
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        }
    })

    // 3. Apply Limit (Enforcing 2 rows max across breakpoints)
    // At lg (4 cols) -> 8 items
    // At md (3 cols) -> 6 items
    // At sm (2 cols) -> 4 items
    // We responsive-ly slice the data using CSS or JS? 
    // JS is safer for "2 rows" across different screens if we want to be exact.
    
    const displayProducts = sorted.slice(0, limit)
    if (displayProducts.length === 0) return null
    
    const hasMore = sorted.length > limit

    const seeAllLink = type === "category" 
        ? `/products?categories=${encodeURIComponent(source)}`
        : `/products?brand=${encodeURIComponent(source)}`

    return (
        <section suppressHydrationWarning className="py-4 lg:py-8 relative overflow-hidden">
            <div suppressHydrationWarning className="container mx-auto px-4 md:px-8 flex flex-col gap-10">
                <div suppressHydrationWarning className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/10 pb-8">
                    <div suppressHydrationWarning className="flex flex-col gap-4">
                        <div suppressHydrationWarning className="flex items-center gap-3">
                            <div className="w-8 h-px bg-primary/40" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary  leading-none">
                                Feature {type === 'brand' ? 'Spotlight' : 'Collection'} 
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black  tracking-tighter uppercase leading-none text-foreground">
                            {title}
                        </h2>
                    </div>
                    
                    <Link 
                        href={seeAllLink}
                        className="group flex items-center gap-4 px-8 py-4 bg-muted/20 border border-border/40 rounded-full hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/5"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">Explore All</span>
                        <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>

                <div suppressHydrationWarning className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                    {displayProducts.map((product, idx) => (
                        <motion.div
                            key={product.id || idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (idx % 4) * 0.1 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                    
                    {/* Responsive Empty State Call-to-Action if very few products */}
                    {displayProducts.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-4 bg-muted/10 rounded-[3rem] border-2 border-dashed border-border/40">
                             <Sparkles className="text-primary/20" size={48} />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">More products coming soon to this section</span>
                        </div>
                    )}
                </div>

                {hasMore && (
                    <div className="flex justify-center mt-6">
                        <Link 
                            href={seeAllLink}
                            className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                        >
                            + {sorted.length - displayProducts.length} more items available <ArrowRight size={10} />
                        </Link>
                    </div>
                )}
            </div>
            
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 opacity-30" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 opacity-30" />
        </section>
    )
}
