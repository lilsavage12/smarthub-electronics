"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, ArrowRight, Trash2, ShieldCheck, Truck, RefreshCw, CreditCard, ChevronLeft, Minus, Plus, Zap, AlertCircle } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart()
    const [promoInput, setPromoInput] = React.useState("")
    const [activeDiscount, setActiveDiscount] = React.useState<{ type: string, value: string, code: string } | null>(null)
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
            const flat = parseInt(activeDiscount.value.replace("$", "")) || 0
            discountAmount = flat
            discountedTotal -= discountAmount
            if (discountedTotal < 0) discountedTotal = 0
        }
    }

    const tax = Math.round(discountedTotal * 0.08)
    const finalTotal = discountedTotal + shipping + tax

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
                toast.success(`Discount Applied: ${data.discount.value} off`)
                setActiveDiscount(data.discount)
                setPromoInput("") // Clear input
            } else {
                toast.error(data.error || "Invalid or Expired Protocol Token", {
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
            toast.error("Network constraint: Unable to verify protocol")
        } finally {
            setVerifyingPromo(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="max-w-xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center gap-8">
                <div className="bg-muted p-12 rounded-[4rem] group hover:scale-105 transition-transform duration-500 border border-border">
                    <ShoppingCart className="w-24 h-24 text-muted-foreground/30 animate-pulse" />
                </div>
                <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter italic">Your Cart is Empty</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">It looks like you haven't added any items to your cart yet. Start exploring our latest deals.</p>
                <Link href="/products">
                    <Button variant="premium" size="lg" className="px-12 h-16 text-lg rounded-2xl shadow-xl group">
                        Start Shopping
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
                <Link href="/products" className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-primary transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back to Store
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-black font-outfit uppercase tracking-tighter italic leading-none">Your <span className="text-primary italic">Shopping Cart</span></h1>
                    <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg text-primary font-black text-[10px] border border-primary/20 uppercase tracking-widest">
                        <Zap className="w-3.5 h-3.5" fill="currentColor" />
                        Ready for Delivery
                    </div>
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
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-base font-black font-outfit uppercase italic leading-tight hover:text-primary transition-colors cursor-pointer">{item.name}</h3>
                                        <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 p-1.5 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                        <span>Color: <span className="text-foreground">{item.color || "Default"}</span></span>
                                        <div className="w-1 h-1 bg-border rounded-full" />
                                        <span>Storage: <span className="text-foreground">{item.storage || "256GB"}</span></span>
                                    </div>

                                    <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                                        <div className="flex items-center gap-3 bg-background border border-border rounded-lg px-3 py-1.5">
                                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="text-sm font-black text-muted-foreground hover:text-primary">-</button>
                                            <span className="text-xs font-black min-w-[15px] text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-sm font-black text-muted-foreground hover:text-primary">+</button>
                                        </div>
                                        <div className="h-6 w-[1px] bg-border mx-1" />
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-foreground font-outfit tracking-tighter uppercase leading-none">${item.price * item.quantity}</span>
                                            <span className="text-[8px] uppercase font-black text-muted-foreground tracking-widest mt-0.5">${item.price} UNIT</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="flex flex-col gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/10 mt-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Truck className="w-4 h-4 text-primary" />
                            Delivery Instructions
                        </h4>
                        <textarea
                            placeholder="Enter any instructions for delivery..."
                            className="bg-background border border-border/50 rounded-xl p-3 text-xs font-medium outline-none focus:border-primary transition-all min-h-[80px] resize-none uppercase"
                        />
                    </div>
                </div>

                {/* Order Summary Summary */}
                <div className="flex flex-col gap-5 sticky top-24">
                    <div className="flex flex-col gap-6 p-6 bg-muted border border-border rounded-[2rem] shadow-sm">
                        <h2 className="text-lg font-black font-outfit uppercase tracking-tighter italic">Order Summary</h2>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className={cn(activeDiscount && "line-through opacity-50")}>${rawTotal}</span>
                            </div>
                            {activeDiscount && (
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                    <span className="flex items-center gap-1">
                                        <Zap size={10} fill="currentColor" />
                                        Discount ({activeDiscount.code})
                                    </span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                <span>Shipping</span>
                                <span className="text-teal-500">FREE</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                <span>Tax (8%)</span>
                                <span className="text-foreground">${tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-border/50 pt-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1 leading-none">Total Amount</span>
                                <span className="text-3xl font-black text-foreground font-outfit tracking-tighter leading-none">${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-2">
                            <div className="flex items-center gap-2.5 p-2.5 bg-teal-500/5 rounded-xl border border-teal-500/10">
                                <ShieldCheck className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-teal-700/70 leading-tight">Securely encrypted checkout</span>
                            </div>
                            <Link href="/checkout">
                                <Button variant="premium" size="lg" className="h-12 rounded-xl text-[10px] font-black italic tracking-widest uppercase">
                                    CHECKOUT
                                </Button>
                            </Link>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="PROMO CODE"
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                                className="w-full h-10 bg-background border border-border rounded-lg pl-3 pr-20 text-[9px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all"
                            />
                            <button
                                onClick={handleApplyPromo}
                                disabled={verifyingPromo}
                                className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary text-primary-foreground px-3 rounded text-[8px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {verifyingPromo ? <RefreshCw className="animate-spin w-3 h-3" /> : "APPLY"}
                            </button>
                        </div>
                        {activeDiscount && (
                            <button
                                onClick={() => setActiveDiscount(null)}
                                className="text-[8px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 mt-[-10px] text-right"
                            >
                                Remove Coupon
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
