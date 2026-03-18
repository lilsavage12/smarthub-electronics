"use client"

import React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, ShoppingBag, Trash2, X, ArrowUpRight, Plus, Sparkles } from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { useWishlist } from "@/lib/wishlist-store"
import { useCart } from "@/lib/cart-store"
import { toast } from "react-hot-toast"
import DashboardLayout from "@/components/customer/DashboardLayout"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
    const { user, isInitialized } = useAuth()
    const router = useRouter()
    const { items, removeItem, loadWishlist } = useWishlist()
    const { addItem } = useCart()

    React.useEffect(() => {
        if (!isInitialized) return

        if (!user) {
            router.push("/login")
            return
        }
        loadWishlist(user.id)
    }, [user, router, loadWishlist])

    if (!user) return null

    const handleAddToCart = (item: any) => {
        addItem({
            id: item.id,
            productId: item.productId || item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: item.image
        }, user?.id)
        toast.success(`${item.name} added to cart`, {
            icon: '🛍️',
            style: {
                borderRadius: '12px',
                background: '#333',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }
        })
    }

    const handleRemove = (id: string, name: string) => {
        removeItem(id, user?.id)
        toast.success("Removed from wishlist")
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">My Wishlist</h1>
                        <p className="text-muted-foreground">
                            {items.length} {items.length === 1 ? "product" : "products"} you're watching
                        </p>
                    </div>
                </div>

                {/* Wishlist Items */}
                {items.length === 0 ? (
                    <div className="bg-card border border-border border-dashed rounded-[3rem] p-16 text-center flex flex-col items-center justify-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center relative">
                            <Heart className="w-10 h-10 text-rose-500/40" />
                            <Sparkles className="absolute top-2 right-2 w-5 h-5 text-rose-300 animate-pulse" />
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-2xl font-bold mb-2">Dream list is empty</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Save the gadgets you're eyeing for later. They'll wait for you here until you're ready to make them yours.
                            </p>
                        </div>
                        <Link href="/">
                            <Button className="rounded-2xl px-8 h-12 uppercase tracking-widest text-[10px] font-black italic">
                                Explore Collection
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group bg-card border border-border rounded-[2rem] overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex flex-col"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-square overflow-hidden bg-accent/30">
                                        <Link href={`/products/${item.id}`}>
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </Link>
                                        
                                        {/* Quick Actions Overlay */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                                            <button
                                                onClick={() => handleRemove(item.id, item.name)}
                                                className="w-10 h-10 bg-white/90 dark:bg-black/90 text-rose-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform backdrop-blur-md"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <Link href={`/products/${item.id}`}>
                                                <div className="w-10 h-10 bg-white/90 dark:bg-black/90 text-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform backdrop-blur-md">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </div>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-1 gap-4">
                                        <div className="space-y-2">
                                            <Link href={`/products/${item.id}`}>
                                                <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors uppercase italic tracking-tight">
                                                    {item.name}
                                                </h3>
                                            </Link>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-black font-outfit italic tracking-tighter">
                                                    ${item.price.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest bg-accent px-3 py-1 rounded-full">
                                                    In Stock
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-2">
                                            <Button
                                                onClick={() => handleAddToCart(item)}
                                                className="w-full rounded-2xl h-14 flex items-center justify-center gap-3 font-black uppercase italic tracking-widest text-xs transition-all shadow-xl shadow-primary/10 hover:shadow-primary/20"
                                            >
                                                <ShoppingBag className="w-4 h-4" />
                                                Add to Bag
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Shopping Suggestion */}
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left overflow-hidden relative">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full" />
                    <div className="relative z-10 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Ready to upgrade?</span>
                        <h4 className="text-xl font-bold">Free shipping on all gadgets today.</h4>
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Available across all 47 counties.</p>
                    </div>
                    <Link href="/products" className="relative z-10 shrink-0">
                        <Button variant="outline" className="rounded-xl px-8 h-12 uppercase tracking-widest text-[10px] font-black italic border-2">
                            Return to shop
                        </Button>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    )
}
