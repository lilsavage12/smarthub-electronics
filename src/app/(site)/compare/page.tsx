"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeftRight, X, Minus, Plus, ShoppingCart,
    ChevronLeft, Cpu, Battery, Smartphone, Maximize,
    Trash2, Scale
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useComparison } from "@/lib/comparison-store"
import { useCart } from "@/lib/cart-store"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function ComparePage() {
    const { items, removeItem, clear } = useComparison()
    const { addItem: addToCart } = useCart()

    const specCategories = [
        { label: "Processor", key: "processor" },
        { label: "Memory/RAM", key: "ram", default: "12GB LPDDR5X" },
        { label: "Storage", key: "storage", default: "256GB NVMe" },
        { label: "Display", key: "screen", default: "AMOLED 120Hz" },
        { label: "Main Camera", key: "camera" },
        { label: "Battery", key: "battery" },
    ]

    return (
        <div className="min-h-screen bg-background pt-[120px] pb-24">
            <div className="max-w-7xl mx-auto px-6">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
                    <div className="flex flex-col gap-4">
                        <Link href="/products" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                            <ChevronLeft className="w-3 h-3" /> Back to Catalog
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter italic leading-none">
                            Unit <span className="text-primary italic">Comparison</span>
                        </h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">Hardware Benchmark & Feature Array Analysis</p>
                    </div>

                    {items.length > 0 && (
                        <Button
                            variant="ghost"
                            onClick={clear}
                            className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Purge Comparison Array
                        </Button>
                    )}
                </header>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-8 bg-muted/20 border border-dashed border-border rounded-[4rem]">
                        <div className="p-8 bg-muted rounded-full relative">
                            <Scale className="w-16 h-16 text-muted-foreground/30" />
                            <ArrowLeftRight className="w-8 h-8 text-primary absolute -bottom-2 -right-2 bg-background border border-border p-1.5 rounded-full" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-black italic uppercase font-outfit">Comparison Array Empty</h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Select up to 4 units from the catalog to begin analysis</p>
                        </div>
                        <Link href="/products">
                            <Button variant="premium" className="h-16 px-12 rounded-[2rem] text-sm font-black italic tracking-widest">
                                EXPLORE CATALOG
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto no-scrollbar -mx-6 px-6">
                        <div className="min-w-[1000px] grid" style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
                            {/* Product Headers */}
                            <div className="p-8 border-b border-border/50 sticky left-0 bg-background z-10 flex items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary rotate-180 [writing-mode:vertical-lr]">Benchmark Metrics</span>
                            </div>

                            {items.map((item) => (
                                <div key={item.id} className="p-8 border-b border-border/50 flex flex-col items-center text-center gap-6 relative group border-l border-border/20">
                                    <Button
                                        variant="glass"
                                        size="icon"
                                        className="absolute top-4 right-4 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <div className="w-40 h-40 relative bg-muted/40 rounded-3xl p-6 group-hover:scale-105 transition-transform duration-500">
                                        <Image src={item.image} alt={item.name} fill className="object-contain p-4" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.brand}</span>
                                        <h3 className="text-xl font-black italic font-outfit uppercase tracking-tighter leading-none">{item.name}</h3>
                                        <span className="text-2xl font-black mt-2">${item.price}</span>
                                    </div>
                                    <Button
                                        variant="premium"
                                        className="h-12 w-full rounded-xl text-[10px] font-black italic tracking-widest uppercase shadow-xl"
                                        onClick={() => {
                                            addToCart({ ...item, quantity: 1 })
                                            toast.success("Unit Synchronized")
                                        }}
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Authorize
                                    </Button>
                                </div>
                            ))}

                            {/* Spec Rows */}
                            {specCategories.map((cat, idx) => (
                                <React.Fragment key={cat.key}>
                                    <div className={cn(
                                        "p-8 border-b border-border/50 sticky left-0 bg-background z-10 text-xs font-black uppercase tracking-widest flex items-center",
                                        idx % 2 === 0 ? "bg-muted/5" : ""
                                    )}>
                                        {cat.label}
                                    </div>
                                    {items.map((item) => (
                                        <div key={`${item.id}-${cat.key}`} className={cn(
                                            "p-8 border-b border-border/50 border-l border-border/20 text-sm font-bold text-center flex items-center justify-center uppercase",
                                            idx % 2 === 0 ? "bg-muted/5" : ""
                                        )}>
                                            <span className="opacity-90 leading-relaxed italic">
                                                {(item.specs as any)?.[cat.key] || cat.default || "N/A"}
                                            </span>
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Tip */}
                {items.length > 0 && (
                    <div className="mt-16 p-8 bg-muted/30 border border-border/50 rounded-[3rem] text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">
                            Benchmark data provided by Hub Core v4.2 • Specifications subject to change based on SKU variant availability
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
