"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useCart } from "@/lib/cart-store"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, ShieldCheck, MapPin, Tag, ArrowRight, CheckCircle2, ChevronRight, X, Minus, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface DeliveryZone {
    id: string
    city: string
    area: string
    fee: number
}

export default function CheckoutPage() {
    const { items, updateQuantity, removeItem, toggleItemSelection, toggleSelectAll, clearCart } = useCart()
    const router = useRouter()

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        city: "Nairobi",
        area: "",
        customPlace: "",
        address: "",
        notes: "",
        mpesaCode: ""
    })

    const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])
    const [isLoadingZones, setIsLoadingZones] = useState(true)
    const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
    const [promoCode, setPromoCode] = useState("")
    const [isValidatingPromo, setIsValidatingPromo] = useState(false)
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    // 1. Fetch Delivery Zones from DB
    useEffect(() => {
        async function fetchZones() {
            try {
                const res = await fetch("/api/delivery/zones")
                if (res.ok) {
                    const data = await res.json()
                    setDeliveryZones(data)
                }
            } catch (e) {
                console.error("Failed to load delivery zones", e)
            } finally {
                setIsLoadingZones(false)
            }
        }
        fetchZones()
    }, [])

    // Available distinct cities from delivery zones
    const availableCities = useMemo(() => {
        const set = new Set<string>()
        deliveryZones.forEach(z => {
            if (z.city) set.add(z.city)
        })
        const list = Array.from(set)
        return list.length ? list : ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]
    }, [deliveryZones])

    // Available areas for selected city
    const filteredAreas = useMemo(() => {
        return deliveryZones.filter(z => z.city?.toLowerCase() === form.city?.toLowerCase())
    }, [deliveryZones, form.city])

    // Handle City Change
    const handleCityChange = (newCity: string) => {
        setForm(prev => ({ ...prev, city: newCity, area: "", customPlace: "" }))
        setDeliveryFee(null)
    }

    // Handle Area Change
    const handleAreaChange = (val: string) => {
        setForm(prev => ({ ...prev, area: val }))
        if (val === "CUSTOM") {
            setDeliveryFee(null) // Custom delivery = To be communicated
        } else {
            const matched = filteredAreas.find(a => a.area === val)
            if (matched && Number(matched.fee) > 0) {
                setDeliveryFee(Number(matched.fee))
            } else {
                setDeliveryFee(null)
            }
        }
    }

    const selectedItems = useMemo(() => items.filter(i => i.selected !== false), [items])
    const subtotal = useMemo(() => selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), [selectedItems])
    const totalSelectedPieces = useMemo(() => selectedItems.reduce((acc, item) => acc + (item.quantity || 1), 0), [selectedItems])
    const allSelected = items.length > 0 && selectedItems.length === items.length

    // Discount calculation
    const discountAmount = useMemo(() => {
        if (!appliedDiscount) return 0
        if (appliedDiscount.amount > 0) return appliedDiscount.amount
        if (appliedDiscount.percent > 0) {
            return Math.round(subtotal * (appliedDiscount.percent / 100))
        }
        return 0
    }, [appliedDiscount, subtotal])

    const totalBeforeDelivery = Math.max(0, subtotal - discountAmount)
    const isFreeShipping = appliedDiscount && (
        appliedDiscount.type === 'Free Delivery' ||
        appliedDiscount.type === 'Free Shipping' ||
        appliedDiscount.code === 'FREESHIP' ||
        appliedDiscount.code === 'FREEDELIVERY'
    )

    let deliveryFeeDisplay = "--"
    let effectiveDeliveryFee = 0

    if (!form.area || !form.area.trim()) {
        deliveryFeeDisplay = "--"
        effectiveDeliveryFee = 0
    } else if (isFreeShipping) {
        deliveryFeeDisplay = "FREE"
        effectiveDeliveryFee = 0
    } else if (form.area === "CUSTOM") {
        deliveryFeeDisplay = "To be communicated"
        effectiveDeliveryFee = 0
    } else if (deliveryFee !== null && deliveryFee !== undefined) {
        effectiveDeliveryFee = Number(deliveryFee)
        deliveryFeeDisplay = `Ksh ${effectiveDeliveryFee.toLocaleString()}`
    } else {
        deliveryFeeDisplay = "--"
        effectiveDeliveryFee = 0
    }

    const finalOrderTotal = totalBeforeDelivery + effectiveDeliveryFee

    // Promo code validation
    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            toast.error("Please enter a discount code")
            return
        }
        setIsValidatingPromo(true)
        const tid = toast.loading("Checking promo code...")
        try {
            const res = await fetch("/api/discounts/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: promoCode.trim().toUpperCase(),
                    items,
                    subtotal
                })
            })
            const data = await res.json()
            if (res.ok && data) {
                const calculatedAmount = data.percent > 0 
                    ? Math.round(subtotal * (data.percent / 100))
                    : (Number(data.value) || 0)
                setAppliedDiscount({
                    ...data,
                    amount: calculatedAmount
                })
                toast.success(`Code applied: ${data.name || data.code} (${data.percent || 0}% off)`, { id: tid })
            } else {
                toast.error(data.error || "Invalid or expired promo code", { id: tid })
            }
        } catch {
            toast.error("Could not validate promo code", { id: tid })
        } finally {
            setIsValidatingPromo(false)
        }
    }

    const handleRemovePromo = () => {
        setAppliedDiscount(null)
        setPromoCode("")
        toast("Promo code removed")
    }

    const processOrder = async (sendToWhatsApp: boolean) => {
        if (selectedItems.length === 0) {
            toast.error("Please select at least one item to checkout")
            return
        }

        if (!form.fullName || !form.phone || !form.address) {
            toast.error("Please enter your name, phone number, and street address")
            return
        }

        if (form.area === "CUSTOM" && !form.customPlace.trim()) {
            toast.error("Please specify your custom delivery location")
            return
        }

        setIsSubmitting(true)
        const loadingId = toast.loading(
            sendToWhatsApp 
                ? "Placing order & preparing WhatsApp dispatch..." 
                : "Placing order & transmitting to paddock dispatch..."
        )

        const effectiveArea = form.area === "CUSTOM" 
            ? `Custom Location: ${form.customPlace}` 
            : (form.area || "Standard Delivery")

        const orderPayload = {
            customerName: form.fullName,
            customerPhone: form.phone,
            customerEmail: form.email || null,
            city: form.city || "Nairobi",
            area: effectiveArea,
            address: form.address,
            deliveryFee: effectiveDeliveryFee,
            paymentMethod: "M-PESA ON WHATSAPP",
            notes: form.notes,
            transactionCode: form.mpesaCode || null,
            promoCode: appliedDiscount?.code || null,
            items: selectedItems.map(i => ({
                productId: i.productId || i.id?.split('-')[0],
                name: i.name,
                price: i.price,
                originalPrice: i.originalPrice || i.price,
                quantity: i.quantity,
                image: i.image,
                variant: i.variant || 'L'
            }))
        }

        try {
            // 1. Sync directly to the Admin DB and trigger order emails
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload)
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Failed to place order")
            }

            const orderRef = data.orderNumber || `F1-${Date.now().toString().slice(-4)}`

            // 2. Format WhatsApp Message
            const itemLines = selectedItems.map(i => {
                const qty = Number(i.quantity) || 1
                const orig = Number(i.originalPrice) || i.price
                const isDisc = orig > i.price
                const discLabel = isDisc ? ` [SALE ~Ksh ${orig.toLocaleString()}~ Ksh ${i.price.toLocaleString()}]` : ''
                const calc = qty > 1 ? ` (Ksh ${i.price.toLocaleString()} x ${qty} = Ksh ${(i.price * qty).toLocaleString()})` : ` (Ksh ${(i.price * qty).toLocaleString()})`
                return `• ${i.name}${discLabel} - Size: ${i.variant || 'L'}, Qty: ${qty}${calc}`
            }).join('%0A')

            const message = `*NEW ORDER - F1GEAR KE*%0A*Order Ref:* ${orderRef}%0A%0A*Customer:* ${form.fullName}%0A*Phone:* ${form.phone}%0A*Email:* ${form.email || 'N/A'}%0A*City:* ${form.city || 'Nairobi'}%0A*Location/Area:* ${effectiveArea}%0A*Street/Building:* ${form.address}%0A*Delivery Fee:* ${deliveryFeeDisplay}%0A*M-Pesa Code:* ${form.mpesaCode || 'Will pay on confirmation'}%0A*Notes:* ${form.notes || 'None'}%0A%0A*ITEMS:*%0A${itemLines}%0A%0A*SUBTOTAL:* Ksh ${subtotal.toLocaleString()}%0A${appliedDiscount ? `*DISCOUNT (${appliedDiscount.code}):* -Ksh ${discountAmount.toLocaleString()}%0A` : ''}*TOTAL:* Ksh ${finalOrderTotal.toLocaleString()}%0A_Delivery: ${deliveryFeeDisplay}_`

            toast.success("Order confirmed and logged to admin!", { id: loadingId })
            
            // Remove checked items from cart
            for (const item of selectedItems) {
                await removeItem(item.id)
            }

            setIsSubmitted(true)

            if (sendToWhatsApp) {
                // Open WhatsApp with formatted order
                window.open(`https://wa.me/254142656105?text=${message}`, '_blank')
            }
        } catch (error: any) {
            console.error("Order submit error:", error)
            toast.error(error.message || "Network error. Please try again.", { id: loadingId })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#e10600]/10 border border-[#e10600]/30 flex items-center justify-center text-[#e10600]">
                    <CheckCircle2 size={32} />
                </div>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white font-f1">
                    ORDER CONFIRMED & SYNCED
                </h1>
                <p className="text-xs text-white/50 leading-relaxed">
                    Your order details have been synchronized with the admin dashboard and dispatched for WhatsApp delivery confirmation.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-[#e10600] text-white px-8 py-3 text-xs font-black uppercase tracking-widest font-f1"
                >
                    RETURN TO STORE
                </Link>
            </div>
        )
    }

    if (!items.length) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
                <h1 className="text-3xl font-black uppercase text-white font-f1">YOUR BAG IS EMPTY</h1>
                <p className="text-xs text-white/40">Add items from the collection before proceeding to checkout.</p>
                <Link
                    href="/products"
                    className="bg-[#e10600] text-white text-xs font-black uppercase tracking-widest px-8 py-3 font-f1"
                >
                    VIEW COLLECTION
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-[#0c0c0e] min-h-screen text-white pt-24 pb-20 px-6 md:px-12">
            <div className="max-w-[1440px] mx-auto">

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 mb-8 font-f1">
                    <Link href="/" className="hover:text-white transition-colors">HOME</Link>
                    <ChevronRight size={12} />
                    <Link href="/cart" className="hover:text-white transition-colors">BAG</Link>
                    <ChevronRight size={12} />
                    <span className="text-white">CHECKOUT</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left: Checkout Form (7 cols) */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Customer Information */}
                        <div className="bg-[#111114] border border-white/10 p-6 md:p-8 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <span className="w-2 h-2 bg-[#e10600]" />
                                <h2 className="text-base font-black uppercase tracking-wider text-white font-f1">
                                    1. CONTACT & CLIENT INFORMATION
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1.5 font-f1">
                                        FULL NAME *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                        placeholder="e.g. Lewis Hamilton"
                                        className="w-full bg-black/50 border border-white/15 h-11 px-4 text-xs text-white placeholder:text-white/20 focus:border-[#e10600] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1.5 font-f1">
                                        PHONE NUMBER (WHATSAPP) *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        placeholder="e.g. 0712 345 678"
                                        className="w-full bg-black/50 border border-white/15 h-11 px-4 text-xs text-white placeholder:text-white/20 focus:border-[#e10600] outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1.5 font-f1">
                                    EMAIL ADDRESS (FOR RECEIPT)
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="e.g. driver@paddock.co.ke"
                                    className="w-full bg-black/50 border border-white/15 h-11 px-4 text-xs text-white placeholder:text-white/20 focus:border-[#e10600] outline-none"
                                />
                            </div>
                        </div>

                        {/* Delivery Details */}
                        <div className="bg-[#111114] border border-white/10 p-6 md:p-8 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <span className="w-2 h-2 bg-[#e10600]" />
                                <h2 className="text-base font-black uppercase tracking-wider text-white font-f1">
                                    2. DELIVERY SELECTION & LOCATION
                                </h2>
                            </div>

                            {/* City Picker */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1.5 font-f1">
                                        SELECT CITY / REGION *
                                    </label>
                                    <select
                                        value={form.city}
                                        onChange={e => handleCityChange(e.target.value)}
                                        className="w-full bg-black/50 border border-white/15 h-11 px-4 text-xs text-white focus:border-[#e10600] outline-none"
                                    >
                                        {availableCities.map(c => (
                                            <option key={c} value={c} className="bg-[#18181b] text-white">
                                                {c.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Location/Area Picker */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1.5 font-f1">
                                        SELECT AREA / LOCATION *
                                    </label>
                                    <select
                                        value={form.area}
                                        onChange={e => handleAreaChange(e.target.value)}
                                        className="w-full bg-black/50 border border-white/15 h-11 px-4 text-xs text-white focus:border-[#e10600] outline-none"
                                    >
                                        <option value="" className="bg-[#18181b] text-white/40">-- Choose your location --</option>
                                        {filteredAreas.map(z => (
                                            <option key={z.id} value={z.area} className="bg-[#18181b] text-white">
                                                {z.area} {z.fee > 0 ? `(Ksh ${z.fee})` : '(Free Delivery)'}
                                            </option>
                                        ))}
                                        <option value="CUSTOM" className="bg-[#18181b] text-[#e10600] font-bold">
                                            + Other / Add My Own Delivery Location
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Custom Location input when CUSTOM is selected */}
                            {form.area === "CUSTOM" && (
                                <div className="p-4 bg-black/40 border border-white/10 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#e10600] block font-f1">
                                        SPECIFY YOUR DELIVERY LOCATION / ESTATE
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.customPlace}
                                        onChange={e => setForm({ ...form, customPlace: e.target.value })}
                                        placeholder="e.g. Kitengela / Juja / Naivasha town centre"
                                        className="w-full bg-[#161618] border border-[#e10600]/40 h-11 px-4 text-xs text-white placeholder:text-white/30 focus:border-[#e10600] outline-none"
                                    />
                                    <p className="text-[10px] text-white/40 italic">
                                        Delivery fee for custom locations is set as "To be communicated" and confirmed on WhatsApp.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1.5 font-f1">
                                    STREET ADDRESS / BUILDING / APARTMENT *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                    placeholder="e.g. Kimathi Street, Apex Plaza, 4th Floor"
                                    className="w-full bg-black/50 border border-white/15 h-11 px-4 text-xs text-white placeholder:text-white/20 focus:border-[#e10600] outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1.5 font-f1">
                                    DELIVERY INSTRUCTIONS / ORDER NOTES
                                </label>
                                <textarea
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Any specific delivery instructions, gate code, or preferred delivery timing..."
                                    className="w-full bg-black/50 border border-white/15 p-4 text-xs text-white placeholder:text-white/20 focus:border-[#e10600] outline-none h-20 resize-none"
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-[#111114] border border-white/10 p-6 md:p-8 space-y-4">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <span className="w-2 h-2 bg-[#e10600]" />
                                <h2 className="text-base font-black uppercase tracking-wider text-white font-f1">
                                    3. PAYMENT METHOD
                                </h2>
                            </div>

                            <div className="p-4 bg-black/40 border border-[#e10600]/40 flex items-start gap-4">
                                <div className="w-4 h-4 rounded-full border-4 border-[#e10600] bg-black mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-white font-f1">
                                        M-PESA ON WHATSAPP DISPATCH
                                    </h4>
                                    <p className="text-[11px] text-white/50 leading-relaxed mt-1">
                                        Upon clicking Transmit Order, our official dispatch team shares the M-Pesa Till / Paybill number and confirms your exact delivery location.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1.5 font-f1">
                                    M-PESA TRANSACTION CODE (OPTIONAL IF ALREADY PAID)
                                </label>
                                <input
                                    type="text"
                                    value={form.mpesaCode}
                                    onChange={e => setForm({ ...form, mpesaCode: e.target.value.toUpperCase() })}
                                    placeholder="e.g. SLK8794X2"
                                    className="w-full bg-black/50 border border-white/15 h-11 px-4 text-xs text-white font-mono placeholder:text-white/20 focus:border-[#e10600] outline-none uppercase"
                                />
                            </div>
                        </div>

                        {selectedItems.length === 0 && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider font-f1 text-center">
                                PLEASE SELECT AT LEAST ONE PIECE BELOW TO PROCEED
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isSubmitting || selectedItems.length === 0}
                                onClick={() => processOrder(false)}
                                className="w-full bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-[0.18em] h-14 flex items-center justify-center gap-2.5 transition-colors font-f1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                            >
                                <CheckCircle2 size={16} className="text-[#e10600]" />
                                <span>{isSubmitting ? "PROCESSING..." : `ORDER NOW (${totalSelectedPieces})`}</span>
                            </button>

                            <button
                                type="button"
                                disabled={isSubmitting || selectedItems.length === 0}
                                onClick={() => processOrder(true)}
                                className="w-full bg-[#e10600] hover:bg-[#c90500] text-white text-xs font-black uppercase tracking-[0.18em] h-14 flex items-center justify-center gap-2.5 transition-colors font-f1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xl"
                            >
                                <MessageCircle size={16} />
                                <span>{isSubmitting ? "TRANSMITTING..." : `ORDER WITH WHATSAPP (${totalSelectedPieces})`}</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Order Summary (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Promo Code Box */}
                        <div className="bg-[#111114] border border-white/10 p-6 space-y-4">
                            <div className="flex items-center gap-2 text-white/50">
                                <Tag size={14} className="text-[#e10600]" />
                                <span className="text-[10px] font-black uppercase tracking-widest font-f1">
                                    DISCOUNT / PROMO CODE
                                </span>
                            </div>

                            {appliedDiscount ? (
                                <div className="flex items-center justify-between bg-black/40 border border-emerald-500/30 p-3">
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400 font-f1 block">
                                            {appliedDiscount.code} APPLIED
                                        </span>
                                        <span className="text-[10px] text-white/40 font-f1">
                                            {appliedDiscount.name || 'Promo Discount'} ({appliedDiscount.percent}% off)
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemovePromo}
                                        className="text-white/40 hover:text-white p-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER CODE (e.g. PADDOCK10)"
                                        className="flex-1 bg-black/50 border border-white/15 h-10 px-3 text-xs text-white placeholder:text-white/20 uppercase font-mono focus:border-[#e10600] outline-none"
                                    />
                                    <button
                                        type="button"
                                        disabled={isValidatingPromo}
                                        onClick={handleApplyPromo}
                                        className="bg-white/10 hover:bg-[#e10600] hover:text-white text-white text-[10px] font-black uppercase tracking-widest px-4 transition-colors font-f1 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isValidatingPromo ? "..." : "APPLY"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Order Summary Box */}
                        <div className="bg-[#111114] border border-white/10 p-6 md:p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4 font-f1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase tracking-widest text-white/70 hover:text-white select-none">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        className="accent-[#e10600] w-3.5 h-3.5 cursor-pointer rounded"
                                    />
                                    <span>ORDER SUMMARY ({selectedItems.length}/{items.length})</span>
                                </label>
                                <span className="text-xs font-black text-[#e10600]">
                                    {totalSelectedPieces} {totalSelectedPieces === 1 ? 'PIECE' : 'PIECES'}
                                </span>
                            </div>

                            {/* Item list */}
                            <div className="space-y-3 max-h-[360px] overflow-y-auto no-scrollbar">
                                {items.map(item => {
                                    const isSelected = item.selected !== false
                                    return (
                                        <div 
                                            key={item.id} 
                                            className={cn(
                                                "flex gap-3 items-center border p-2.5 transition-all bg-black/30",
                                                isSelected ? "border-white/10 opacity-100" : "opacity-45 border-white/5"
                                            )}
                                        >
                                            {/* Item selection checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleItemSelection(item.id)}
                                                className="accent-[#e10600] w-3.5 h-3.5 cursor-pointer rounded shrink-0"
                                            />

                                            <div className="relative w-12 h-14 bg-black/40 border border-white/10 shrink-0 overflow-hidden">
                                                <Image
                                                    src={item.image || "/images/f1/media_1795204502659_c168030c.jpg"}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="text-xs font-black uppercase text-white truncate font-f1">
                                                        {item.name}
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-white/30 hover:text-[#e10600] transition-colors p-0.5"
                                                        title="Remove item"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 mt-1.5 font-f1">
                                                    <span className="text-[10px] text-white/50 block font-bold">
                                                        SIZE: {item.variant || 'L'}
                                                    </span>

                                                    {/* Stepper */}
                                                    <div className="flex items-center border border-white/15 bg-black/60">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                            className="w-5 h-5 flex items-center justify-center text-white/50 hover:text-white"
                                                        >
                                                            <Minus size={9} />
                                                        </button>
                                                        <span className="w-6 text-center text-[11px] font-black text-white">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={item.stock !== undefined && item.stock !== null && item.quantity >= Number(item.stock)}
                                                            className="w-5 h-5 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                                                        >
                                                            <Plus size={9} />
                                                        </button>
                                                    </div>

                                                    <span className="text-xs font-black text-white shrink-0 font-f1">
                                                        Ksh {(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Calculation Rows */}
                            <div className="border-t border-white/5 pt-4 space-y-2 text-xs font-f1">
                                <div className="flex justify-between text-white/50">
                                    <span>SUBTOTAL</span>
                                    <span className="text-white">Ksh {subtotal.toLocaleString()}</span>
                                </div>

                                {appliedDiscount && (
                                    <div className="flex justify-between text-emerald-400">
                                        <span>DISCOUNT ({appliedDiscount.code})</span>
                                        <span>-Ksh {discountAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-white/50 items-baseline">
                                    <span>DELIVERY FEE</span>
                                    <span className={cn(
                                        "font-bold",
                                        deliveryFeeDisplay === "FREE" ? "text-[#00d4aa] text-xs uppercase" :
                                        deliveryFeeDisplay === "To be communicated" ? "text-amber-400 text-[11px] uppercase" :
                                        deliveryFeeDisplay === "--" ? "text-white/40 text-xs font-mono" :
                                        "text-white"
                                    )}>
                                        {deliveryFeeDisplay}
                                    </span>
                                </div>

                                <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                                    <span className="text-sm font-black uppercase tracking-wider text-white">
                                        TOTAL
                                    </span>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-[#e10600]">
                                            Ksh {finalOrderTotal.toLocaleString()}
                                        </span>
                                        {form.area === "CUSTOM" && (
                                            <span className="block text-[9px] text-white/40 mt-0.5">
                                                + delivery fee on WhatsApp
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="p-4 bg-black/40 border border-white/5 flex items-center gap-3 text-white/50">
                            <ShieldCheck size={20} className="text-[#00d4aa] shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-widest leading-relaxed font-f1">
                                OFFICIAL PADDOCK STOCK · SECURE M-PESA CHECKOUT · COUNTRYWIDE DISPATCH
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
