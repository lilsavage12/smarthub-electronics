"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, ShoppingCart, Trash2, ArrowRight, Smartphone, Zap } from "lucide-react"
import { useWishlist } from "@/lib/wishlist-store"
import { useCart } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

export default function WishlistPage() {
    const { items, removeItem } = useWishlist()
    const { addItem } = useCart()

    const handleMoveToCart = (item: any) => {
        addItem({ ...item, quantity: 1 })
        removeItem(item.id)
        toast.success(`${item.name} moved to your Hub!`, {
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

    if (items.length === 0) {
        return (
            <div className="max-w-xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center gap-8 mt-[80px]">
                <div className="bg-muted p-12 rounded-[4rem] group hover:scale-105 transition-transform duration-500 border border-border">
                    <Heart className="w-24 h-24 text-red-500/20 animate-pulse" />
                </div>
                <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter italic">Wishlist is Silent</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">Your future flagships are waiting to be highjacked. Explore our collection and save what you love.</p>
                <Link href="/products">
                    <Button variant="premium" size="lg" className="px-12 h-16 text-lg rounded-2xl shadow-xl group">
                        Explore Flagships
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12 mt-[80px]">
            <div className="flex flex-col gap-4">
                <h1 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter italic">Your <span className="text-red-500 italic">Saved Vault</span></h1>
                <p className="text-muted-foreground uppercase text-xs font-black tracking-widest">{items.length} High-Priority Items Targetted</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-background border border-border rounded-[2.5rem] p-8 group relative flex flex-col gap-6 shadow-sm hover:shadow-2xl transition-all"
                        >
                            <div className="relative aspect-square w-full bg-muted/30 rounded-3xl overflow-hidden p-8 flex items-center justify-center border border-border/50">
                                <Image src={item.image} alt={item.name} fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-full text-muted-foreground hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter italic">{item.name}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-black text-primary font-outfit">${item.price}</span>
                                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-[10px] font-black uppercase text-primary border border-primary/20">
                                        <Zap className="w-3 h-3 fill-primary" />
                                        In Stock
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="premium"
                                size="lg"
                                className="w-full h-16 rounded-2xl flex items-center gap-3 text-lg font-black italic tracking-widest shadow-xl group"
                                onClick={() => handleMoveToCart(item)}
                            >
                                MOVE TO HUB
                                <ShoppingCart className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
