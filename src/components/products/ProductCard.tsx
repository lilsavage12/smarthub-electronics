"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
    Clock, Percent, Eye, ShoppingCart,
    ChevronLeft, ChevronRight, Check, Activity,
    Star, Heart, Zap, Cpu, Battery,
    Maximize, ArrowLeftRight, TrendingUp, ShieldCheck,
    Box, CheckCircle2, Sparkles, Smartphone, Tag, X
} from "lucide-react"
import { cn } from "@/lib/utils"

const slugify = (text: string) => {
    if (!text) return 'product'
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"
import { useAuth } from "@/lib/auth-store"
import { toast } from "react-hot-toast"

const validateImageUrl = (url: string) => {
    const BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    if (!url) return BLANK_IMAGE
    if (typeof url !== 'string') return url
    return url
}

export const ProductCard = ({ product, viewMode = "grid", dark = false }: { product: any, viewMode?: "grid" | "list", dark?: boolean }) => {
    const { addItem, items, updateQuantity } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const { user } = useAuth()
    const router = useRouter()

    const productUrl = `/products/${slugify(product.name)}--${product.id}`

    const hasOptions = useMemo(() => {
        const variants = product.variants || []
        const colors = product.specs?.productColors || []
        return variants.length > 0 || colors.length > 1
    }, [product.variants, product.specs?.productColors])

    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        if (!containerRef.current) return
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) setWidth(entries[0].contentRect.width)
        })
        resizeObserver.observe(containerRef.current)
        return () => resizeObserver.disconnect()
    }, [])

    const galleryArr = useMemo(() => {
        let arr = []
        try {
            if (product.galleryImages) {
                arr = typeof product.galleryImages === 'string' ? JSON.parse(product.galleryImages) : product.galleryImages
            }
        } catch (e) { }
        const rawImgs = [product.image, ...(Array.isArray(arr) ? arr : [])]
        const processedImgs = rawImgs
            .map(url => String(url || "").trim())
            .filter(url => url.length > 0 && url !== "null" && url !== "undefined")

        const uniqueByNormalized = new Map()
        processedImgs.forEach(url => {
            const normalized = url.startsWith('http') ? url : (url.startsWith('/') ? url.slice(1) : url)
            if (!uniqueByNormalized.has(normalized)) {
                uniqueByNormalized.set(normalized, url)
            }
        })

        return Array.from(uniqueByNormalized.values()).map(url => validateImageUrl(url))
    }, [product.image, product.galleryImages])

    const activeImages = galleryArr

    useEffect(() => {
        let interval: any;
        if (isHovered && activeImages.length > 1) {
            // Instantly transition to the second image for immediate visual feedback
            setCurrentImageIndex(1);

            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % activeImages.length);
            }, 2000);
        } else {
            setCurrentImageIndex(0);
        }
        return () => clearInterval(interval);
    }, [isHovered, activeImages.length]);

    const formatPrice = (p: number) => `KSh ${Math.round(p).toLocaleString()}`

    useEffect(() => {
        if (isHovered) {
            console.log(`[DEBUG] Product: ${product.name}`, {
                id: product.id,
                price: product.price,
                orig: product.originalPrice,
                variants: product.variants?.length,
                promos: product.promotions?.length
            })
        }
    }, [isHovered, product])

    const pVariants = product.variants || []

    // Improved price extraction with variant fallbacks to avoid "KSh 0"
    const getBasePrice = () => {
        const rawPrice = Number(product.price || 0)
        if (rawPrice > 0) return rawPrice
        // Check variants if main price is 0
        if (pVariants.length > 0) {
            const variantPrices = pVariants.map((v: any) => Number(v.price || 0)).filter((p: any) => p > 0)
            if (variantPrices.length > 0) return Math.min(...variantPrices)
        }
        return 0
    }

    const standardPrice = getBasePrice()
    const salePrice = Number(product.discountPrice || product.specs?.identity?.discountPrice || 0)
    const dbDiscount = Number(product.discount || 0)
    const rawOriginalPrice = Number(product.originalPrice || 0)

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

    const cartItem = items.find(i => i.id === product.id)
    const cartQty = cartItem?.quantity ?? 0
    const inCart = cartQty > 0

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: discountedPrice,
            quantity: 1,
            image: product.image,
            stock: product.stock
        }, user?.id)
        toast.success("Added to cart!")
    }

    const handleIncrease = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: discountedPrice,
            quantity: 1,
            image: product.image,
            stock: product.stock
        }, user?.id)
    }

    const handleDecrease = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        updateQuantity(product.id, cartQty - 1, user?.id)
    }

    const getPriceDisplay = () => {
        if (pVariants.length > 0) {
            const prices = pVariants.map((v: any) => {
                const p = Number(v.price || 0)
                return p > 0 ? p : discountedPrice
            })
            prices.push(discountedPrice)
            
            const uniquePrices = Array.from(new Set(prices)) as number[]
            if (uniquePrices.length > 1) {
                const min = Math.min(...uniquePrices)
                const max = Math.max(...uniquePrices)
                return `${formatPrice(min)} - ${formatPrice(max)}`
            }
        }
        return formatPrice(discountedPrice)
    }

    return (
        <Card
            ref={containerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setCurrentImageIndex(0); }}
            className={cn(
                "group h-full flex flex-col transition-all duration-500 overflow-hidden relative border border-border/10 rounded-2xl shadow-lg bg-white/30 dark:bg-black/30 backdrop-blur-sm",
                dark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-card hover:bg-muted/30 hover:border-primary/30 shadow-sm hover:shadow-[0_45px_100px_rgba(0,0,0,0.08)]",
                viewMode === "list" ? "flex-row h-auto md:h-64" : ""
            )}
        >
            <div className="relative flex flex-col h-full w-full bg-transparent border-none overflow-hidden group/card transition-all duration-700" suppressHydrationWarning>
                <div className="aspect-square relative overflow-hidden bg-white dark:bg-slate-900 border-b border-border/50" suppressHydrationWarning>
                    <Link href={productUrl} className="absolute inset-0 z-10">
                        <Image
                            src={activeImages[currentImageIndex] || product.image}
                            alt={product.name}
                            fill
                            className={cn(
                                "object-contain p-6 md:p-8 transition-all duration-1000",
                                isHovered ? "scale-110" : "scale-100"
                            )}
                        />
                    </Link>

                    <div className="absolute top-0 left-0 z-30 flex flex-col items-start gap-1 p-2" suppressHydrationWarning>
                        {product.stock <= 0 && (
                            <div className="bg-rose-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1.5 border-r border-b border-white/10 transition-all duration-300">
                                <X size={12} strokeWidth={4} /> SOLD OUT
                            </div>
                        )}
                        {(product.stock > 0 && product.stock <= 10) && (
                            <div className="bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1.5 border-r border-b border-white/10 transition-all duration-300">
                                <Activity size={12} className="animate-pulse" /> ONLY {product.stock} LEFT
                            </div>
                        )}
                        {percentOff > 0 && product.stock > 0 && (
                            <div className={cn(
                                "text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1.5 transition-colors duration-500",
                                percentOff >= 30 ? "bg-rose-600" : percentOff >= 15 ? "bg-amber-500" : "bg-emerald-600"
                            )}>
                                <Percent size={12} className="animate-pulse" /> {percentOff}% OFF
                            </div>
                        )}
                        {product.isNew && (
                            <div className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1.5 border-r border-b border-white/10 transition-all duration-300">
                                <Sparkles size={12} /> NEW
                            </div>
                        )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 z-40 p-4 translate-y-full group-hover/card:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-slate-900/80 to-transparent">
                        {inCart && !hasOptions ? (
                            <div className="rounded-xl bg-white flex items-center justify-between px-4 shadow-2xl">
                                <button onClick={handleDecrease} className="text-slate-500 hover:text-slate-900 font-black text-lg leading-none w-8 h-8 flex items-center justify-center transition-colors">-</button>
                                <span className="text-slate-900 font-black text-sm">{cartQty}</span>
                                <button onClick={handleIncrease} disabled={product.stock !== undefined && cartQty >= product.stock} className="text-slate-500 hover:text-slate-900 font-black text-lg leading-none w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30">+</button>
                            </div>
                        ) : (
                            <Button onClick={hasOptions ? (e) => { e.preventDefault(); e.stopPropagation(); router.push(productUrl); } : handleAddToCart} className="w-full h-12 rounded-xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-success hover:text-white transition-all">
                                {hasOptions ? <Maximize className="w-4 h-4 mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                                {hasOptions ? "SELECT OPTIONS" : "QUICK ADD"}
                            </Button>
                        )}
                    </div>
                </div>

                <div suppressHydrationWarning className="flex flex-col flex-1 p-6 gap-4">
                    <div className="flex flex-col gap-1" suppressHydrationWarning>
                        <span suppressHydrationWarning className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ">{product.brand || product.category}</span>
                        <h3 suppressHydrationWarning className={cn("text-sm font-black tracking-tighter uppercase leading-tight line-clamp-2 min-h-[2.5rem]", dark ? "text-white" : "text-foreground")}>
                            <Link href={productUrl} suppressHydrationWarning>{product.name}</Link>
                        </h3>
                    </div>

                     <div suppressHydrationWarning className="mt-auto flex flex-col gap-0.5">
                         <span className="text-base font-black text-foreground">{getPriceDisplay()}</span>
                         {percentOff > 0 && !hasOptions && (
                             <span className="text-[10px] font-black text-muted-foreground line-through opacity-40 ">{formatPrice(originalPrice)}</span>
                         )}
                     </div>
                </div>
            </div>
        </Card>
    )
}
