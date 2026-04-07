"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, ArrowRight, Trash2, ShieldCheck, Truck, X, ChevronRight, Minus, Plus, Zap, AlertCircle } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { useAuth } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

export function CartDrawer() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems, isCartOpen, setCartOpen } = useCart()
    const { user } = useAuth()
    const [verifyingPromo, setVerifyingPromo] = React.useState(false)

    const rawTotal = totalPrice()
    const finalTotal = rawTotal // Simplified for drawer, discounts can be handled in checkout or here later

    if (!isCartOpen) return null

    return (
        <div className="fixed inset-0 z-[999]? (Actually I should use a high z-index) z-[9999] flex justify-end overflow-hidden">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCartOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            
            <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                className="relative h-full w-full max-w-[480px] bg-card border-l border-border shadow-[-40px_0_120px_rgba(0,0,0,0.5)] flex flex-col"
            >
                {/* Header */}
                <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShoppingCart size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary  leading-none">Your Selection</span>
                            <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter  leading-none mt-2">Personal <span className="text-primary ">Cart</span></h2>
                        </div>
                    </div>
                    <button 
                        onClick={() => setCartOpen(false)}
                        className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-primary/10">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                            <div className="bg-muted p-10 rounded-[3rem] border border-border opacity-20">
                                <ShoppingCart size={48} />
                            </div>
                            <h3 className="text-xl font-black uppercase  tracking-tighter">Your cart is empty</h3>
                            <Button 
                                variant="premium" 
                                onClick={() => setCartOpen(false)}
                                className="h-14 px-8 rounded-2xl"
                            >
                                START SHOPPING
                            </Button>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {items.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center gap-5 group"
                                >
                                    <div className="w-20 h-20 bg-muted/20 border border-border rounded-2xl p-2 relative shrink-0 group-hover:border-primary/40 transition-colors">
                                        <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <h4 className="text-[13px] font-black uppercase  tracking-tight leading-tight truncate">{item.name}</h4>
                                            <button 
                                                onClick={() => removeItem(item.id, user?.id)}
                                                className="text-muted-foreground hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="text-[11px] font-bold text-primary font-outfit uppercase tracking-tighter">
                                            KSh {Math.round(item.price).toLocaleString()} × {item.quantity}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex items-center bg-muted/40 border border-border/50 rounded-lg px-2 py-1">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), user?.id)}
                                                    className="w-4 h-4 flex items-center justify-center text-xs font-black hover:text-primary transition-colors disabled:opacity-30"
                                                    disabled={item.quantity <= 1}
                                                >-</button>
                                                <span className="text-[10px] font-black w-6 text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1, user?.id)}
                                                    className="w-4 h-4 flex items-center justify-center text-xs font-black hover:text-primary transition-colors disabled:opacity-30"
                                                    disabled={item.stock !== undefined && item.quantity >= item.stock}
                                                >+</button>
                                            </div>
                                            <span className="text-[11px] font-black ml-auto">KSh {Math.round(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-8 border-t border-border bg-muted/30 flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground ">
                                <span>Global Assets Value</span>
                                <span>KSh {Math.round(rawTotal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-500 ">
                                <span>Logistics / Shipping</span>
                                <span className="underline decoration-dotted underline-offset-4 decoration-emerald-500/30">Free Coverage</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-border pt-4">
                            <span className="text-xs font-black uppercase  tracking-widest opacity-40">Estimated Total</span>
                            <span className="text-3xl font-black font-outfit uppercase tracking-tighter leading-none ">KSh {Math.round(finalTotal).toLocaleString()}</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <Link href="/checkout" onClick={() => setCartOpen(false)}>
                                <Button variant="premium" size="lg" className="h-16 w-full rounded-2xl font-black  uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                                    INITIALIZE CHECKOUT <ArrowRight className="ml-3 w-5 h-5" />
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                onClick={() => setCartOpen(false)}
                                className="h-14 w-full rounded-2xl font-black  uppercase tracking-widest text-[9px] hover:bg-muted"
                            >
                                CONTINUE SHOPPING
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 justify-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]  opacity-40">
                             <ShieldCheck size={12} /> SECURED SMART TRANSACTION ENGINE
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
