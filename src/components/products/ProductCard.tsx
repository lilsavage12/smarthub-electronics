"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-store"
import { toast } from "react-hot-toast"

const slugify = (text: string) => {
    if (!text) return 'product'
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
        .replace(/\-\ClientHome-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')
}

function getSpecs(specs: any): any {
    if (!specs) return {}
    if (typeof specs === 'object') return specs
    if (typeof specs === 'string') {
        try { return JSON.parse(specs) } catch { return {} }
    }
    return {}
}

export const ProductCard = ({ product, viewMode = "grid", dark = false }: { product: any; viewMode?: "grid" | "list"; dark?: boolean }) => {
    const { addItem, items } = useCart()
    const [selectedSize, setSelectedSize] = useState("L")
    const [isHovered, setIsHovered] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalQty, setModalQty] = useState(1)

    const price = useMemo(() => {
        const p = Number(product.price || 0)
        if (p > 0) return p
        const variants = product.variants || []
        if (variants.length > 0) {
            const prices = variants.map((v: any) => Number(v.price || 0)).filter((v: any) => v > 0)
            if (prices.length > 0) return Math.min(...prices)
        }
        return 2500
    }, [product])

    const originalPrice = product.originalPrice && Number(product.originalPrice) > price ? Number(product.originalPrice) : null
    const stock = typeof product.stock === 'number' ? product.stock : 10
    const isOutOfStock = stock <= 0
    const isLowStock = !isOutOfStock && stock < 10

    const badge = isOutOfStock
        ? { label: "SOLD OUT", cls: "bg-[#e10600]" }
        : isLowStock
            ? { label: `LOW STOCK: ${stock} LEFT`, cls: "bg-amber-600 animate-pulse text-white font-black" }
            : (product.isFeatured || product.isHot)
                ? { label: "BESTSELLER", cls: "bg-[#e10600]" }
                : product.isNew
                    ? { label: "NEW", cls: "bg-[#e10600] text-white" }
                    : null

    const handleQuickAdd = (size: string = selectedSize, qty: number = 1) => {
        if (isOutOfStock) {
            toast.error(`${product.name} is currently out of stock!`, {
                style: { background: '#101012', color: '#fff', border: '1px solid #333' }
            })
            return
        }
        const existing = items.find(i => i.id === `${product.id}-${size}` || i.id === product.id)
        const cur = existing ? existing.quantity : 0
        if (cur + qty > stock) {
            toast.error(`Cannot add more. Only ${stock} units available in stock.`, {
                style: { background: '#101012', color: '#fff', border: '1px solid #333' }
            })
            return
        }
        addItem({
            id: `${product.id}-${size}`,
            productId: product.id,
            name: product.name,
            price,
            originalPrice: originalPrice || undefined,
            quantity: qty,
            image: product.image,
            stock,
            variant: size,
            category: product.category,
            brand: product.brand,
        }, undefined)
        toast.success(`Added ${product.name} (${size}) to Bag!`, {
            style: { background: '#101012', color: '#fff', border: '1px solid #333' }
        })
        setIsModalOpen(false)
    }

    return (
        <>
            <div
                className="group relative flex flex-col bg-[#0c0c0e] border border-white/10 transition-all duration-300 hover:border-[#e10600] shadow-sm select-none cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
            >
                {/* Square Image Container (aspect-square) */}
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="relative aspect-square w-full bg-[#141416] overflow-hidden"
                >
                    <Image
                        src={product.image || "/images/f1/media_1795204502659_c168030c.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                        {badge && (
                            <span className={cn(
                                "px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] font-f1 text-white shadow-lg",
                                badge.cls
                            )}>
                                {badge.label}
                            </span>
                        )}
                        {originalPrice && !isOutOfStock && (
                            <span className="bg-white text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 font-f1">
                                SALE
                            </span>
                        )}
                    </div>

                    {/* Quick Size Select Overlay on Hover at Bottom */}
                    <div className={cn(
                        "absolute inset-x-0 bottom-0 bg-black/95 border-t border-white/10 p-3 flex flex-col gap-1.5 z-20 transition-all duration-300",
                        "group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto",
                        isHovered ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"
                    )}>
                        {isOutOfStock ? (
                            <div className="text-center py-1 text-[10px] font-black uppercase tracking-widest text-[#e10600] font-f1">
                                CURRENTLY OUT OF STOCK
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest font-f1">
                                    <span className="text-white/50">SELECT SIZE</span>
                                    <span className="text-[#e10600]">ADD TO CART</span>
                                </div>
                                <div className="flex gap-1">
                                    {["S", "M", "L", "XL", "XXL"].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedSize(s)
                                                handleQuickAdd(s, 1)
                                            }}
                                            className={cn(
                                                "flex-1 h-7 text-[10px] font-black uppercase tracking-widest border transition-colors font-f1 cursor-pointer",
                                                selectedSize === s 
                                                    ? "bg-[#e10600] border-[#e10600] text-white" 
                                                    : "border-white/15 text-white/70 hover:border-white/40 bg-black/50"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Info row */}
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="p-4 flex items-end justify-between gap-3"
                >
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 font-f1">
                            {product.brand || product.category || "SCUDERIA FERRARI"}
                        </span>
                        <h3 className="text-sm font-black uppercase tracking-[0.04em] text-white line-clamp-1 group-hover:text-[#e10600] transition-colors font-f1">
                            {product.name}
                        </h3>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest font-f1">
                            {getSpecs(product.specs).colour || 'ROSSO RED / WHITE'}
                        </span>
                    </div>

                    <div className="shrink-0 text-right font-f1">
                        {originalPrice && (
                            <span className="text-[11px] font-bold text-white/40 line-through mr-2 font-f1">
                                Ksh {originalPrice.toLocaleString()}
                            </span>
                        )}
                        <span className="text-sm font-black text-white whitespace-nowrap font-f1">
                            Ksh {price.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Preview Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-[#111114] border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 z-10 shadow-2xl"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
                            >
                                <X size={16} />
                            </button>

                            {/* Modal Left Image */}
                            <div className="relative aspect-[4/5] md:aspect-auto md:h-full bg-[#161618] border-b md:border-b-0 md:border-r border-white/10 min-h-[320px]">
                                <Image
                                    src={product.image || "/images/f1/media_1795204502659_c168030c.jpg"}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>

                            {/* Modal Right Info */}
                            <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00d4aa] block mb-1 font-f1">
                                            {product.brand || "OFFICIAL ISSUE"}
                                        </span>
                                        <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-[0.04em] leading-none font-f1">
                                            {product.name}
                                        </h2>
                                        <div className="mt-2 flex items-baseline gap-2">
                                            {originalPrice && (
                                                <span className="text-sm font-bold text-white/40 line-through font-f1">
                                                    Ksh {originalPrice.toLocaleString()}
                                                </span>
                                            )}
                                            <span className="text-xl font-black text-[#e10600] font-f1">
                                                Ksh {price.toLocaleString()}
                                            </span>
                                        </div>

                                        {isLowStock && (
                                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest font-f1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                                LOW STOCK: ONLY {stock} UNITS AVAILABLE
                                            </div>
                                        )}
                                        {isOutOfStock && (
                                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[10px] font-black uppercase tracking-widest font-f1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                CURRENTLY OUT OF STOCK
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-white/60 leading-relaxed">
                                        {product.description || "The paddock classic in authentic team colours. Premium breathable piqué blend with sponsors and badges embroidered."}
                                    </p>

                                    {/* Size Selector */}
                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/50 font-f1">
                                            <span>SELECT SIZE</span>
                                            <span className="text-white/40">{getSpecs(product.specs).colour || 'AUTHENTIC ISSUE'}</span>
                                        </div>
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {["S", "M", "L", "XL", "XXL"].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setSelectedSize(s)}
                                                    className={cn(
                                                        "h-10 text-xs font-black uppercase tracking-widest border transition-all font-f1 cursor-pointer",
                                                        selectedSize === s
                                                            ? "bg-[#e10600] border-[#e10600] text-white shadow-lg"
                                                            : "border-white/15 text-white/70 hover:border-white/40 bg-black/40"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="flex items-center gap-4 pt-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 font-f1">QTY</span>
                                        <div className="flex items-center border border-white/15 bg-black/40">
                                            <button
                                                type="button"
                                                onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                                                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white border-r border-white/10"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="w-10 text-center text-xs font-bold font-mono text-white">
                                                {modalQty}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={modalQty >= stock || isOutOfStock}
                                                onClick={() => setModalQty(Math.min(stock, modalQty + 1))}
                                                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white border-l border-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Product Bullet Points */}
                                    <ul className="space-y-1.5 pt-2 text-[11px] text-white/50">
                                        {(getSpecs(product.specs).details || [
                                            "White contrast side panels and cuff trim",
                                            "Breathable piqué cotton blend construction",
                                            "Official sponsor embroidery and shields"
                                        ]).map((detail: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="w-1 h-1 bg-[#e10600]" />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        disabled={isOutOfStock}
                                        onClick={() => handleQuickAdd(selectedSize, modalQty)}
                                        className="w-full bg-[#e10600] hover:bg-[#c90500] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-[0.2em] py-3.5 flex items-center justify-center gap-2 transition-colors font-f1 cursor-pointer shadow-xl"
                                    >
                                        <span>{isOutOfStock ? "CURRENTLY OUT OF STOCK" : `ADD TO CART · KSH ${(price * modalQty).toLocaleString()}`}</span>
                                    </button>
                                    <p className="text-[10px] text-center text-white/30 uppercase tracking-widest font-f1">
                                        DELIVERY FEES QUOTED SEPARATELY
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
