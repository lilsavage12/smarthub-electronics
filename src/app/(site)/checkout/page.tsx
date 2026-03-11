"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
    ShieldCheck, Truck, CreditCard, ChevronLeft, ChevronRight,
    MapPin, Phone, Mail, Building, Landmark, Smartphone, Zap,
    CheckCircle2, Lock, AlertCircle, ShoppingCart, Info, BarChart3, Clock,
    Gift, ArrowRight, Tag
} from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { toast } from "react-hot-toast"

export default function CheckoutPage() {
    const { items, totalPrice, totalItems, clearCart } = useCart()
    const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Success
    const [paymentMethod, setPaymentMethod] = useState("card")
    const [isProcessing, setIsProcessing] = useState(false)
    const [confirmedOrderNumber, setConfirmedOrderNumber] = useState("")
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        city: "NAIROBI (EXPRESS)",
        phone: "",
        mpesaNumber: ""
    })

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault()
        // Simple validation
        if (!formData.firstName || !formData.email || !formData.phone) {
            toast.error("Please complete the Shipping Details")
            return
        }
        setStep(2)
        window.scrollTo(0, 0)
    }

    const [promoCode, setPromoCode] = useState("")
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string, percent: number } | null>(null)

    const handleApplyPromo = () => {
        if (promoCode.toUpperCase() === "SAVE20") {
            setAppliedDiscount({ code: "SAVE20", percent: 20 })
            toast.success("20% DISCOUNT APPLIED", {
                style: { background: '#0F0F12', color: '#10B981', fontWeight: 'bold', fontSize: '10px' }
            })
        } else if (promoCode.toUpperCase() === "SMARTHUB") {
            setAppliedDiscount({ code: "SMARTHUB", percent: 15 })
            toast.success("15% DISCOUNT APPLIED")
        } else {
            toast.error("Invalid Promo Protocol")
        }
    }

    // Calculations
    const subtotal = totalPrice()
    const shipping = 0
    const discountAmount = appliedDiscount ? Math.round(subtotal * (appliedDiscount.percent / 100)) : 0
    const tax = Math.round((subtotal - discountAmount) * 0.08)
    const finalTotal = subtotal - discountAmount + shipping + tax

    const handleCompleteOrder = async () => {
        setIsProcessing(true)
        const loadingToast = toast.loading("Processing Payment...")

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    totalAmount: finalTotal,
                    paymentMethod: paymentMethod.toUpperCase(),
                    items: items
                })
            })

            if (res.ok) {
                const order = await res.json()
                setConfirmedOrderNumber(order.orderNumber)
                toast.success("Payment Successful", { id: loadingToast })
                setStep(3)
                clearCart()
            } else {
                toast.error("Payment Failed: Please try again", { id: loadingToast })
            }
        } catch (error) {
            console.error(error)
            toast.error("Connection Error: Please try again", { id: loadingToast })
        } finally {
            setIsProcessing(false)
        }
    }

    if (step === 3) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center gap-12">
                <div className="relative">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 100 }}
                        className="h-40 w-40 bg-primary/10 rounded-full flex items-center justify-center p-8 border border-primary/20"
                    >
                        <CheckCircle2 className="h-full w-full text-primary" />
                    </motion.div>
                    <div className="absolute top-0 left-0 w-full h-full -z-10 bg-primary/20 blur-[100px] animate-pulse rounded-full" />
                </div>

                <div className="flex flex-col gap-4">
                    <h1 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter italic">Order <span className="text-primary italic">Placed</span></h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
                        Welcome to the future. Your order <span className="text-foreground font-black italic">#{confirmedOrderNumber || 'SH-PROC-OK'}</span> has been received and is being prepared for delivery.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-y border-border/50 py-12">
                    <div className="flex flex-col gap-2">
                        <Mail className="w-5 h-5 text-primary mx-auto mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Receipt sent to</span>
                        <span className="text-sm font-black italic">{formData.email || 'customer@example.io'}</span>
                    </div>
                    <div className="flex flex-col gap-2 border-x border-border/50 px-4">
                        <Truck className="w-5 h-5 text-primary mx-auto mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estimated Delivery</span>
                        <span className="text-sm font-black italic">Today, 2:30 PM (Nairobi)</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary mx-auto mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Warranty Status</span>
                        <span className="text-sm font-black italic">Active on SmartHub App</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 mt-4">
                    <Link href="/products">
                        <Button variant="premium" size="lg" className="px-12 h-16 text-lg rounded-2xl shadow-xl group">
                            CONTINUE SHOPPING
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link href="/account/orders">
                        <Button variant="outline" size="lg" className="px-12 h-16 text-lg rounded-2xl border-2">TRACK ORDER STATUS</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <Link href="/cart" className="hover:text-primary transition-colors flex items-center gap-2">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back to Cart
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:items-start">
                {/* Checkout Flow Area */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-2xl md:text-3xl font-black font-outfit uppercase tracking-tighter italic">Secure <span className="text-primary italic">Checkout</span></h1>
                        <div className="flex items-center gap-4">
                            <div className={cn("h-1.5 flex-1 rounded-full border border-border overflow-hidden bg-muted")}>
                                <motion.div className="h-full bg-primary" animate={{ width: step === 1 ? "50%" : "100%" }} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">STEP {step} / 2</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="shipping"
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                className="flex flex-col gap-6"
                            >
                                <div className="flex items-center gap-3 border-l-2 border-primary pl-4">
                                    <MapPin className="w-6 h-6 text-primary" />
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-black font-outfit uppercase italic tracking-tighter italic leading-none">Shipping Address</h2>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Where should we send your order?</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10 p-6 rounded-2xl border border-border/50 backdrop-blur-md">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="EX: JOHN SMITH"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="PROTO@SMARTHUB.IO"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">Street Address</label>
                                        <input
                                            type="text"
                                            placeholder="EX: TECH CANYON 102, 5TH FLOOR"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">City / Region</label>
                                        <select
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm appearance-none"
                                        >
                                            <option>NAIROBI (EXPRESS - 24H)</option>
                                            <option>NAIROBI ENYIRONS (48H)</option>
                                            <option>MOMBASA (3-5 DAYS)</option>
                                            <option>KISUMU (3-5 DAYS)</option>
                                            <option>NAKURU (3-5 DAYS)</option>
                                            <option>ELDORET (3-5 DAYS)</option>
                                            <option>OTHER COUNTIES (G4S)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">Safaricom Number</label>
                                        <input
                                            type="tel"
                                            placeholder="07XX XXX XXX"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                                    <Truck className="w-6 h-6 text-primary flex-shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black italic uppercase">NATIONWIDE DELIVERY VIA G4S</span>
                                        <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">We deliver to all 47 counties within 48-72 hours.</p>
                                    </div>
                                </div>

                                <Button onClick={handleNextStep} variant="premium" size="lg" className="h-14 text-xs font-black italic tracking-[0.2em] rounded-xl shadow-xl group uppercase">
                                    CONTINUE TO PAYMENT
                                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                className="flex flex-col gap-8"
                            >
                                <div className="flex items-center gap-3 border-l-2 border-primary pl-4">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-black font-outfit uppercase italic tracking-tighter italic leading-none">Payment Method</h2>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Local and International Options</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: "mpesa", name: "M-PESA / STK", icon: <Smartphone size={20} />, desc: "Instant Checkout" },
                                        { id: "lipapolepole", name: "Lipa Pole Pole", icon: <Clock size={20} />, desc: "Deposit 10% Plan" },
                                        { id: "bonga", name: "Bonga Points", icon: <Gift size={20} />, desc: "Redeem Points" },
                                        { id: "card", name: "Credit / Debit", icon: <CreditCard size={20} />, desc: "Visa / Mastercard" },
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl border transition-all group relative overflow-hidden text-left",
                                                paymentMethod === method.id
                                                    ? "bg-primary/5 border-primary text-primary shadow-sm"
                                                    : "bg-muted/5 border-border/50 text-muted-foreground hover:border-primary/30"
                                            )}
                                        >
                                            <div className={cn("p-3 rounded-lg transition-colors", paymentMethod === method.id ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                                                {method.icon}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black italic text-[11px] uppercase tracking-widest">{method.name}</span>
                                                <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">{method.desc}</span>
                                            </div>
                                            {paymentMethod === method.id && <div className="absolute top-2 right-2 text-primary"><CheckCircle2 className="w-3.5 h-3.5" /></div>}
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    {paymentMethod === "card" && (
                                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-muted/20 rounded-2xl border border-border/50 flex flex-col gap-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Lock className="w-3.5 h-3.5 text-primary" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest italic opacity-60">SECURE PAYMENT</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">Card Number</label>
                                                <input placeholder="0000 0000 0000 0000" className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">EXP</label>
                                                    <input placeholder="MM/YY" className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary" />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">CVV</label>
                                                    <input placeholder="888" className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    {paymentMethod === "mpesa" && (
                                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-teal-500/5 rounded-2xl border border-teal-500/20 flex flex-col gap-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Smartphone className="w-5 h-5 text-teal-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic text-teal-800">M-PESA PAYMENT</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[8px] uppercase font-black tracking-widest text-teal-700 ml-3">Confirm Safaricom Number</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-teal-500">+254</span>
                                                    <input
                                                        placeholder="722 XX XX XX"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full h-11 bg-background border border-teal-200 rounded-xl pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-teal-500"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-[8px] text-teal-700/60 leading-tight uppercase font-black text-center mt-1">An STK Push for KES {(finalTotal * 130).toLocaleString()} will be sent to your phone.</p>
                                        </motion.div>
                                    )}
                                    {paymentMethod === "lipapolepole" && (
                                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col gap-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Clock className="w-5 h-5 text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic text-primary">LIPA POLE POLE (INSTALLMENTS)</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase text-muted-foreground">Initial Deposit (10%)</span>
                                                    <span className="text-sm font-black italic text-primary">${Math.round(finalTotal * 0.1)}</span>
                                                </div>
                                                <ArrowRight className="text-muted-foreground w-4 h-4" />
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[8px] font-black uppercase text-muted-foreground">Balance Balance</span>
                                                    <span className="text-sm font-black italic">${finalTotal - Math.round(finalTotal * 0.1)}</span>
                                                </div>
                                            </div>
                                            <p className="text-[8px] text-muted-foreground leading-tight uppercase font-black text-center mt-1">Item will be reserved for 60 days. Delivery after full payment.</p>
                                        </motion.div>
                                    )}
                                    {paymentMethod === "bonga" && (
                                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 flex flex-col gap-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Gift className="w-5 h-5 text-emerald-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic text-emerald-800">PAY WITH BONGA POINTS</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[8px] uppercase font-black tracking-widest text-emerald-700 ml-3">Enter Bonga Points to Use</label>
                                                <input placeholder="E.G. 50,000" className="w-full h-11 bg-background border border-emerald-200 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-emerald-500" />
                                            </div>
                                            <p className="text-[8px] text-emerald-700/60 leading-tight uppercase font-black text-center mt-1">10 Bonga Points = KES 3.00. Current coverage: 15% of total.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex flex-col gap-4">
                                    <Button onClick={handleCompleteOrder} variant="premium" size="lg" className="h-16 text-sm font-black italic tracking-[0.2em] rounded-2xl shadow-2xl group uppercase relative overflow-hidden">
                                        <span className="relative z-10 flex items-center gap-2">
                                            PLACE ORDER
                                            <Zap className="w-4 h-4 fill-white" />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Button>
                                    <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest text-center flex items-center justify-center gap-2">
                                        <Lock className="w-3 h-3" />
                                        SECURE 256-BIT ENCRYPTION
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Sidebar: Order Review */}
                <div className="lg:col-span-2 flex flex-col gap-6 sticky top-24">
                    <div className="bg-background border border-border rounded-[2rem] p-6 shadow-sm overflow-hidden relative">
                        <h3 className="text-lg font-black font-outfit uppercase tracking-tighter italic border-b border-border/50 pb-4 mb-6 flex items-center justify-between">
                            Order Review
                            <span className="text-[9px] bg-muted border border-border px-2 py-0.5 rounded-md font-black not-italic">{totalItems()} ITEMS</span>
                        </h3>

                        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2 mb-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 group">
                                    <div className="h-14 w-14 bg-muted rounded-xl flex-shrink-0 relative overflow-hidden p-1.5 group-hover:bg-primary/10 transition-colors border border-border/50">
                                        <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                                    </div>
                                    <div className="flex flex-col flex-1 gap-0.5">
                                        <span className="text-[11px] font-black font-outfit uppercase italic leading-tight">{item.name}</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{item.storage || '256GB'} • {item.color || 'Dark'}</span>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[8px] font-black italic bg-muted-foreground/10 px-1.5 py-0.5 rounded uppercase">QTY: {item.quantity}</span>
                                            <span className="text-[11px] font-black text-foreground font-outfit tracking-tighter">${item.price * item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Promo Code Section */}
                        <div className="pb-6 border-b border-border/30 mb-6 flex flex-col gap-3">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Promo Protocol</span>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="ENTER CODE"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    className="flex-1 bg-muted/30 border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                                />
                                <Button onClick={handleApplyPromo} size="sm" variant="outline" className="rounded-xl text-[9px] font-black uppercase tracking-widest border-2 h-11 px-4">Apply</Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3.5 pt-6 border-t border-border/50 bg-background relative z-10">
                            <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-foreground">${subtotal}</span>
                            </div>
                            {appliedDiscount && (
                                <div className="flex justify-between items-center text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-in slide-in-from-right-4">
                                    <span className="flex items-center gap-1.5">
                                        <Tag size={10} />
                                        Discount ({appliedDiscount.percent}%)
                                    </span>
                                    <span>-${discountAmount}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                <span>Fast Shipping</span>
                                <span className="text-teal-500">FREE</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/30 pb-4">
                                <span>Tax</span>
                                <span className="text-foreground">${tax}</span>
                            </div>
                            <div className="flex justify-between items-end pt-1">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary italic">Total</span>
                                    <span className="text-3xl font-black font-outfit tracking-tighter text-foreground uppercase italic leading-none">${finalTotal}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-muted/10 border border-border/50 rounded-2xl flex flex-col gap-4">
                        <h4 className="text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            Our Guarantee
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            {[
                                { icon: <Lock size={12} />, text: "PCI-DSS Compliant Encryption" },
                                { icon: <Clock size={12} />, text: "14-Day Return Policy" },
                                { icon: <Info size={12} />, text: "100% Authentic Products" }
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground leading-tight hover:text-foreground transition-all cursor-default">
                                    <span className="text-primary">{item.icon}</span>
                                    {item.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
