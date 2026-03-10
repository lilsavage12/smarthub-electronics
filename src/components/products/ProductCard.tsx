"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, ShoppingCart, Heart, Zap, Cpu, Battery, Maximize, ArrowLeftRight, TrendingUp, ShieldCheck, Box } from "lucide-react"
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

export const ProductCard = ({ product }: { product: any }) => {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="group relative"
        >
            <Card className="rounded-xl border-border bg-card overflow-hidden shadow-none transition-all duration-300 hover:border-primary/30 relative">
                {/* Visual Status Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
                    {product.tags?.includes("New") && (
                        <div className="bg-primary text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
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
                        className={cn("h-8 w-8 rounded-lg backdrop-blur-xl border-white/20 shadow-sm transition-all", isInWishlist(product.id.toString()) && "bg-red-500 border-red-500 text-white")}
                    >
                        <Heart size={14} className={cn(isInWishlist(product.id.toString()) && "fill-current")} />
                    </Button>
                    <Button
                        size="icon"
                        variant="glass"
                        onClick={handleToggleComparison}
                        className={cn("h-8 w-8 rounded-lg backdrop-blur-xl border-white/20 shadow-sm transition-all", isInComparison(product.id.toString()) && "bg-primary border-primary text-white")}
                    >
                        <ArrowLeftRight size={14} />
                    </Button>
                    <Link href={`/products/${slugify(product.name)}--${product.id}`}>
                        <Button size="icon" variant="glass" className="h-8 w-8 rounded-lg backdrop-blur-xl border-white/20 shadow-sm">
                            <Maximize size={14} />
                        </Button>
                    </Link>
                </div>

                {/* Product Image Section */}
                <div className="aspect-square relative p-4 flex items-center justify-center bg-muted/30 overflow-hidden group">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        className="relative w-full h-4/5"
                    >
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain transition-all duration-500"
                        />
                    </motion.div>

                    {/* Compact Image Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <div className="flex bg-background/80 backdrop-blur-sm rounded-md border border-border px-2 py-1 items-center gap-1.5">
                            <Cpu size={10} className="text-primary" />
                            <span className="text-[8px] font-black uppercase text-foreground tracking-widest">{product.specs?.processor?.split(' ')[0]}</span>
                        </div>
                    </div>
                </div>

                <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] font-inter">{product.brand}</span>
                        <Link href={`/products/${slugify(product.name)}--${product.id}`} className="text-sm font-black font-outfit uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-1">
                            {product.name}
                        </Link>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base font-black italic tracking-tighter text-foreground">${product.price}</span>
                                {product.originalPrice && (
                                    <span className="text-[10px] font-bold text-muted-foreground line-through decoration-primary/30">${product.originalPrice}</span>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={handleAddToCart}
                            className="h-11 w-11 rounded-xl bg-primary text-primary-foreground hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/20"
                        >
                            <ShoppingCart size={20} />
                        </Button>
                    </div>

                    {/* Minimal status - visible on hover */}
                    <div className="flex items-center justify-between pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 translate-y-2 group-hover:translate-y-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">IN STOCK</span>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{product.rating} ★</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
