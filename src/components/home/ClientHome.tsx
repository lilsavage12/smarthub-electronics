"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, MessageCircle, X, Check, Plus, Minus, Eye, AlertTriangle } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

function getSpecs(specs: any): any {
    if (!specs) return {}
    if (typeof specs === 'object') return specs
    if (typeof specs === 'string') {
        try { return JSON.parse(specs) } catch { return {} }
    }
    return {}
}

/* --- Product Card ---------------------------------------------- */
function ProductCard({ product }: { product: any }) {
    const [selectedSize, setSelectedSize] = useState("L")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [modalQty, setModalQty] = useState(1)
    const { addItem, items } = useCart()

    const price = Number(product.price || 2500)
    const originalPrice = product.originalPrice && Number(product.originalPrice) > price ? Number(product.originalPrice) : null
    const isNew = product.isNew
    const isBestseller = product.isFeatured
    const stock = typeof product.stock === 'number' ? product.stock : 10
    const isOutOfStock = stock <= 0
    const isLowStock = !isOutOfStock && stock < 10

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
            category: product.category,
            brand: product.brand,
            variant: size,
            stock
        })
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
                        {isOutOfStock ? (
                            <span className="bg-[#e10600] text-white text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 font-f1 shadow-lg">
                                SOLD OUT
                            </span>
                        ) : isLowStock ? (
                            <span className="bg-amber-600 text-white text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 font-f1 shadow-lg flex items-center gap-1.5 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                LOW STOCK: {stock} LEFT
                            </span>
                        ) : isBestseller ? (
                            <span className="bg-[#e10600] text-white text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 font-f1">
                                BESTSELLER
                            </span>
                        ) : isNew ? (
                            <span className="bg-[#e10600] text-white text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 font-f1">
                                NEW
                            </span>
                        ) : null}
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

                {/* Meta details */}
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="p-4 flex items-end justify-between gap-3"
                >
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 font-f1">
                            {product.brand || 'SCUDERIA FERRARI'}
                        </span>
                        <h3 className="text-sm font-black uppercase tracking-tight text-white line-clamp-1 group-hover:text-[#e10600] transition-colors font-f1">
                            {product.name}
                        </h3>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest font-f1">
                            {getSpecs(product.specs).colour || 'ROSSO RED / WHITE'}
                        </span>
                    </div>

                    <div className="text-right shrink-0">
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

            {/* PRODUCT DETAIL MODAL */}
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
                                            {product.brand || 'SCUDERIA FERRARI'}
                                        </span>
                                        <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight leading-none font-f1">
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
                                            <span className="text-white/40">{getSpecs(product.specs).colour || 'ROSSO RED / WHITE'}</span>
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

/* --- Hero Section (Exact Match to Reference Layout & Bebas Neue) ---------- */
function HeroSection() {
    return (
        <section className="relative min-h-[85vh] flex flex-col justify-center bg-[#0c0c0e] border-b border-white/5 overflow-hidden pt-20 md:pt-24 pb-8 md:pb-12">
            <div className="max-w-[1280px] w-full mx-auto px-6 sm:px-8">

                {/* Top Coordinates Eyebrow in Space Mono */}
                <div className="flex items-center gap-2.5 mb-6">
                    <span className="w-1.5 h-1.5 bg-[#FF1E00] inline-block shrink-0" />
                    <span className="font-mono text-[11px] font-normal uppercase tracking-[0.12em] text-[#A1A1AA]">
                        NBO · 01.2921° S / 36.8219° E
                    </span>
                </div>

                {/* 2-Column Grid with locked max-width and 64px horizontal gap */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
                    {/* Left Column */}
                    <div className="flex flex-col items-start w-full">
                        {/* 3-Line Display Headline in Bebas Neue */}
                        <div className="flex flex-col leading-[0.92] select-none font-bebas">
                            <h1 className="text-[64px] sm:text-[80px] lg:text-[96px] font-normal uppercase text-[#EAE6DF] leading-[0.92] m-0 p-0 tracking-[0.05em]">
                                PADDOCK
                            </h1>
                            <h1 className="text-[64px] sm:text-[80px] lg:text-[96px] font-normal uppercase text-[#FF1E00] leading-[0.92] m-0 p-0 tracking-[0.05em]">
                                PRECISION
                            </h1>
                            <h1 className="text-[64px] sm:text-[80px] lg:text-[96px] font-normal uppercase text-[#EAE6DF] leading-[0.92] m-0 p-0 tracking-[0.05em] whitespace-nowrap">
                                STREETWEAR
                            </h1>
                        </div>

                        {/* 3-Line Subheadline Paragraph in Inter (max-w-[440px]) */}
                        <p className="font-inter text-[15px] font-normal text-[#A1A1AA] leading-[1.6] max-w-[440px] mt-6">
                            Formula One inspired gear, built for the paddock and the city. Premium jackets, shirts and polos in multiple sizes, colourways and team designs — delivered anywhere in Kenya.
                        </p>

                        {/* CTAs with Space Mono Labels */}
                        <div className="flex flex-wrap items-center gap-4 mt-8">
                            <Link
                                href="/products"
                                className="bg-[#FF1E00] hover:bg-[#d61900] text-white font-mono text-[11px] font-bold uppercase tracking-[0.12em] px-8 h-12 flex items-center gap-2.5 transition-colors shadow-lg"
                            >
                                <span>SHOP THE GRID</span>
                                <ArrowRight size={14} />
                            </Link>
                            <a
                                href="https://wa.me/254142656105"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border border-white/20 hover:border-white/40 text-white/90 hover:text-white font-mono text-[11px] font-bold uppercase tracking-[0.12em] px-8 h-12 flex items-center gap-2 transition-all bg-black/40"
                            >
                                <MessageCircle size={15} />
                                <span>ORDER ON WHATSAPP</span>
                            </a>
                        </div>

                        {/* Stat Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 mt-8 border-t border-white/10 w-full">
                            <div>
                                <span className="font-mono text-sm font-bold text-white uppercase tracking-wider block">NATIONWIDE</span>
                                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1 block">DELIVERY ACROSS KENYA</span>
                            </div>
                            <div>
                                <span className="font-mono text-sm font-bold text-white uppercase tracking-wider block">M-PESA</span>
                                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1 block">SECURE MOBILE PAYMENT</span>
                            </div>
                            <div>
                                <span className="font-mono text-sm font-bold text-white uppercase tracking-wider block">KSH 2,500</span>
                                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1 block">SHIRTS & POLOS</span>
                            </div>
                            <div>
                                <span className="font-mono text-sm font-bold text-white uppercase tracking-wider block">KSH 4,000</span>
                                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1 block">JACKETS</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Hero Jacket Image with Noticeable 64px Gap) */}
                    <div className="relative w-full max-w-[480px] lg:max-w-[500px] aspect-square mx-auto lg:ml-auto border border-white/10 overflow-hidden shadow-2xl bg-[#141416]">
                        <Image
                            src="/images/f1/hero-jacket.jpg"
                            alt="Scuderia Ferrari Cavallino Track Jacket"
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 500px"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

/* --- Running Ticker ------------------------------------------- */
function RunningTicker() {
    const teams = [
        "MERCEDES-AMG PETRONAS", "MCLAREN RACING", "CADILLAC F1 TEAM", "NATIONWIDE DELIVERY",
        "M-PESA ACCEPTED", "SCUDERIA FERRARI", "RETRO ARCHIVE", "RED BULL RACING",
        "MERCEDES-AMG PETRONAS", "MCLAREN RACING", "CADILLAC F1 TEAM", "NATIONWIDE DELIVERY",
        "M-PESA ACCEPTED", "SCUDERIA FERRARI", "RETRO ARCHIVE", "RED BULL RACING"
    ]
    return (
        <div className="overflow-hidden border-b border-white/5 bg-[#09090b] py-3">
            <div className="animate-marquee flex gap-8 items-center whitespace-nowrap">
                {teams.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.25em] text-white/40 font-f1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e10600]" />
                        <span>{t}</span>
                    </span>
                ))}
            </div>
        </div>
    )
}

/* --- Collection Grid Section (Strict Single-Line Heading, Compact, No Scroll) ------ */
function CollectionSection({ products }: { products: any[] }) {
    const [activeTab, setActiveTab] = useState("ALL GEAR")

    const filtered = activeTab === "ALL GEAR"
        ? products
        : products.filter(p => p.category?.toUpperCase() === activeTab)

    return (
        <section className="bg-[#0c0c0e] py-14 md:py-16 px-6 md:px-12 border-b border-white/5">
            <div className="max-w-[1440px] mx-auto">

                {/* Section Heading - Compact, No Red Line, Not Scrollable */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#e10600] inline-block" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 font-f1">
                                THE COLLECTION
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-[0.06em] text-white leading-none font-f1">
                            TEAM ISSUE, <span className="text-white/40">STREET LEGAL</span>
                        </h2>
                    </div>
                    <p className="text-xs text-white/50 max-w-sm leading-relaxed">
                        Every piece is stocked in sizes S to XXL. Pick a design, choose your size, and it ships anywhere in Kenya.
                    </p>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mb-10">
                    {["ALL GEAR", "JACKETS", "SHIRTS", "POLOS"].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 border transition-all font-f1 cursor-pointer",
                                activeTab === tab
                                    ? "bg-[#e10600] border-[#e10600] text-white"
                                    : "border-white/10 text-white/50 hover:text-white hover:border-white/30 bg-[#101012]"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}

/* --- Logistics Section ----------------------------------------- */
function LogisticsSection() {
    return (
        <section className="bg-[#0c0c0e] py-16 md:py-20 px-6 md:px-12 border-b border-white/5">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                {/* Left: Delivered Countrywide */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#e10600] inline-block" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 font-f1">
                                LOGISTICS
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.06em] text-white leading-none font-f1">
                            DELIVERED <span className="text-[#e10600]">COUNTRYWIDE</span>
                        </h2>
                    </div>

                    <p className="text-xs text-white/50 leading-relaxed max-w-lg">
                        We deliver anywhere in Kenya. Tell us where the piece is going and how you'd like it delivered — motorbike rider within town or a courier for upcountry — and we'll confirm the delivery fee on WhatsApp before dispatch.
                    </p>

                    <div className="space-y-4 pt-2">
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 border border-white/10 flex items-center justify-center shrink-0 text-[#e10600] text-sm">
                                📍
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-white font-f1">COUNTRYWIDE COVERAGE</h4>
                                <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
                                    Nairobi, Mombasa, Kisumu, Nakuru, Eldoret and every other town in Kenya.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 border border-white/10 flex items-center justify-center shrink-0 text-[#e10600] text-sm">
                                🏍️
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-white font-f1">YOUR CHOICE OF RIDER</h4>
                                <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
                                    Motorbike rider for same-day city drops, or a courier for upcountry parcels.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 border border-white/10 flex items-center justify-center shrink-0 text-[#e10600] text-sm">
                                📦
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-white font-f1">PACKED LIKE EQUIPMENT</h4>
                                <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
                                    Every piece is checked, folded and sealed before it leaves us.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {["MOTORBIKE RIDER", "COURIER / PARCEL SERVICE", "PICK UP FROM THE SHOP"].map((tag, i) => (
                            <span key={i} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-white/10 text-white/50 font-f1">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div>
                        <a
                            href="https://wa.me/254142656105?text=Hi,%20I'd%20like%20a%20delivery%20quote"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block border border-[#e10600] text-[#e10600] hover:bg-[#e10600] hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 font-f1"
                        >
                            ASK FOR A DELIVERY QUOTE
                        </a>
                    </div>
                </div>

                {/* Right: Pay Via M-Pesa on WhatsApp Box */}
                <div className="bg-[#111114] border border-white/10 p-6 md:p-8 space-y-5">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#e10600] block font-f1">
                            PAYMENT · M-PESA
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30 block font-f1">
                            PAY VIA
                        </span>
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-[0.05em] text-white font-f1">
                            M-PESA ON WHATSAPP
                        </h3>
                        <p className="text-xs text-white/40 mt-1">
                            We share the payment number with your order confirmation.
                        </p>
                    </div>

                    <div>
                        <a
                            href="https://wa.me/254142656105"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block border border-white/20 text-white/70 hover:text-white hover:border-white/50 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 transition-colors font-f1"
                        >
                            REQUEST DETAILS
                        </a>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                        {[
                            "Place your order — it reaches us instantly.",
                            "We reply on WhatsApp with the M-Pesa number and the exact amount to pay.",
                            "Send the payment, then share the M-Pesa confirmation message with us.",
                            "We confirm payment and dispatch your order."
                        ].map((step, idx) => (
                            <div key={idx} className="flex gap-3">
                                <span className="text-[#e10600] font-black tracking-widest text-[11px] shrink-0 font-f1">
                                    0{idx + 1}
                                </span>
                                <p className="text-white/60 leading-relaxed text-[11px]">{step}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-black/40 p-3.5 border border-white/5 space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block font-f1">GOOD TO KNOW</span>
                        <p className="text-[11px] text-white/60 leading-relaxed">
                            Item prices are exclusive of delivery fees. Sizes S-XXL are stocked; if your size is out, message us and we'll restock it for you.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* --- Contact Section (Compact Spacing) ------------------------- */
function ContactSection() {
    return (
        <section className="bg-[#0c0c0e] py-14 md:py-16 px-6 md:px-12 border-b border-white/5">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                {/* Left */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#e10600] inline-block" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 font-f1">
                                TALK TO THE TEAM
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-[0.06em] leading-none text-white font-f1">
                            STRAIGHT TO THE <br />
                            <span className="text-[#e10600]">PADDOCK</span>
                        </h2>
                    </div>

                    <p className="text-xs text-white/50 leading-relaxed max-w-md">
                        Questions on sizing, colourways or delivery fees? Message us on WhatsApp with the piece you want and we'll sort the rest — order, payment and delivery.
                    </p>

                    <div>
                        <a
                            href="https://wa.me/254142656105"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 bg-[#e10600] hover:bg-[#c90500] text-white text-xs font-black uppercase tracking-[0.2em] px-8 py-3.5 transition-colors font-f1"
                        >
                            <MessageCircle size={16} />
                            <span>CHAT ON WHATSAPP</span>
                        </a>
                    </div>
                </div>

                {/* Right: 4 Contact Info Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/10 border border-white/10">
                    <div className="bg-[#101012] p-6 space-y-1.5 font-f1">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 block">WHATSAPP</span>
                        <h4 className="text-lg font-black text-white tracking-wider">0142 656 105</h4>
                        <p className="text-[11px] text-white/40 font-sans">Fastest way to order or ask about delivery</p>
                    </div>

                    <div className="bg-[#101012] p-6 space-y-1.5 font-f1">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 block">M-PESA</span>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">DETAILS ON WHATSAPP</h4>
                        <p className="text-[11px] text-white/40 font-sans">We share the payment number when you order</p>
                    </div>

                    <div className="bg-[#101012] p-6 space-y-1.5 font-f1">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 block">LOCATION</span>
                        <h4 className="text-lg font-black text-[#e10600] uppercase tracking-wider">NAIROBI, KENYA</h4>
                        <p className="text-[11px] text-white/40 font-sans">Collection by arrangement</p>
                    </div>

                    <div className="bg-[#101012] p-6 space-y-1.5 font-f1">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 block">HOURS</span>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">MON – SAT · 8:00AM – 8:00PM</h4>
                        <p className="text-[11px] text-white/40 font-sans">Sunday enquiries answered on WhatsApp</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* --- Client Home Component ------------------------------------ */
export function ClientHome({ allProducts = [], cmsData, hpConfig }: { allProducts: any[]; cmsData?: any; hpConfig?: any }) {
    return (
        <main className="bg-[#0c0c0e] text-white min-h-screen">
            <HeroSection />
            <RunningTicker />
            <CollectionSection products={allProducts} />
            <LogisticsSection />
            <ContactSection />
        </main>
    )
}
