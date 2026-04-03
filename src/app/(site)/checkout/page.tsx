"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
    ShieldCheck, Truck, CreditCard, ChevronLeft, ChevronRight,
    MapPin, Phone, Mail, Building, Landmark, Smartphone, Zap,
    CheckCircle2, Lock, AlertCircle, ShoppingCart, Info, BarChart3, Clock,
    Gift, ArrowRight, Tag, Plus, Check
} from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { useAuth } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface Address {
    id: string
    fullName: string
    phone: string
    street: string
    city: string
    postalCode: string
    country: string
    isDefault: boolean
}

export default function CheckoutPage() {
    const { items, totalPrice, totalItems, clearCart } = useCart()
    const { user } = useAuth()
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [paymentOption, setPaymentOption] = useState<"cod" | "online" | null>(null)
    const [selectedOnlineMethod, setSelectedOnlineMethod] = useState("mpesa")
    const [isProcessing, setIsProcessing] = useState(false)
    const [confirmedOrderNumber, setConfirmedOrderNumber] = useState("")
    const [addresses, setAddresses] = useState<Address[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [saveNewAddress, setSaveNewAddress] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [transactionCode, setTransactionCode] = useState("")
    
    useEffect(() => {
        setIsMounted(true)
    }, [])
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        city: "",
        phone: "",
        postalCode: "",
        country: "Kenya",
        area: "",
        notes: ""
    })

    const [deliveryFee, setDeliveryFee] = useState(0)
    const [availableCities, setAvailableCities] = useState<string[]>([])
    const [availableAreas, setAvailableAreas] = useState<any[]>([])
    const [isLoadingZones, setIsLoadingZones] = useState(false)

    const [promoCode, setPromoCode] = useState("")
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string, percent: number, name?: string } | null>(null)

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.displayName || "",
                email: user.email
            }))
            fetchAddresses()
        }
        fetchCities()
    }, [user])

    const fetchCities = async () => {
        try {
            const res = await fetch("/api/delivery/zones")
            if (res.ok) {
                const data = await res.json()
                const uniqueCities = Array.from(new Set(data.map((z: any) => z.city))) as string[]
                setAvailableCities(uniqueCities)
            }
        } catch (err) { console.error("Failed to fetch cities", err) }
    }

    useEffect(() => {
        if (!formData.city) {
            setAvailableAreas([])
            return
        }
        
        const fetchAreas = async () => {
            setIsLoadingZones(true)
            try {
                const res = await fetch(`/api/delivery/zones?city=${formData.city}`)
                if (res.ok) {
                    const data = await res.json()
                    setAvailableAreas(data)
                }
            } catch (err) { console.error("Failed to fetch areas", err) }
            finally { setIsLoadingZones(false) }
        }
        fetchAreas()
    }, [formData.city])

    const fetchAddresses = async () => {
        if (!user) return
        
        try {
            const res = await fetch(`/api/addresses?userId=${user.id}`)
            if (res.ok) {
                const data = await res.json()
                setAddresses(data)
                
                const defaultAddr = data.find((addr: Address) => addr.isDefault)
                if (defaultAddr) {
                    selectAddress(defaultAddr)
                }
            }
        } catch (error) {
            console.error("Failed to fetch addresses:", error)
        }
    }

    const selectAddress = (address: Address) => {
        setSelectedAddressId(address.id)
        setFormData(prev => ({
            ...prev,
            firstName: address.fullName.split(' ')[0] || '',
            lastName: address.fullName.split(' ').slice(1).join(' ') || '',
            phone: address.phone,
            address: address.street,
            city: address.city,
            postalCode: address.postalCode || '',
            country: address.country
        }))
        setShowAddressForm(false)
    }

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.firstName || !formData.email || !formData.phone) {
            toast.error("Please complete the Shipping Details")
            return
        }
        setStep(2)
        window.scrollTo(0, 0)
    }

    const handleApplyPromo = async () => {
        if (!promoCode) return toast.error("Enter a code first")
        
        const tid = toast.loading("Validating promo code...")
        try {
            const res = await fetch("/api/discounts/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: promoCode })
            })
            
            const data = await res.json()
            if (res.ok) {
                setAppliedDiscount({ code: data.code, percent: data.percent, name: data.name })
                toast.success(`${data.name || data.value} discount applied`, { id: tid })
            } else {
                toast.error(data.error || "That code didn't work", { id: tid })
            }
        } catch (error) {
            toast.error("Connection error", { id: tid })
        }
    }

    const subtotal = totalPrice()
    const shipping = deliveryFee
    const discountAmount = appliedDiscount ? Math.round(subtotal * (appliedDiscount.percent / 100)) : 0
    const finalTotal = subtotal - discountAmount + shipping

    const handleCompleteOrder = async () => {
        setIsProcessing(true)
        const loadingToast = toast.loading("Confirming your order...")

        try {
            // Save new address if needed
            if (saveNewAddress && user && !selectedAddressId) {
                await fetch("/api/addresses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        fullName: `${formData.firstName} ${formData.lastName}`,
                        phone: formData.phone,
                        street: formData.address,
                        city: formData.city,
                        postalCode: formData.postalCode,
                        country: formData.country,
                        isDefault: addresses.length === 0
                    })
                })
            }

            // Create order with payment status
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id || null,
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    country: formData.country,
                    totalAmount: finalTotal,
                    deliveryFee: shipping,
                    paymentMethod: paymentOption === 'cod' ? 'CASH ON DELIVERY' : selectedOnlineMethod.toUpperCase(),
                    paymentStatus: paymentOption === 'cod' ? 'PENDING' : 'PENDING', // Both start as pending until verified
                    items: items,
                    promoCode: appliedDiscount?.code,
                    transactionCode: paymentOption === 'online' ? transactionCode : null,
                    notes: formData.notes,
                    area: formData.area
                })
            })

            const data = await res.json()

            if (res.ok) {
                setConfirmedOrderNumber(data.orderNumber)
                toast.success("Order successful!", { id: loadingToast })
                
                // Clear local cart
                clearCart()
                
                // Clear database cart if user is logged in
                if (user?.id) {
                    await fetch(`/api/cart?userId=${user.id}`, {
                        method: "DELETE"
                    })
                }
                
                setStep(3)
            } else {
                toast.error(data.error || "Payment Failed: Please try again", { id: loadingToast })
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
                    <h1 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter italic">
                        Order <span className="text-primary italic">Confirmed!</span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
                        Thanks! Your order <span className="text-foreground font-black italic">#{confirmedOrderNumber}</span> is being packed and will be delivered soon.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 mt-4">
                    <Link href="/products">
                        <Button variant="premium" size="lg" className="px-12 h-16 text-lg rounded-2xl shadow-xl group">
                            CONTINUE SHOPPING
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-xs-fluid py-md-fluid flex flex-col gap-sm-fluid">
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <Link href="/cart" className="hover:text-primary transition-colors flex items-center gap-2">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back to Cart
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:items-start">
                <div className="lg:col-span-3 flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-2xl md:text-3xl font-black font-outfit uppercase tracking-tighter italic">
                            Secure <span className="text-primary italic">Checkout</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className={cn("h-1.5 flex-1 rounded-full border border-border overflow-hidden bg-muted")}>
                                <motion.div className="h-full bg-primary" animate={{ width: step === 1 ? "50%" : "100%" }} />
                            </div>
                            <span className="text-xs-fluid font-black uppercase tracking-widest text-primary italic whitespace-nowrap">STEP {step} OF 2</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <ShippingStep 
                                formData={formData}
                                setFormData={setFormData}
                                addresses={addresses}
                                selectedAddressId={selectedAddressId}
                                selectAddress={selectAddress}
                                showAddressForm={showAddressForm}
                                setShowAddressForm={setShowAddressForm}
                                saveNewAddress={saveNewAddress}
                                setSaveNewAddress={setSaveNewAddress}
                                user={user}
                                promoCode={promoCode}
                                setPromoCode={setPromoCode}
                                handleApplyPromo={handleApplyPromo}
                                handleNextStep={handleNextStep}
                                availableCities={availableCities}
                                availableAreas={availableAreas}
                                isLoadingZones={isLoadingZones}
                                setDeliveryFee={setDeliveryFee}
                            />
                        ) : (
                            <PaymentStep 
                                paymentOption={paymentOption}
                                setPaymentOption={setPaymentOption}
                                transactionCode={transactionCode}
                                setTransactionCode={setTransactionCode}
                                formData={formData}
                                setFormData={setFormData}
                                finalTotal={finalTotal}
                                handleCompleteOrder={handleCompleteOrder}
                                isProcessing={isProcessing}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {isMounted && (
                    <OrderSummary 
                        items={items}
                        subtotal={subtotal}
                        discountAmount={discountAmount}
                        appliedDiscount={appliedDiscount}
                        shipping={shipping}
                        finalTotal={finalTotal}
                        totalItems={totalItems}
                    />
                )}
            </div>
        </div>
    )
}

// Shipping Step Component
function ShippingStep({ 
    formData, setFormData, addresses, selectedAddressId, selectAddress,
    showAddressForm, setShowAddressForm, saveNewAddress, setSaveNewAddress,
    user, promoCode, setPromoCode, handleApplyPromo, handleNextStep,
    availableCities, availableAreas, isLoadingZones, setDeliveryFee
}: any) {
    return (
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
                    <h2 className="text-lg font-black font-outfit uppercase italic tracking-tighter leading-none">
                        Shipping Address
                    </h2>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        Enter your delivery details
                    </span>
                </div>
            </div>

            {/* Saved Addresses */}
            {user && addresses.length > 0 && !showAddressForm && (
                <div className="flex flex-col gap-3 p-4 bg-muted/20 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Saved Addresses</span>
                        <button
                            onClick={() => setShowAddressForm(true)}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" />
                            Add New
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {addresses.map((addr: Address) => (
                            <button
                                key={addr.id}
                                onClick={() => selectAddress(addr)}
                                className={cn(
                                    "text-left p-3 rounded-lg border-2 transition-all",
                                    selectedAddressId === addr.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold">{addr.fullName}</span>
                                            {addr.isDefault && (
                                                <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {addr.street}, {addr.city}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{addr.phone}</p>
                                    </div>
                                    {selectedAddressId === addr.id && (
                                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Manual Address Form */}
            {(showAddressForm || addresses.length === 0 || !user) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10 p-6 rounded-2xl border border-border/50 backdrop-blur-md">
                    {showAddressForm && addresses.length > 0 && (
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowAddressForm(false)
                                    if (addresses.length > 0) {
                                        const defaultAddr = addresses.find((a: Address) => a.isDefault) || addresses[0]
                                        selectAddress(defaultAddr)
                                    }
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Use saved address
                            </button>
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">
                            Your Name *
                        </label>
                        <input
                            type="text"
                            placeholder="YOUR NAME"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">
                            Your Email *
                        </label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">
                            City *
                        </label>
                        <select
                            value={formData.city}
                            onChange={(e) => {
                                setFormData({ ...formData, city: e.target.value, area: "" })
                                setDeliveryFee(0)
                            }}
                            className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm appearance-none"
                        >
                            <option value="">SELECT CITY</option>
                            {availableCities.map(city => (
                                <option key={city} value={city}>{city.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">
                            Area / Neighborhood *
                        </label>
                        <select
                            disabled={!formData.city || isLoadingZones}
                            value={formData.area}
                            onChange={(e) => {
                                const area = availableAreas.find(a => a.area === e.target.value)
                                if (area) {
                                    setFormData({ ...formData, area: area.area })
                                    setDeliveryFee(Number(area.fee))
                                }
                            }}
                            className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm appearance-none disabled:opacity-50"
                        >
                            <option value="">{isLoadingZones ? 'LOADING...' : 'SELECT AREA'}</option>
                            {availableAreas.map(a => (
                                <option key={a.id} value={a.area}>{a.area.toUpperCase()} (KSH {a.fee})</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">
                            Street Address / Landmarks *
                        </label>
                        <input
                            type="text"
                            placeholder="E.G. MOI AVENUE, APARTMENT 4B, NEAR STADIUM"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[8px] uppercase font-black tracking-widest text-muted-foreground ml-3">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            placeholder="+254 712 345 678"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-11 bg-background border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>

                    {user && (showAddressForm || addresses.length === 0) && (
                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="saveAddress"
                                checked={saveNewAddress}
                                onChange={(e) => setSaveNewAddress(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="saveAddress" className="text-xs font-medium">
                                Save this address to my account
                            </label>
                        </div>
                    )}
                </div>
            )}

            <div className="p-6 bg-primary/[0.03] border border-primary/10 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-primary" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground italic">
                            Have a Promo Code?
                        </span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60">
                            Enter your code to get a discount
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="relative flex-1 group/promo">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within/promo:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Enter promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="w-full h-12 bg-background border border-border rounded-xl pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <Button 
                        onClick={handleApplyPromo}
                        variant="outline"
                        className="h-12 px-8 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all"
                    >
                        APPLY
                    </Button>
                </div>
            </div>

            {/* Delivery Notes Integration */}
            <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 flex items-center gap-2">
                    <Clock size={12} className="text-primary italic" />
                    Delivery Instructions (Optional)
                </label>
                <textarea
                    placeholder="E.G. DROP OFF AT THE RECEPTION, CALL ME ON ARRIVAL, NEAR THE BLUE GATE..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full min-h-[100px] bg-muted/5 border border-border rounded-[1.5rem] p-5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm resize-none focus:bg-background h-24"
                />
            </div>

            <Button onClick={handleNextStep} variant="premium" size="lg" className="h-14 md:h-16 text-xs-fluid font-black italic tracking-[0.2em] rounded-xl shadow-xl group uppercase">
                NEXT: PAYMENT
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
        </motion.div>
    )
}

// Payment Step Component
function PaymentStep({ 
    paymentOption, setPaymentOption, 
    transactionCode, setTransactionCode, 
    formData, setFormData, finalTotal, 
    handleCompleteOrder, isProcessing 
}: any) {
    return (
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
                    <h2 className="text-lg font-black font-outfit uppercase italic tracking-tighter leading-none">
                        How would you like to pay?
                    </h2>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        Choose your payment method
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pay on Delivery Option */}
                <button
                    onClick={() => setPaymentOption("cod")}
                    className={cn(
                        "flex flex-col gap-2 p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group",
                        paymentOption === "cod"
                            ? "bg-primary/5 border-primary shadow-lg"
                            : "bg-muted/5 border-border/50 hover:border-primary/30"
                    )}
                >
                    <div className="flex items-center justify-between w-full">
                        <div className={cn(
                            "p-3 rounded-xl transition-colors",
                            paymentOption === "cod" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        )}>
                            <Truck size={24} />
                        </div>
                        {paymentOption === "cod" && <CheckCircle2 className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="flex flex-col mt-2">
                        <span className="font-black italic text-sm uppercase tracking-widest leading-tight">Cash on Delivery</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Pay by Cash or M-PESA at your door</span>
                    </div>
                </button>

                {/* Online Payment Option */}
                <button
                    onClick={() => setPaymentOption("online")}
                    className={cn(
                        "flex flex-col gap-2 p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group",
                        paymentOption === "online"
                            ? "bg-primary/5 border-primary shadow-lg"
                            : "bg-muted/5 border-border/50 hover:border-primary/30"
                    )}
                >
                    <div className="flex items-center justify-between w-full">
                        <div className={cn(
                            "p-3 rounded-xl transition-colors",
                            paymentOption === "online" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        )}>
                            <Smartphone size={24} />
                        </div>
                        {paymentOption === "online" && <CheckCircle2 className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="flex flex-col mt-2">
                        <span className="font-black italic text-sm uppercase tracking-widest leading-tight">Pay Now...</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Manual M-PESA Verification</span>
                    </div>
                </button>
            </div>

            {/* Manual M-PESA Details Section */}
            <AnimatePresence>
                {paymentOption === "online" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 border-t border-border/50 flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-primary/[0.03] border border-primary/20 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Smartphone className="text-primary w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-primary tracking-widest italic">M-PESA DETAILS</span>
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Follow steps to pay</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-3 py-2">
                                        <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Paybill / Till</span>
                                            <span className="text-sm font-black tracking-widest text-foreground select-all">123456</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Account Number</span>
                                            <span className="text-sm font-black tracking-widest text-foreground select-all">SMARTHUB</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Store Name</span>
                                            <span className="text-sm font-black tracking-widest text-foreground">SMARTHUB ELECTRONICS</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-primary/5 p-3 rounded-xl">
                                        <p className="text-[8px] font-bold text-primary uppercase tracking-widest leading-relaxed text-center">
                                            Total to pay: <span className="text-[10px] font-black">KSh {Math.round(finalTotal).toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-3 italic">
                                            Enter Transaction Code *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="E.G. SKL123ABCD"
                                            value={transactionCode}
                                            onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                                            className="h-14 bg-background border-2 border-primary/30 rounded-xl px-4 text-sm font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all shadow-lg shadow-primary/5"
                                        />
                                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1 ml-3 opacity-60">
                                            Verification will be done by our admin team
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* COD Disclaimer */}
            <AnimatePresence>
                {paymentOption === "cod" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-4"
                    >
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 italic">
                                Payment Note
                            </span>
                            <p className="text-[9px] font-medium text-amber-900/60 leading-relaxed uppercase tracking-wider">
                                Please have the exact amount ready. You can pay our driver by cash or M-PESA.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col gap-4">
                <Button 
                    onClick={handleCompleteOrder} 
                    disabled={isProcessing || !paymentOption}
                    variant="premium" 
                    size="lg" 
                    className="h-16 text-sm font-black italic tracking-[0.2em] rounded-2xl shadow-2xl group uppercase relative overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {isProcessing ? "PROCESSING..." : !paymentOption ? "SELECT A PAYMENT OPTION" : (paymentOption === 'online' && !transactionCode) ? "ENTER TRANSACTION CODE" : "FINISH ORDER"}
                        <Zap className="w-4 h-4 fill-white" />
                    </span>
                </Button>
                <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest text-center flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3" />
                    YOUR CHECKOUT IS SAFE AND SECURE
                </p>
            </div>
        </motion.div>
    )
}

// Order Summary Component
function OrderSummary({ items, subtotal, discountAmount, appliedDiscount, shipping, finalTotal, totalItems }: any) {
    return (
        <div className="lg:col-span-2 flex flex-col gap-6 sticky top-24">
            <div className="bg-background border border-border rounded-[2rem] p-6 shadow-sm overflow-hidden relative">
                <h3 className="text-lg font-black font-outfit uppercase tracking-tighter italic border-b border-border/50 pb-4 mb-6 flex items-center justify-between">
                    Your Order
                    <span className="text-[9px] bg-muted border border-border px-2 py-0.5 rounded-md font-black not-italic">
                        {totalItems()} ITEMS
                    </span>
                </h3>

                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2 mb-6">
                    {items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 group">
                            <div className="h-14 w-14 bg-muted rounded-xl flex-shrink-0 relative overflow-hidden p-1.5 group-hover:bg-primary/10 transition-colors border border-border/50">
                                <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                            </div>
                            <div className="flex flex-col flex-1 gap-0.5">
                                <span className="text-[11px] font-black font-outfit uppercase italic leading-tight">
                                    {item.name}
                                </span>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[10px] font-black italic bg-muted-foreground/10 px-1.5 py-0.5 rounded uppercase">
                                        QTY: {item.quantity}
                                    </span>
                                    <span className="text-sm font-black text-foreground font-outfit tracking-tighter">
                                        KSh {Math.round(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3.5 pt-6 border-t border-border/50 bg-background relative z-10">
                    <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span className="text-foreground">KSh {Math.round(subtotal).toLocaleString()}</span>
                    </div>
                    {appliedDiscount && (
                        <div className="flex justify-between items-center text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5">
                                <Tag size={10} />
                                {appliedDiscount.name || 'Discount'} ({appliedDiscount.percent}%)
                            </span>
                            <span>-KSh {Math.round(discountAmount).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        <span>Shipping</span>
                        <span className={shipping > 0 ? "text-foreground" : "text-teal-500"}>
                            {shipping > 0 ? `KSh ${Math.round(shipping).toLocaleString()}` : 'FREE'}
                        </span>
                    </div>
                    <div className="flex justify-between items-end pt-1">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-widest text-primary italic">Total</span>
                            <span className="text-3xl font-black font-outfit tracking-tighter text-foreground uppercase italic leading-none">
                                KSh {Math.round(finalTotal).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
