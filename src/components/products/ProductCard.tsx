import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, ShoppingCart, Heart, Zap, Cpu, Battery, Maximize, ArrowLeftRight, TrendingUp, ShieldCheck, Box, CheckCircle2, Sparkles, Smartphone, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"
import { useComparison } from "@/lib/comparison-store"
import { useAuth } from "@/lib/auth-store"
import { toast } from "react-hot-toast"
import { getEffectivePromotion, calculateDiscountedPrice } from "@/lib/promo-utils"
import { CountdownTimer } from "./CountdownTimer"

const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export const ProductCard = ({ product, viewMode = "grid" }: { product: any, viewMode?: "grid" | "list" }) => {
    const { addItem } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const { addItem: addToComparison, removeItem: removeFromComparison, isInComparison } = useComparison()
    const { user } = useAuth()

    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const images = product.images || [product.image]
    const hasMultipleImages = images.length > 1

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isHovered && hasMultipleImages) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % images.length)
            }, 1500)
        } else {
            setCurrentImageIndex(0)
        }
        return () => clearInterval(interval)
    }, [isHovered, hasMultipleImages, images.length])

    const effectivePromo = getEffectivePromotion(product.promotions || [])
    const { discountedPrice, percentOff, savings } = calculateDiscountedPrice(product.price, effectivePromo)

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            id: product.id.toString(),
            name: product.name,
            price: discountedPrice,
            quantity: 1,
            image: product.image,
        }, user?.id)
        toast.success(`${product.name} ADDED TO CART`, {
            style: {
                background: '#10B981',
                color: '#fff',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '10px',
                fontWeight: 'black',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
            }
        })
    }

    const handleToggleComparison = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isInComparison(product.id.toString())) {
            removeFromComparison(product.id.toString())
            toast.error("REMOVED FROM COMPARISON", {
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '10px',
                    fontWeight: 'black',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                }
            })
        } else {
            addToComparison({
                id: product.id.toString(),
                name: product.name,
                price: product.price,
                image: product.image,
                brand: product.brand,
                specs: product.specs
            })
            toast.success("ADDED TO COMPARISON", {
                style: {
                    background: '#10B981',
                    color: '#fff',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '10px',
                    fontWeight: 'black',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                }
            })
        }
    }

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const isCurrentlyIn = isInWishlist(product.id.toString())
        
        await toggleWishlist(product.id.toString(), user?.id)
        
        if (isCurrentlyIn) {
            toast.error("REMOVED FROM WISHLIST", {
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '10px',
                    fontWeight: 'black',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                }
            })
        } else {
            toast.success("ADDED TO WISHLIST", {
                style: {
                    background: '#10B981',
                    color: '#fff',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '10px',
                    fontWeight: 'black',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                }
            })
        }
    }

    if (viewMode === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative w-full"
            >
                <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30 flex flex-row h-32 md:h-28 items-center" suppressHydrationWarning>
                    {/* Compact Image Section */}
                    <div className="w-24 md:w-32 h-full relative p-4 flex items-center justify-center bg-muted/20 overflow-hidden shrink-0 border-r border-border/50">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                        />
                        {effectivePromo && (
                           <div className="absolute top-2 left-2 flex gap-1">
                                <div className={cn(
                                    "p-1 rounded-md text-white shadow-lg",
                                    effectivePromo.category === 'FLASH_SALE' ? "bg-red-500" : "bg-primary"
                                )}>
                                    <Zap size={8} fill="white" />
                                </div>
                           </div>
                        )}
                    </div>

                    {/* Compact Content Section */}
                    <CardContent className="px-4 py-2 flex flex-1 flex-row items-center justify-between gap-4 h-full">
                        <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">{product.brand}</span>
                                {product.isNew && <span className="text-[6px] font-black bg-primary text-white px-1 rounded uppercase">NEW</span>}
                            </div>
                            <Link href={`/products/${slugify(product.name)}--${product.id}`} className="text-xs md:text-sm font-black font-outfit uppercase tracking-tight leading-none group-hover:text-primary transition-colors truncate mb-1">
                                {product.name}
                            </Link>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={10} className="fill-current" />
                                    <span className="text-[9px] font-black italic">{product.rating}</span>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-500">
                                    <Box size={10} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">{product.stock > 0 ? "IN STOCK" : "ORDER"}</span>
                                </div>
                                {effectivePromo?.saleStock !== undefined && (
                                    <div className="text-[8px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-1.5 py-0.5 rounded">
                                        {(effectivePromo.saleStock || 0) - (effectivePromo.soldInPromo || 0)} PROMO LEFT
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Price & Primary Actions (Docked Right) */}
                        <div className="flex flex-row items-center gap-6 border-l border-border/30 pl-6 h-1/2">
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5">
                                    {effectivePromo && (
                                        <span className="text-[9px] font-bold text-muted-foreground line-through opacity-50">${product.price}</span>
                                    )}
                                    <span className="text-lg font-black italic tracking-tighter text-foreground">${discountedPrice}</span>
                                </div>
                                {effectivePromo?.saleStock && (
                                    <span className="text-[6px] font-black text-primary uppercase tracking-[0.1em] opacity-60">Avg. Unit Val.</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleAddToCart}
                                    className="h-10 px-4 rounded-xl bg-primary text-primary-foreground hover:scale-105 transition-all shadow-lg shadow-primary/20 font-black italic tracking-widest uppercase text-[8px]"
                                >
                                    <ShoppingCart size={14} className="mr-1.5" />
                                    ADD
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleToggleWishlist}
                                    className={cn("h-10 w-10 rounded-xl", isInWishlist(product.id.toString()) && "text-rose-500 bg-rose-500/10")}
                                >
                                    <Heart size={16} className={cn(isInWishlist(product.id.toString()) && "fill-current")} />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            suppressHydrationWarning
        >
            <Card className="rounded-3xl border-border bg-card overflow-hidden shadow-none transition-all duration-300 hover:border-primary/30 hover:shadow-2xl relative" suppressHydrationWarning>
                {/* Visual Status Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
                    {effectivePromo && (
                        <div className={cn(
                            "text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1",
                            effectivePromo.category === 'FLASH_SALE' ? "bg-red-500 shadow-red-500/20" : 
                            effectivePromo.category === 'DAILY_DEAL' ? "bg-amber-500 shadow-amber-500/20" : 
                            effectivePromo.category === 'SEASONAL' ? "bg-purple-600 shadow-purple-500/20" :
                            effectivePromo.category === 'EXCLUSIVE' ? "bg-indigo-600 shadow-indigo-500/20" :
                            "bg-slate-700 shadow-slate-500/20"
                        )}>
                            {effectivePromo.category === 'FLASH_SALE' ? <Zap size={8} /> : <Tag size={8} />}
                            {effectivePromo.category.replace('_', ' ')}
                        </div>
                    )}
                    {effectivePromo?.category === 'FLASH_SALE' && (
                        <div className="scale-75 origin-left">
                            <CountdownTimer endDate={effectivePromo.endDate} />
                        </div>
                    )}
                </div>

                {/* Compact Actions */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                        size="icon"
                        variant="glass"
                        onClick={handleToggleWishlist}
                        className={cn("h-8 w-8 rounded-lg backdrop-blur-xl border-white/20 shadow-sm transition-all text-slate-800 dark:text-slate-200", isInWishlist(product.id.toString()) && "bg-red-500 border-red-500 text-white")}
                    >
                        <Heart size={14} className={cn(isInWishlist(product.id.toString()) && "fill-current")} />
                    </Button>
                    <Button
                        size="icon"
                        variant="glass"
                        onClick={handleToggleComparison}
                        className={cn("h-8 w-8 rounded-lg backdrop-blur-xl border-white/20 shadow-sm transition-all text-slate-800 dark:text-slate-200", isInComparison(product.id.toString()) && "bg-primary border-primary text-white")}
                    >
                        <ArrowLeftRight size={14} />
                    </Button>
                    <Link href={`/products/${slugify(product.name)}--${product.id}`}>
                        <Button size="icon" variant="glass" className="h-8 w-8 rounded-lg backdrop-blur-xl border-white/20 shadow-sm text-slate-800 dark:text-slate-200">
                            <Maximize size={14} />
                        </Button>
                    </Link>
                </div>

                {/* Product Image Section */}
                <div className="aspect-square relative p-4 flex items-center justify-center bg-muted/20 overflow-hidden group/img">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(_: any, info: any) => {
                                if (info.offset.x > 50) {
                                    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)
                                } else if (info.offset.x < -50) {
                                    setCurrentImageIndex(prev => (prev + 1) % images.length)
                                }
                            }}
                            transition={{ duration: 0.4 }}
                            className="relative w-full h-4/5 cursor-grab active:cursor-grabbing"
                        >
                            <Image
                                src={images[currentImageIndex]}
                                alt={product.name}
                                fill
                                className="object-contain drop-shadow-xl transition-all duration-500 pointer-events-none"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Image Indicators */}
                    {hasMultipleImages && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                            {images.map((_: any, idx: number) => (
                                <div 
                                    key={idx} 
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-300",
                                        idx === currentImageIndex ? "w-6 bg-primary" : "w-1.5 bg-slate-400 dark:bg-slate-600"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-black text-primary/80 uppercase tracking-widest font-inter">{product.brand}</span>
                        <Link href={`/products/${slugify(product.name)}--${product.id}`} className="text-sm font-black font-outfit uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-1">
                            {product.name}
                        </Link>
                    </div>

                    {effectivePromo?.saleStock && (
                        <div className="flex flex-col gap-1.5 mt-2 mb-1">
                            <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-muted-foreground/80">
                                <span className="flex items-center gap-1">
                                    <Zap size={8} className="text-amber-500 animate-pulse" />
                                    Limited Promo Stock
                                </span>
                                <span>{effectivePromo.soldInPromo || 0} / {effectivePromo.saleStock} SOLD</span>
                            </div>
                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden relative">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, ((effectivePromo.soldInPromo || 0) / (effectivePromo.saleStock as number)) * 100)}%` }}
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        ((effectivePromo.soldInPromo || 0) / (effectivePromo.saleStock as number)) > 0.8 ? "bg-red-500" : "bg-primary"
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black italic tracking-tighter text-foreground leading-none">${discountedPrice}</span>
                                {effectivePromo && (
                                    <span className="text-[10px] font-bold text-muted-foreground line-through decoration-red-500/50">${product.price}</span>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={handleAddToCart}
                            className="h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:scale-110 transition-all duration-300 shadow-xl shadow-primary/20"
                        >
                            <ShoppingCart size={16} />
                        </Button>
                    </div>

                    {/* Minimal status - visible on hover */}
                    <div className="flex items-center justify-between pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 translate-y-1 group-hover:translate-y-0">
                        <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-lg",
                            product.stock > 0 ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
                        )}>
                            {product.stock > 0 ? <CheckCircle2 size={10} /> : <Box size={10} />}
                            <span className="text-[8px] font-black uppercase tracking-widest">
                                {product.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                            <Star size={10} className="fill-current" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">{product.rating}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
