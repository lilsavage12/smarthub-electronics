"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
    Star, Heart, Share2, ShieldCheck,
    Truck, Award, ChevronRight, ChevronLeft,
    Plus, Minus, ShoppingCart, ArrowRight, Activity, Clock
} from "lucide-react"
import NextLink from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"
import { useAuth } from "@/lib/auth-store"
import { toast } from "react-hot-toast"

import { ProductCard } from "./ProductCard"
import { useRouter } from "next/navigation"

interface ClientProductDetailProps {
    product: any
    relatedProducts: any[]
}

const validateImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&w=800&q=80"
    if (typeof url !== 'string') return ""
    if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) return url
    return url
}

const slugifyLocal = (text: string) => {
    if (!text) return 'product'
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export default function ClientProductDetail({ product, relatedProducts }: ClientProductDetailProps) {
    const router = useRouter()
    const { addItem } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const { user } = useAuth()

    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [mounted, setMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        setMounted(true)
        if (!containerRef.current) return
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) setWidth(entries[0].contentRect.width)
        })
        resizeObserver.observe(containerRef.current)
        return () => resizeObserver.disconnect()
    }, [])

    const [selectedVariant, setSelectedVariant] = useState<any>(null)
    const [selectedColor, setSelectedColor] = useState<string>("")
    const formatPrice = (p: number) => `KSh ${Math.round(p).toLocaleString()}`

    const safeParse = (data: any) => {
        if (!data) return []
        if (Array.isArray(data)) return data
        try { return JSON.parse(data) } catch (e) { return [] }
    }

    const productColors = safeParse(product.productColors)
    const standardPrice = Number(selectedVariant?.price || product.price || 0)
    const salePrice = Number(product.discountPrice || product.specs?.identity?.discountPrice || 0)
    const dbDiscount = Number(product.discount || 0)
    const rawOriginalPrice = Number(selectedVariant?.originalPrice || product.originalPrice || 0)

    // Calculate Highest Promotion
    const promoDiscount = (product.promotions || []).reduce((max: number, p: any) => {
        if (p.type === 'PERCENTAGE') return Math.max(max, p.value || 0)
        return max
    }, 0)

    let originalPrice = Math.round(rawOriginalPrice || standardPrice)
    let discountedPrice = Math.round(salePrice > 0 ? salePrice : standardPrice)
    let percentOff = 0

    if (salePrice > 0 && salePrice < standardPrice) {
        discountedPrice = Math.round(salePrice)
        originalPrice = Math.round(standardPrice)
        percentOff = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    } else if (dbDiscount > 0 || promoDiscount > 0) {
        const totalDiscount = Math.max(dbDiscount, promoDiscount)
        originalPrice = Math.round(standardPrice)
        discountedPrice = Math.round(standardPrice * (1 - totalDiscount / 100))
        percentOff = totalDiscount
    } else if (rawOriginalPrice > standardPrice) {
        originalPrice = Math.round(rawOriginalPrice)
        discountedPrice = Math.round(standardPrice)
        percentOff = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    }

    const savings = originalPrice - discountedPrice

    const activeImages = useMemo(() => {
        const raw = product.images || safeParse(product.galleryImages) || safeParse(product.gallery) || []
        const base = product.images ? raw : [product.image, ...(Array.isArray(raw) ? raw : [])]

        const processed = base
            .map((url: any) => String(url || "").trim())
            .filter((url: any) => url.length > 0 && url !== "null" && url !== "undefined")

        const uniqueByNormalized = new Map()
        processed.forEach((url: any) => {
            const normalized = url.startsWith('http') ? url : (url.startsWith('/') ? url.slice(1) : url)
            if (!uniqueByNormalized.has(normalized)) {
                uniqueByNormalized.set(normalized, url)
            }
        })

        return Array.from(uniqueByNormalized.values())
    }, [product.images, product.galleryImages, product.gallery, product.image])

    // IMAGE/COLOR SYNC
    useEffect(() => {
        if (!selectedColor) return
        const variantColorsArr = safeParse(selectedVariant?.productColors)
        const variantMatch = variantColorsArr.find((c: any) => c.color === selectedColor)
        const masterMatch = productColors.find((c: any) => c.color === selectedColor)
        const rawResolvedImage = variantMatch?.image || masterMatch?.image

        if (rawResolvedImage) {
            const resolved = validateImageUrl(String(rawResolvedImage))
            const idx = activeImages.findIndex(img => validateImageUrl(img) === resolved)
            if (idx >= 0) setCurrentImageIndex(idx)
        }
    }, [selectedColor, selectedVariant, productColors, activeImages])

    const variantColorsArr = safeParse(selectedVariant?.productColors)
    const variantColorMatch = variantColorsArr.find((c: any) => c.color === selectedColor)
    const masterColorMatch = productColors.find((c: any) => c.color === selectedColor)
    const currentStock = variantColorMatch ? parseInt(variantColorMatch.stock) : (masterColorMatch ? parseInt(masterColorMatch.stock) : (product.stock || 0))
    const isOutOfStock = Boolean(selectedColor && currentStock <= 0)

    const handleAddToCart = () => {
        if (!selectedColor && productColors.length > 0) {
            toast.error("PLEASE SELECT A COLOR")
            return
        }
        addItem({
            id: selectedVariant ? `${product.id}-${selectedVariant.id}-${selectedColor}` : `${product.id}-${selectedColor}`,
            productId: product.id,
            name: `${product.name} (${selectedColor}${selectedVariant ? ` / ${selectedVariant.ram}+${selectedVariant.storage}` : ''})`,
            price: discountedPrice,
            quantity: 1,
            image: activeImages[currentImageIndex] || product.image,
            color: selectedColor,
            storage: selectedVariant?.storage,
            ram: selectedVariant?.ram,
            stock: currentStock,
            originalPrice: originalPrice,
            promotions: product.promotions
        }, user?.id)
        toast.success("Added to cart!")
    }

    return (
        <div className="min-h-screen bg-transparent" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto px-6 py-12 lg:grid lg:grid-cols-2 lg:gap-20" suppressHydrationWarning>

                {/* GALLERY */}
                <div className="flex flex-col gap-8 h-fit" suppressHydrationWarning>
                    <div
                        ref={containerRef}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="aspect-square relative flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl overflow-hidden group border border-border/50" suppressHydrationWarning
                    >
                        <div suppressHydrationWarning className="w-full h-full relative z-10 overflow-hidden">
                            <motion.div
                                suppressHydrationWarning
                                className="flex h-full"
                                animate={{ x: -currentImageIndex * width }}
                                transition={{
                                    type: "tween",
                                    ease: "easeOut",
                                    duration: 0.25
                                }}
                                style={{ willChange: "transform", width: activeImages.length * width }}
                            >
                                {activeImages.map((img: any, idx: number) => (
                                    <div key={idx} suppressHydrationWarning className="h-full relative shrink-0" style={{ width: width }}>
                                        <div className="absolute inset-0 p-8">
                                            <Image
                                                src={validateImageUrl(img)}
                                                alt={product.name}
                                                fill
                                                className="object-contain"
                                                priority={idx === 0}
                                                quality={100}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {activeImages.length > 1 && (
                            <div suppressHydrationWarning className={cn(
                                "absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-40 pointer-events-none transition-opacity duration-300",
                                isHovered ? "opacity-100" : "opacity-0"
                            )}>
                                <button
                                    onClick={() => setCurrentImageIndex(prev => Math.max(prev - 1, 0))}
                                    className={cn(
                                        "w-12 h-12 rounded-full bg-slate-900/60 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto disabled:opacity-20",
                                        currentImageIndex === 0 && "cursor-not-allowed"
                                    )}
                                    disabled={currentImageIndex === 0}
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setCurrentImageIndex(prev => Math.min(prev + 1, activeImages.length - 1))}
                                    className={cn(
                                        "w-12 h-12 rounded-full bg-slate-900/60 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto disabled:opacity-20",
                                        currentImageIndex === activeImages.length - 1 && "cursor-not-allowed"
                                    )}
                                    disabled={currentImageIndex === activeImages.length - 1}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar" suppressHydrationWarning>
                        {activeImages.map((img: string, i: number) => (
                            <button
                                key={i}
                                onClick={() => setCurrentImageIndex(i)}
                                className={cn(
                                    "w-24 h-24 shrink-0 rounded-xl border-2 transition-all p-2 bg-white dark:bg-slate-900 relative",
                                    currentImageIndex === i ? "border-slate-900 dark:border-white scale-105" : "border-border hover:border-slate-300"
                                )}
                            >
                                <Image
                                    src={validateImageUrl(img)}
                                    alt=""
                                    fill
                                    className="object-contain p-2"
                                    sizes="100px"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* DETAILS */}
                <div className="flex flex-col gap-8 mt-12 lg:mt-0" suppressHydrationWarning>
                    <div className="flex flex-col gap-4" suppressHydrationWarning>
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground ">{product.category}</span>
                        <h1 className="text-3xl md:text-6xl font-black  tracking-tighter uppercase leading-none font-outfit">{product.name}</h1>

                        <div className="flex items-center gap-8 text-[10px] mt-4 border-b border-border/50 pb-6 uppercase font-black tracking-widest " suppressHydrationWarning>
                            <button onClick={() => toggleWishlist(product.id, user?.id)} className={cn("flex items-center gap-2 hover:text-success", mounted && isInWishlist(product.id) ? "text-success" : "text-muted-foreground")}>
                                <Heart size={18} className={mounted && isInWishlist(product.id) ? "fill-current" : ""} /><span>Wishlist</span>
                            </button>
                        </div>

                        <div className="bg-muted/10 p-8 rounded-3xl border border-border mt-6  text-sm leading-relaxed" suppressHydrationWarning>
                            {(product.specs?.content?.quick || product.description || "No summary available.").split('\n').filter(Boolean).map((line: string, i: number) => (
                                <div key={i} className="flex gap-3 mb-2"><div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5" />{line}</div>
                            ))}
                        </div>

                        {/* CONFIGURATION */}
                        <div className="flex flex-col gap-8 mt-8" suppressHydrationWarning>
                            {product.variants?.length > 0 && (
                                <div className="flex flex-col gap-3" suppressHydrationWarning>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ">Configuration</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {product.variants.map((v: any) => (
                                            <button key={v.id} onClick={() => setSelectedVariant(v.id === selectedVariant?.id ? null : v)} className={cn("h-14 bg-card border-2 rounded-2xl px-6 flex items-center justify-between transition-all", v.id === selectedVariant?.id ? "border-success shadow-lg shadow-success/5" : "border-border hover:border-slate-300")}>
                                                <span className="text-xs font-black ">{v.ram}GB + {v.storage}GB</span>
                                                <span className="text-xs font-black  text-success">{formatPrice(v.price)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(() => {
                                const variantColors = safeParse(selectedVariant?.productColors);
                                const availableColors = variantColors.length > 0 ? variantColors : productColors;
                                if (!Array.isArray(availableColors) || availableColors.length === 0) return null;

                                return (
                                    <div className="flex flex-col gap-3" suppressHydrationWarning>
                                        <label suppressHydrationWarning className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ">Select Color</label>
                                        <div suppressHydrationWarning className="flex flex-wrap gap-2">
                                            {availableColors.map((c: any) => (
                                                <button key={c.color} onClick={() => setSelectedColor(selectedColor === c.color ? "" : c.color)} className={cn("px-6 py-3 rounded-xl border-2 text-[10px] font-black uppercase  transition-all", selectedColor === c.color ? "bg-foreground text-background border-foreground shadow-xl" : "bg-card border-border hover:border-slate-300")}>
                                                    {c.color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* FINAL PRICE & ACTION */}
                        <div className="mt-12 flex flex-col gap-8 border-t border-border pt-10" suppressHydrationWarning>
                            <div className="flex flex-col gap-2" suppressHydrationWarning>
                                <div className="flex items-baseline gap-4" suppressHydrationWarning>
                                    <span className="text-4xl md:text-7xl font-black  tracking-tighter text-success leading-none font-outfit">{formatPrice(discountedPrice)}</span>
                                    {originalPrice > discountedPrice && <span className="text-2xl font-bold text-muted-foreground line-through opacity-40 ">{formatPrice(originalPrice)}</span>}
                                </div>
                                {percentOff > 0 && (
                                    <span className={cn(
                                        "text-[10px] font-black px-4 py-1.5 rounded-full w-fit uppercase  tracking-widest transition-all",
                                        percentOff >= 50 ? "bg-rose-500/10 text-rose-500 animate-pulse" :
                                            percentOff >= 20 ? "bg-amber-500/10 text-amber-600" :
                                                "bg-emerald-500/10 text-emerald-600"
                                    )}>
                                        Save {percentOff}% — {formatPrice(savings)} Off
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row gap-4">
                                <Button onClick={handleAddToCart} disabled={isOutOfStock} className="flex-1 h-20 rounded-[2rem] bg-success text-success-foreground font-black text-xs uppercase  tracking-widest shadow-2xl shadow-success/10 transition-all hover:scale-[1.02] active:scale-95">{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}</Button>
                                <Button onClick={() => { handleAddToCart(); router.push("/checkout"); }} disabled={isOutOfStock} className="flex-1 h-20 rounded-[2rem] bg-foreground text-background font-black text-xs uppercase  tracking-widest transition-all hover:scale-[1.02] active:scale-95">BUY NOW</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TECHNICAL DETAILS */}
            {(() => {
                const rawSpecs = product.specs?.customSpecifications
                const specs = typeof rawSpecs === 'string' ? (JSON.parse(rawSpecs) || {}) : (rawSpecs || {})
                const entries = Object.entries(specs).filter(([_, fields]: [string, any]) => Array.isArray(fields) && fields.length > 0)
                if (entries.length === 0) return null

                return (
                    <div suppressHydrationWarning className="max-w-7xl mx-auto px-6 py-20 border-t border-border mt-10">
                        <h2 suppressHydrationWarning className="text-3xl font-black uppercase  tracking-tighter mb-10 border-l-8 border-success pl-8 font-outfit">Technical Specifications</h2>
                        <div suppressHydrationWarning className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {entries.map(([section, fields]: [string, any]) => (
                                <div key={section} suppressHydrationWarning className="p-10 rounded-[3rem] bg-card border border-border hover:shadow-2xl transition-all">
                                    <h3 suppressHydrationWarning className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 opacity-40 ">{section}</h3>
                                    {(fields || []).map((f: any, i: number) => (
                                        <div key={i} suppressHydrationWarning className="flex justify-between border-b border-border/50 py-4 text-[12px] font-bold  tracking-tight">
                                            <span className="text-muted-foreground opacity-60 uppercase">{f.field_name}</span>
                                            <span className="text-right">{f.value || '--'}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })()}

            {/* RELATED */}
            <div className="bg-muted/5 py-32 border-t border-border mt-32" suppressHydrationWarning>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-16">
                        <h2 className="text-3xl md:text-5xl font-black uppercase  tracking-tighter font-outfit">Related <span className="text-primary">Inventory</span></h2>
                        <NextLink href="/products" className="text-[10px] font-black uppercase tracking-widest  border-b-2 border-primary pb-1">View Full Catalog</NextLink>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0 border-l border-t border-border/10">
                        {relatedProducts.slice(0, 12).map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
