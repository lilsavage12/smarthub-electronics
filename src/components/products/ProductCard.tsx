"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, ShoppingCart, Heart, Zap, Cpu, Battery, Maximize, ArrowLeftRight, TrendingUp, ShieldCheck, Box, CheckCircle2, Sparkles, Smartphone, Tag, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"
import { useAuth } from "@/lib/auth-store"
import { toast } from "react-hot-toast"

const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

const getCleanName = (name: string, brand: string) => {
    if (!name || !brand) return name
    const brandLower = brand.toLowerCase()
    return name.split(' ').filter(word => word.toLowerCase() !== brandLower).join(' ').trim()
}

const BROKEN_UNSPLASH_IDS = [
    "1434493907317-a46b5bc78344",
    "1675243911244-65910b39678c",
    "1707065090150-136746ef9204"
]

const validateImageUrl = (url: string) => {
    const BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    if (!url) return BLANK_IMAGE
    if (typeof url !== 'string') return url
    const isBroken = BROKEN_UNSPLASH_IDS.some(id => url.includes(id))
    return isBroken ? BLANK_IMAGE : url
}

export const ProductCard = ({ product, viewMode = "grid" }: { product: any, viewMode?: "grid" | "list" }) => {
    const { addItem } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const { user } = useAuth()
    const router = useRouter()

    const [selectedVariant, setSelectedVariant] = useState<any>(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    // VARIANT & IMAGE LOGIC ORCHESTRATION
    const variants = product.variants || []
    const hasVariants = variants.length > 0

    const gallery = useMemo(() => {
        let imgs = []
        if (product.galleryImages) {
            const parsed = typeof product.galleryImages === 'string' ? JSON.parse(product.galleryImages) : product.galleryImages
            imgs = [product.image, ...parsed]
        } else {
            imgs = [product.image]
        }
        return [...new Set(imgs.filter(Boolean))].map(validateImageUrl)
    }, [product.image, product.galleryImages])

    const activeImages = gallery

    // SLIDESHOW OVERLAYS
    useEffect(() => {
        let interval: any;
        if (isHovered && activeImages.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % activeImages.length);
            }, 1500); // Snappier interval
        } else {
            setCurrentImageIndex(0);
        }
        return () => clearInterval(interval);
    }, [isHovered, activeImages.length]);

    const currentPrice = selectedVariant?.price || product.price
    const currentVariantName = selectedVariant ? `${selectedVariant.ram}+${selectedVariant.storage}` : ""

    const effectivePromo = useMemo(() => {
        if (!product.promotions || product.promotions.length === 0) return null
        return product.promotions.reduce((prev: any, current: any) => {
            return (prev.discount || prev.value || 0) > (current.discount || current.value || 0) ? prev : current
        })
    }, [product.promotions])

    const { discountedPrice, percentOff } = useMemo(() => {
        const base = Number(currentPrice || product.price)
        
        // 1. Check for manual Discount Price in specs
        const manualDiscountPrice = product.specs?.identity?.discountPrice
        if (manualDiscountPrice && !isNaN(parseFloat(manualDiscountPrice))) {
            const dp = parseFloat(manualDiscountPrice)
            return { discountedPrice: dp, percentOff: Math.round(((base - dp) / base) * 100) }
        }

        // 2. Check for manual Discount Percentage
        if (product.discount && product.discount > 0) {
            const dp = base * (1 - product.discount / 100)
            return { discountedPrice: dp, percentOff: product.discount }
        }

        // 3. Fallback to active Promotions
        if (effectivePromo) {
            const disc = effectivePromo.discount || effectivePromo.value || 0
            const dp = base * (1 - disc / 100)
            return { discountedPrice: dp, percentOff: disc }
        }

        return { discountedPrice: base, percentOff: 0 }
    }, [currentPrice, product.price, product.specs, product.discount, effectivePromo])

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id.toString(),
            productId: product.id,
            name: `${product.name}${selectedVariant ? ` (${selectedVariant.ram}/${selectedVariant.storage})` : ''}`,
            price: discountedPrice,
            originalPrice: currentPrice,
            quantity: 1,
            image: activeImages[0] || product.image,
            stock: product.stock,
            brand: product.brand,
            variantId: selectedVariant?.id,
            promotions: product.promotions
        }, user?.id)
        toast.success(`${product.name.toUpperCase()} ADDED TO CART`, {
            icon: '⚡',
            style: {
                background: '#0F172A',
                color: '#fff',
                borderRadius: '1rem',
                fontSize: '10px',
                fontWeight: '900',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '12px 20px'
            }
        })
    }

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const currentlyIn = isInWishlist(product.id)
        toggleWishlist(product, user?.id)
        const isAdding = !currentlyIn
        toast(isAdding ? 'ADDED TO WISHLIST' : 'REMOVED FROM WISHLIST', {
            icon: isAdding ? '❤️' : '💔',
            style: {
                background: isAdding ? '#F43F5E' : '#475569',
                color: '#fff',
                borderRadius: '1rem',
                fontSize: '10px',
                fontWeight: '900',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
            }
        })
    }

    const formatPrice = (p: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.round(p)).replace('KES', 'KSh')
    }

    const getDiscountColor = (percent: number) => {
        if (percent >= 50) return "bg-rose-600" // Mega Deal
        if (percent >= 30) return "bg-amber-500" // Great Deal
        if (percent >= 15) return "bg-emerald-500" // Good Deal
        return "bg-blue-500" // Standard Discount
    }

    const { minPrice, maxPrice } = useMemo(() => {
        if (!variants || variants.length === 0) return { minPrice: product.price, maxPrice: product.price }
        const prices = variants.map((v: any) => v.price).filter(Boolean)
        if (prices.length === 0) return { minPrice: product.price, maxPrice: product.price }
        return { 
            minPrice: Math.min(...prices, product.price), 
            maxPrice: Math.max(...prices, product.price) 
        }
    }, [variants, product.price])

    const isPriceRange = minPrice !== maxPrice

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Card className="h-full rounded-none border-t-0 border-l-0 border-r border-b border-border/10 bg-white dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all duration-500 p-0 flex flex-col group">
                
                {/* 1. VISUAL LAYER */}
                <div suppressHydrationWarning className="aspect-square relative flex items-center justify-center p-0 bg-transparent group-hover:scale-[1.02] transition-transform duration-700">
                    {/* Wishlist Interaction */}
                    <button 
                        onClick={handleToggleWishlist}
                        className={cn(
                            "absolute top-0 right-0 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all scale-90 opacity-100 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:opacity-100 active:scale-90 border border-border/10 duration-300",
                            isInWishlist(product.id) 
                                ? "bg-rose-500 text-white opacity-100 scale-100" 
                                : "bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        )}
                    >
                        <Heart size={20} className={cn(isInWishlist(product.id) && "fill-current")} />
                    </button>
                    {/* Discount Badge */}
                    {percentOff > 0 && product.specs?.identity?.showDiscountBadge !== false && (
                        <div className={cn(
                            "absolute top-0 left-0 z-30 text-white text-[10px] font-black px-3 py-1.5 rounded-br-2xl uppercase tracking-widest shadow-xl italic transition-colors duration-500",
                            getDiscountColor(percentOff)
                        )}>
                            -{percentOff}% OFF
                        </div>
                    )}
                    {/* Image Carousel/Display */}
                    <Link href={`/products/${slugify(product.name)}`} className="block w-full h-full relative z-10">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={currentImageIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0"
                            >
                                <Image 
                                    src={validateImageUrl((activeImages[currentImageIndex] as string) || product.image)} 
                                    alt={product.name} 
                                    fill 
                                    className={cn("object-contain transition-all duration-700", isHovered && "scale-105", product.stock <= 0 && "grayscale opacity-40")} 
                                    onError={(e: any) => {
                                        e.target.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                                    }}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </Link>
                </div>

                {/* 2. CONTENT LAYER */}
                <div suppressHydrationWarning className="flex flex-col flex-1 gap-4 p-3 sm:p-4 md:p-6 bg-white dark:bg-transparent">
                    <div className="flex flex-col gap-1" suppressHydrationWarning>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[3rem]">
                            <Link href={`/products/${slugify(product.name)}`}>{product.name}</Link>
                        </h3>
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest opacity-80">{product.brand}</span>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between" suppressHydrationWarning>
                        <div className="flex flex-col" suppressHydrationWarning>
                            {percentOff > 0 && (
                                <span className="text-[10px] font-black text-muted-foreground line-through opacity-70 tracking-wider">
                                    {formatPrice(currentPrice)}
                                </span>
                            )}
                            <span className={cn(
                                "font-black text-price tracking-tighter italic leading-tight",
                                isPriceRange ? "text-[15px] sm:text-lg block" : "text-lg whitespace-nowrap"
                            )}>
                                {isPriceRange 
                                    ? `${formatPrice(minPrice * (1 - (percentOff / 100)))} – ${formatPrice(maxPrice * (1 - (percentOff / 100)))}` 
                                    : formatPrice(discountedPrice)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. PRIMARY ACTION COMMAND */}
                <div suppressHydrationWarning className="p-3 sm:p-4 md:p-6 pt-0">
                    <Button 
                        onClick={(e) => { handleAddToCart(e); }}
                        disabled={product.stock <= 0}
                        className="w-full h-14 rounded-xl bg-white dark:bg-transparent border-2 border-success/80 text-foreground dark:text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-lg hover:bg-success/5 dark:hover:bg-success/10 transition-all active:scale-95"
                    >
                        ADD TO CART
                    </Button>
                </div>
            </Card>
        </motion.div>
    )
}
