"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, ArrowRight, Trash2, ShieldCheck, Truck, RefreshCw, CreditCard, ChevronLeft, Minus, Plus, Zap, AlertCircle } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { useAuth } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart()
    const { user } = useAuth()
    const [promoInput, setPromoInput] = React.useState("")
    const [activeDiscount, setActiveDiscount] = React.useState<{ type: string, value: string, code: string, name?: string } | null>(null)
    const [verifyingPromo, setVerifyingPromo] = React.useState(false)

    const rawTotal = totalPrice()
    const shipping = rawTotal > 0 ? 0 : 0 // Free for now

    // Calculate discounted subtotal
    let discountedTotal = rawTotal
    let discountAmount = 0
    if (activeDiscount) {
        if (activeDiscount.type === "Percentage") {
            const pct = parseInt(activeDiscount.value.replace("%", "")) || 0
            discountAmount = rawTotal * (pct / 100)
            discountedTotal -= discountAmount
        } else if (activeDiscount.type === "Fixed Amount") {
            const flat = parseInt(activeDiscount.value.replace("KSh", "")) || 0
            discountAmount = flat
            discountedTotal -= discountAmount
            if (discountedTotal < 0) discountedTotal = 0
        }
    }

    const finalTotal = discountedTotal + shipping

    const { toast } = require("react-hot-toast")

    const handleApplyPromo = async () => {
        if (!promoInput) return

        setVerifyingPromo(true)
        try {
            const res = await fetch("/api/discounts/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: promoInput.toUpperCase() })
            })
            const data = await res.json()

            if (res.ok) {
                toast.success(`${data.discount.name || 'Discount'} Applied: ${data.discount.value} off`)
                setActiveDiscount(data.discount)
                setPromoInput("") // Clear input
            } else {
                toast.error(data.error || "Sorry, that code didn't work", {
                    icon: "🚫",
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
                setActiveDiscount(null)
            }
        } catch (error) {
            toast.error("Connection error. Please try again.")
        } finally {
            setVerifyingPromo(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="max-w-xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center gap-8" suppressHydrationWarning>
                <div className="bg-muted p-12 rounded-[4rem] group hover:scale-105 transition-transform duration-500 border border-border" suppressHydrationWarning>
                    <ShoppingCart className="w-24 h-24 text-muted-foreground/30 animate-pulse" />
                </div>
                <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter " suppressHydrationWarning>Your Cart is Empty</h1>
                <p className="text-muted-foreground text-lg leading-relaxed" suppressHydrationWarning>It looks like you haven't added any items to your cart yet. Start exploring our latest deals.</p>
                <Link href="/products" suppressHydrationWarning>
                    <Button variant="premium" size="lg" className="px-12 h-16 text-lg rounded-2xl shadow-xl group" suppressHydrationWarning>
                        Start Shopping
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-xs-fluid py-md-fluid flex flex-col gap-sm-fluid" suppressHydrationWarning>
            <div className="flex flex-col gap-3">
                <Link href="/products" className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-primary transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back to Store
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <h1 className="text-3xl md:text-4xl font-black font-outfit uppercase tracking-tighter  leading-none">Your <span className="text-primary ">Cart</span></h1>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
                {/* Item List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="flex flex-col md:flex-row items-center gap-5 p-4 bg-muted/20 border border-border rounded-2xl hover:bg-muted/30 transition-all group"
                            >
                                <div className="w-24 h-24 md:w-28 md:h-28 relative bg-background rounded-xl border border-border p-3 flex-shrink-0 group-hover:shadow-lg transition-all overflow-hidden">
                                    <Image src={item.image} alt={item.name} fill className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-500" />
                                </div>

                                <div className="flex-1 flex flex-col gap-1 w-full text-center md:text-left">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-black font-outfit uppercase  leading-tight hover:text-primary transition-colors cursor-pointer">{item.name}</h3>
                                        <button onClick={() => removeItem(item.id, user?.id)} className="text-muted-foreground hover:text-red-500 p-1.5 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                                         <div className="flex items-center gap-3 bg-background border border-border rounded-lg px-3 py-1.5">
                                             <button 
                                                 onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), user?.id)} 
                                                 className="text-sm font-black text-muted-foreground hover:text-primary transition-colors disabled:opacity-20"
                                                 disabled={item.quantity <= 1}
                                             >-</button>
                                             <input 
                                                 type="number"
                                                 value={item.quantity}
                                                 onChange={(e) => {
                                                     const val = parseInt(e.target.value)
                                                     if (!isNaN(val)) {
                                                         updateQuantity(item.id, val, user?.id)
                                                     }
                                                 }}
                                                 className="w-10 bg-transparent border-none text-center text-xs font-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                 min="1"
                                                 max={item.stock || 999}
                                             />
                                             <button 
                                                 onClick={() => updateQuantity(item.id, item.quantity + 1, user?.id)} 
                                                 className="text-sm font-black text-muted-foreground hover:text-primary transition-colors disabled:opacity-20"
                                                 disabled={item.stock !== undefined && item.quantity >= item.stock}
                                             >+</button>
                                         </div>
                                         <div className="h-6 w-[1px] bg-border mx-1" />
                                         <div className="flex flex-col text-left">
                                             <span className="text-xl font-black text-foreground font-outfit tracking-tighter uppercase leading-none">KSh {Math.round(item.price * item.quantity).toLocaleString()}</span>

                                         </div>
                                     </div>
                                     
                                     {item.stock !== undefined && item.stock <= 5 && item.stock > 0 && (
                                         <div className="flex items-center gap-1.5 text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1 bg-rose-500/5 w-fit px-2 py-0.5 rounded-md">
                                             <AlertCircle size={10} />
                                             Only {item.stock} units left in stock
                                         </div>
                                     )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                </div>

                {/* Order Summary Summary */}
                <div className="flex flex-col gap-5 sticky top-24">
                    <div className="flex flex-col gap-6 p-10 bg-muted/40 border border-border rounded-[2.5rem] shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 leading-none">Subtotal</span>
                                <span className="text-2xl font-black text-foreground font-outfit tracking-tighter leading-none ">KSh {Math.round(finalTotal).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link href="/checkout" className="w-full">
                                <Button variant="premium" size="lg" className="w-full h-14 rounded-xl text-xs-fluid font-black  tracking-widest uppercase shadow-xl shadow-primary/20">
                                    CHECKOUT NOW
                                </Button>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
