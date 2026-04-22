"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, ShoppingCart, Trash2, ArrowRight, Smartphone, Zap, Loader2, X } from "lucide-react"
import { useWishlist } from "@/lib/wishlist-store"
import { useCart } from "@/lib/cart-store"
import { useAuth } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { ProductCard } from "@/components/products/ProductCard"

export default function WishlistPage() {
    const { items, removeItem, hydrateItems, isLoaded } = useWishlist()
    const { user } = useAuth()

    useEffect(() => {
        if (!isLoaded) {
            hydrateItems()
        }
    }, [isLoaded, hydrateItems])

    if (!isLoaded) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 mt-[80px]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Loading Saved Items...</span>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="max-w-xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center gap-8 mt-[80px]">
                <div className="bg-muted p-12 rounded-[4rem] group hover:scale-105 transition-transform duration-500 border border-border">
                    <Heart className="w-24 h-24 text-red-500/20 animate-pulse" />
                </div>
                <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter ">Wishlist is Empty</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">Your future favorites are waiting to be added to your collection. Explore our catalog and save what you love.</p>
                <Link href="/products">
                    <Button variant="outline" size="lg" className="px-12 h-16 text-lg rounded-2xl shadow-xl group border-2">
                        Explore Collection
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12 mt-[100px]" suppressHydrationWarning>
            <div className="flex flex-col gap-4">
                <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl md:text-5xl font-black font-outfit uppercase tracking-tighter "
                >
                    Saved <span className="text-primary ">Collection</span>
                </motion.h1>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{items.length} ITEMS SAVED</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                <AnimatePresence mode="popLayout">
                    {items.filter(item => item.name).map((item) => {
                        const productObject = {
                            id: item.productId || item.id,
                            name: item.name,
                            image: item.image || "/favicon.ico",
                            price: item.price || 0,
                            brand: item.brand,
                            stock: item.stock || 10,
                            isSale: false,
                            discount: 0,
                            promotions: [],
                            variants: [],
                            images: item.images || [item.image]
                        }

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div className="relative group">
                                    <ProductCard product={productObject} />
                                    <button
                                        onClick={() => removeItem(item.id || item.productId, user?.id)}
                                        className="absolute top-2 right-2 z-40 w-8 h-8 bg-black/80 text-rose-500 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/10"
                                        title="Remove Item"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </div>
    )
}
