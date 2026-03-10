"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, ShoppingCart, Heart, Zap, Cpu, Battery, Maximize, ArrowLeftRight, TrendingUp, ShieldCheck, Box, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"
import { useComparison } from "@/lib/comparison-store"
import { toast } from "react-hot-toast"

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
    const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
    const { addItem: addToComparison, removeItem: removeFromComparison, isInComparison } = useComparison()

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            id: product.id.toString(),
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
        })
        toast.success(`${product.name} ADDED TO CART`, {
            style: {
                background: '#0F0F12',
                color: '#fff',
                border: '1px solid #1A1A1D',
                fontSize: '10px',
                fontWeight: '900',
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
            toast.error("Removed from Comparison")
        } else {
            addToComparison({
                id: product.id.toString(),
                name: product.name,
                price: product.price,
                image: product.image,
                brand: product.brand,
                specs: product.specs
            })
            toast.success("Added to Comparison")
        }
    }

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isInWishlist(product.id.toString())) {
            removeFromWishlist(product.id.toString())
            toast.error("Removed from Wishlist")
        } else {
            addToWishlist({
                id: product.id.toString(),
                name: product.name,
                price: product.price,
                image: product.image
            })
            toast.success("Added to Wishlist")
        }
    }

    if (viewMode === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="group relative w-full"
            >
                <Card className="rounded-3xl border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:border-primary/40 relative flex flex-col md:flex-row h-auto md:h-64">
                    {/* Visual Status Badges */}
                    <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                        {product.tags?.includes("New") && (
                            <div className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-primary/20">
                                <Box size={10} fill="currentColor" />
                                NEW
                            </div>
                        )}
                        {product.isSale && (
                            <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-500/20">
                                <TrendingUp size={10} />
                                SALE
                            </div>
                        )}
                    </div>

                    {/* Left: Image Section */}
                    <div className="md:w-[300px] aspect-square md:aspect-auto relative p-8 flex items-center justify-center bg-muted/30 overflow-hidden group/img border-r border-border shrink-0">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="relative w-full h-full min-h-[160px]"
                        >
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain drop-shadow-2xl transition-all duration-700"
                            />
                        </motion.div>
                    </div>

                    {/* Middle & Right: Content Section */}
                    <CardContent className="p-8 flex flex-col md:flex-row flex-1 justify-between gap-8 h-full">
                        {/* Middle: Details */}
                        <div className="flex flex-col justify-center max-w-xl">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] font-inter mb-2">{product.brand}</span>
                            <Link href={`/products/${slugify(product.name)}--${product.id}`} className="text-2xl font-black font-outfit uppercase tracking-tight leading-none group-hover:text-primary transition-colors mb-4 line-clamp-2">
                                {product.name}
                            </Link>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={14} className="fill-amber-500" />
                                    <span className="text-sm font-black italic">{product.rating}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-border" />
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <CheckCircle2 size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">In Stock</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {product.specs?.processor && (
                                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-xl text-muted-foreground border border-border/50">
                                        <Cpu size={14} className="text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{product.specs.processor.split(' ')[0]}</span>
                                    </div>
                                )}
                                {product.specs?.battery && (
                                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-xl text-muted-foreground border border-border/50">
                                        <Battery size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{product.specs.battery}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Pricing & Actions */}
                        <div className="flex flex-col justify-center items-end border-l border-border/50 pl-8 min-w-[200px]">
                            <div className="flex flex-col items-end mb-6">
                                {product.originalPrice && (
                                    <span className="text-xs font-bold text-muted-foreground line-through decoration-red-500/50 mb-1">${product.originalPrice}</span>
                                )}
                                <span className="text-4xl font-black italic tracking-tighter text-foreground leading-none">${product.price}</span>
                                {product.originalPrice && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-2 bg-red-500/10 px-2 py-1 rounded-lg">
                                        Save ${product.originalPrice - product.price}
                                    </span>
                                )}
                            </div>

                            <div className="flex w-full gap-3">
                                <Button
                                    onClick={handleAddToCart}
                                    className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/20 font-black italic tracking-widest uppercase text-[10px]"
                                >
                                    <ShoppingCart size={16} className="mr-2" />
                                    Add Setup
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={handleToggleWishlist}
                                    className={cn("h-12 w-12 rounded-2xl border-border shrink-0 text-muted-foreground hover:text-foreground hover:border-foreground transition-all", isInWishlist(product.id.toString()) && "bg-red-50 border-red-200 text-red-500 hover:text-red-600 hover:border-red-300 dark:bg-red-500/10 dark:border-red-500/20")}
                                >
                                    <Heart size={18} className={cn(isInWishlist(product.id.toString()) && "fill-current")} />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={handleToggleComparison}
                                    className={cn("h-12 w-12 rounded-2xl border-border shrink-0 text-muted-foreground hover:text-foreground hover:border-foreground transition-all", isInComparison(product.id.toString()) && "bg-primary/10 border-primary/20 text-primary")}
                                >
                                    <ArrowLeftRight size={18} />
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
        >
            <Card className="rounded-3xl border-border bg-card overflow-hidden shadow-none transition-all duration-300 hover:border-primary/30 hover:shadow-2xl relative">
                {/* Visual Status Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
                    {product.tags?.includes("New") && (
                        <div className="bg-primary text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-md shadow-primary/20">
                            <Box size={8} fill="currentColor" />
                            NEW
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
                <div className="aspect-square relative p-6 flex items-center justify-center bg-muted/20 overflow-hidden group/img">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className="relative w-full h-4/5"
                    >
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain drop-shadow-xl transition-all duration-500"
                        />
                    </motion.div>

                    {/* Compact Image Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover/img:opacity-100 transition-all duration-300 translate-y-2 group-hover/img:translate-y-0">
                        <div className="flex bg-background/90 backdrop-blur-md rounded-xl border border-border px-3 py-1.5 items-center gap-2 shadow-lg">
                            <Cpu size={12} className="text-primary" />
                            <span className="text-[9px] font-black uppercase text-foreground tracking-widest">{product.specs?.processor?.split(' ')[0]}</span>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-primary/80 uppercase tracking-[0.2em] font-inter">{product.brand}</span>
                        <Link href={`/products/${slugify(product.name)}--${product.id}`} className="text-lg font-black font-outfit uppercase tracking-tight leading-none group-hover:text-primary transition-colors line-clamp-1">
                            {product.name}
                        </Link>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black italic tracking-tighter text-foreground leading-none">${product.price}</span>
                                {product.originalPrice && (
                                    <span className="text-[11px] font-bold text-muted-foreground line-through decoration-red-500/50">${product.originalPrice}</span>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={handleAddToCart}
                            className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground hover:scale-110 transition-all duration-300 shadow-xl shadow-primary/20"
                        >
                            <ShoppingCart size={20} />
                        </Button>
                    </div>

                    {/* Minimal status - visible on hover */}
                    <div className="flex items-center justify-between pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 translate-y-2 group-hover:translate-y-0">
                        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <CheckCircle2 size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">IN STOCK</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
                            <Star size={12} className="fill-current" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">{product.rating}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
