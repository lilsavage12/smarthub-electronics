"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ChevronLeft, ShoppingCart, Heart, Share2, ShieldCheck,
    Truck, Zap, Star, Smartphone, Cpu, Battery, Camera,
    Maximize2, ArrowRight, Package, Box, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"
import { PRODUCTS } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-store"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ProductReviews } from "@/components/products/ProductReviews"
import { getEffectivePromotion, calculateDiscountedPrice } from "@/lib/promo-utils"
import { CountdownTimer } from "@/components/products/CountdownTimer"

export default function ProductDetailPage() {
    const { id: rawId } = useParams()
    const id = (rawId as string)?.includes('--') ? (rawId as string).split('--').pop() : rawId
    const router = useRouter()
    const { addItem } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const { user } = useAuth()
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs')
    const [selectedVariant, setSelectedVariant] = useState<any>(null)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // 1. Fetch from Primary Data Vault (Postgres)
                const res = await fetch(`/api/products/${id}`)
                if (res.ok) {
                    const data = await res.json()

                    // Parse specs if they are stored as a JSON string in Postgres
                    let parsedSpecs = data.specs
                    if (typeof data.specs === "string") {
                        try {
                            parsedSpecs = JSON.parse(data.specs)
                        } catch (e) {
                            console.warn("Failed to parse device specs vault", e)
                        }
                    }

                    setProduct({ ...data, specs: parsedSpecs })
                } else {
                    // 2. Fallback to local mock data if API fails or unit is legacy
                    const mockProduct = PRODUCTS.find(p => p.id === id)
                    if (mockProduct) {
                        setProduct(mockProduct)
                    } else {
                        toast.error("Unit not found in primary registry")
                        router.push("/products")
                    }
                }
            } catch (error) {
                console.error("Vault uplink error", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [id, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <Zap className="w-12 h-12 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Synchronizing Specs...</span>
                </div>
            </div>
        )
    }

    if (!product) return null

    // Standardize Specs for Unified View safely extracting strings only
    const specs = product.specs || {}

    const extractSpecString = (val: any, fallback: string) => {
        if (!val) return fallback;
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
            const firstString = Object.values(val).find(v => typeof v === 'string' && v.trim().length > 0)
            return (firstString as string) || fallback
        }
        return fallback;
    }

    const display = extractSpecString(specs.display || specs.displaySize, "Standard Display")
    const chipset = extractSpecString(specs.processor || specs.chipset, "Performance Series")
    const battery = extractSpecString(specs.battery || specs.batteryCapacity, "All-day Battery")
    const camera = extractSpecString(specs.camera || specs.rearCamera, "Pro-Grade Camera")

    const effectivePromo = getEffectivePromotion(product.promotions || [])
    const basePrice = selectedVariant ? selectedVariant.price : product.price
    const { discountedPrice, percentOff, savings } = calculateDiscountedPrice(basePrice, effectivePromo)

    const handleAddToCart = () => {
        addItem({
            id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
            name: `${product.name || product.modelName}${selectedVariant ? ` - ${selectedVariant.color}` : ''}`,
            price: discountedPrice,
            quantity: 1,
            image: selectedVariant && selectedVariant.images ? (typeof selectedVariant.images === 'string' ? JSON.parse(selectedVariant.images)[0] || product.image : selectedVariant.images[0] || product.image) : (product.image || product.images?.[0])
        }, user?.id)
        toast.success(`${product.name || product.modelName} ADDED TO CART`)
    }

    const handleAddToWishlist = async () => {
        const isCurrentlyIn = isInWishlist(product.id)
        await toggleWishlist(product.id, user?.id)
        
        if (isCurrentlyIn) {
            toast.error("REMOVED FROM WISHLIST")
        } else {
            toast.success("ADDED TO WISHLIST")
        }
    }

    const handleBuyNow = () => {
        handleAddToCart()
        router.push("/cart")
    }

    const handleZoom = () => {
        toast("Image zoom activated", { icon: "🔍" })
    }

    console.log("[DEBUG] Product Data on Detail Page:", {
        id: product.id,
        hasPromotions: !!product.promotions,
        promoCount: product.promotions?.length,
        discountedPrice
    })

    return (
        <div className="min-h-screen bg-background text-foreground font-inter">
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12">
                {/* Back Link */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Return to Registry
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Performance Visuals */}
                    <div className="flex flex-col gap-6">
                        <Card className="aspect-square relative p-12 bg-card border-border rounded-[3rem] overflow-hidden flex items-center justify-center shadow-2xl shadow-black/5">
                            <motion.div
                                key={selectedImage}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src={selectedVariant ? (typeof selectedVariant.images === 'string' ? JSON.parse(selectedVariant.images)[selectedImage] || product.image : selectedVariant.images?.[selectedImage] || product.image) : (product.images?.[selectedImage] || product.image)}
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </motion.div>

                            {/* Zoom Trigger */}
                            <button onClick={handleZoom} className="absolute bottom-8 right-8 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all">
                                <Maximize2 size={20} />
                            </button>
                        </Card>

                        {/* Thumbnail Carousel */}
                        {((selectedVariant ? (typeof selectedVariant.images === 'string' ? JSON.parse(selectedVariant.images) : selectedVariant.images) : product.images)?.length > 1) && (
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                {(selectedVariant ? (typeof selectedVariant.images === 'string' ? JSON.parse(selectedVariant.images) : selectedVariant.images) : product.images).map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={cn(
                                            "w-24 h-24 rounded-2xl border-2 transition-all p-2 bg-card shrink-0",
                                            selectedImage === i ? "border-primary shadow-lg shadow-primary/10" : "border-transparent hover:border-border"
                                        )}
                                    >
                                        <div className="relative w-full h-full">
                                            <Image src={img} alt="" fill className="object-contain" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Technical Specifications */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{product.brand}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">SKU: {product.sku || product.id.slice(0, 8)}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black font-outfit uppercase italic tracking-tighter leading-[0.9]">
                                {product.name || product.modelName}
                            </h1>
                            <div className="flex items-center gap-6 mt-4">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl font-black italic tracking-tighter text-primary">${discountedPrice.toFixed(2)}</span>
                                        {effectivePromo && (
                                            <span className="text-sm font-bold text-muted-foreground line-through decoration-primary/30 opacity-40">${basePrice}</span>
                                        )}
                                    </div>
                                    {effectivePromo && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded-lg">
                                                -{percentOff}% OFF / SAVE ${savings.toFixed(2)}
                                            </span>
                                            {effectivePromo.category === 'FLASH_SALE' && <CountdownTimer endDate={effectivePromo.endDate} />}
                                        </div>
                                    )}
                                </div>
                                <div className="h-12 w-[1px] bg-border mx-2" />
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <Star size={14} className="fill-amber-400 text-amber-400" />
                                        <span className="text-xs font-black uppercase italic">{product.rating || "5.0"}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Certified Performance</span>
                                </div>
                            </div>

                            {/* Variants Selection */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="flex flex-col gap-3 mt-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">SELECT COLOR</span>
                                    <div className="flex flex-wrap gap-3">
                                        {/* Original Product Option */}
                                        <button
                                            onClick={() => {
                                                setSelectedVariant(null)
                                                setSelectedImage(0)
                                            }}
                                            className={cn(
                                                "px-6 py-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest",
                                                !selectedVariant ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-border/80 text-foreground"
                                            )}
                                        >
                                            {product.specs?.color || product.color || "Standard Edition"}
                                        </button>

                                        {/* Variants Options */}
                                        {product.variants.map((variant: any) => (
                                            <button
                                                key={variant.id}
                                                onClick={() => {
                                                    setSelectedVariant(variant)
                                                    setSelectedImage(0)
                                                }}
                                                className={cn(
                                                    "px-6 py-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest",
                                                    selectedVariant?.id === variant.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-border/80 text-foreground"
                                                )}
                                            >
                                                {variant.color}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                                        {(selectedVariant ? selectedVariant.stock : product.stock) > 0 ? `${selectedVariant ? selectedVariant.stock : product.stock} IN STOCK` : 'OUT OF STOCK'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Summary Chips */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { icon: <Smartphone size={14} />, label: display, sub: "Display" },
                                { icon: <Cpu size={14} />, label: chipset, sub: "Processor" },
                                { icon: <Battery size={14} />, label: battery, sub: "Capacity" },
                            ].map((spec, i) => (
                                <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-card border border-border/50 transition-all hover:bg-slate-50 dark:hover:bg-white/5 group">
                                    <div className="text-primary group-hover:scale-110 transition-transform">{spec.icon}</div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-tight truncate">{spec.label}</span>
                                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">{spec.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex gap-4">
                                <Button
                                    onClick={handleAddToCart}
                                    className="flex-1 h-16 rounded-2xl bg-primary text-white font-black italic tracking-widest uppercase shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all gap-4"
                                >
                                    <ShoppingCart size={20} />
                                    ADD TO CART
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={handleAddToWishlist}
                                    className={cn(
                                        "h-16 w-16 rounded-2xl border-border transition-all",
                                        isInWishlist(product.id) ? "text-red-500 bg-red-500/10 border-red-500/20" : "text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <Heart size={20} className={isInWishlist(product.id) ? "fill-red-500" : ""} />
                                </Button>
                            </div>
                            <Button onClick={handleBuyNow} variant="premium" className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2">
                                BUY NOW <ArrowRight size={16} />
                            </Button>
                        </div>

                        {/* Governance & Trust Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-border mt-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-all">
                                <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest">2-YEAR WARRANTY</span>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5">SECURE COVERAGE ACTIVE</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-all">
                                <Truck className="text-primary shrink-0" size={20} />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest">EXPRESS DELIVERY</span>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5">SHIPS WITHIN 24 HOURS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Tabs: Specs & Reviews */}
                <div className="mt-24 flex flex-col gap-12">
                    <div className="flex items-center gap-8 border-b border-border pb-4">
                        <button
                            onClick={() => setActiveTab('specs')}
                            className={cn(
                                "text-sm font-black uppercase tracking-[0.2em] transition-all relative py-2",
                                activeTab === 'specs' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Technical Specs
                            {activeTab === 'specs' && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={cn(
                                "text-sm font-black uppercase tracking-[0.2em] transition-all relative py-2",
                                activeTab === 'reviews' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Customer Reviews
                            {activeTab === 'reviews' && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                            )}
                        </button>
                    </div>

                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'specs' ? (
                                <motion.div
                                    key="specs"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex flex-col gap-8"
                                >
                                    {(() => {
                                        const s = product.specs || {}
                                        const formatVal = (v: any): string | null => {
                                            if (v === null || v === undefined || v === '') return null
                                            if (typeof v === 'boolean') return v ? 'Yes' : 'No'
                                            if (typeof v === 'object') return null
                                            return String(v)
                                        }
                                        const specGroups = [
                                            {
                                                title: 'Display', items: [
                                                    { label: 'Size', val: formatVal(s.display?.size) },
                                                    { label: 'Type', val: formatVal(s.display?.type) },
                                                    { label: 'Resolution', val: formatVal(s.display?.resolution) },
                                                    { label: 'Refresh Rate', val: s.display?.refreshRate ? `${s.display.refreshRate}Hz` : null },
                                                    { label: 'Protection', val: formatVal(s.display?.protection) },
                                                ]
                                            },
                                            {
                                                title: 'Performance', items: [
                                                    { label: 'OS', val: s.performance?.os && s.performance?.osVersion ? `${s.performance.os} ${s.performance.osVersion}` : formatVal(s.performance?.os) },
                                                    { label: 'Chipset', val: formatVal(s.performance?.chipset) },
                                                    { label: 'GPU', val: formatVal(s.performance?.gpu) },
                                                    { label: 'RAM', val: s.performance?.ram ? `${s.performance.ram} GB` : null },
                                                    { label: 'Storage', val: formatVal(s.performance?.storage) },
                                                    { label: 'Expandable', val: s.performance?.expandable != null ? (s.performance.expandable ? `Yes (up to ${s.performance.expandableCapacity || 'N/A'})` : 'No') : null },
                                                ]
                                            },
                                            {
                                                title: 'Camera', items: [
                                                    { label: 'Rear Camera', val: formatVal(s.camera?.main) },
                                                    { label: 'Ultra-Wide', val: formatVal(s.camera?.ultraWide) },
                                                    { label: 'Telephoto', val: formatVal(s.camera?.telephoto) },
                                                    { label: 'Front Camera', val: formatVal(s.camera?.front) },
                                                    { label: 'Video', val: formatVal(s.camera?.video) },
                                                    { label: 'Features', val: formatVal(s.camera?.features) },
                                                ]
                                            },
                                            {
                                                title: 'Battery', items: [
                                                    { label: 'Capacity', val: s.battery?.capacity ? `${s.battery.capacity} mAh` : null },
                                                    { label: 'Charging', val: s.battery?.chargingSpeed ? `${s.battery.chargingSpeed}W` : null },
                                                    { label: 'Wireless Charging', val: s.battery?.wireless != null ? (s.battery.wireless ? 'Yes' : 'No') : null },
                                                    { label: 'Reverse Charging', val: s.battery?.reverse != null ? (s.battery.reverse ? 'Yes' : 'No') : null },
                                                ]
                                            },
                                            {
                                                title: 'Connectivity', items: [
                                                    { label: 'SIM', val: formatVal(s.connectivity?.simType) },
                                                    { label: 'Network', val: formatVal(s.connectivity?.network) },
                                                    { label: 'Wi-Fi', val: formatVal(s.connectivity?.wifi) },
                                                    { label: 'Bluetooth', val: formatVal(s.connectivity?.bluetooth) },
                                                    { label: 'NFC', val: s.connectivity?.nfc != null ? (s.connectivity.nfc ? 'Yes' : 'No') : null },
                                                    { label: 'USB', val: formatVal(s.connectivity?.usbType) },
                                                ]
                                            },
                                            {
                                                title: 'Physical', items: [
                                                    { label: 'Dimensions', val: formatVal(s.physical?.dimensions) },
                                                    { label: 'Weight', val: s.physical?.weight ? `${s.physical.weight}g` : null },
                                                    { label: 'Material', val: formatVal(s.physical?.material) },
                                                    { label: 'IP Rating', val: formatVal(s.physical?.ipRating) },
                                                ]
                                            },
                                        ]

                                        return specGroups.map(group => {
                                            const visibleItems = group.items.filter(i => i.val)
                                            if (visibleItems.length === 0) return null
                                            return (
                                                <div key={group.title} className="flex flex-col gap-3">
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic pb-2 border-b border-border/30">{group.title}</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {visibleItems.map(item => (
                                                            <div key={item.label} className="flex flex-col gap-1 p-4 rounded-2xl bg-card border border-border/50">
                                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{item.label}</span>
                                                                <span className="text-sm font-bold uppercase tracking-tight text-foreground">{item.val}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    })()}
                                    {/* Description */}
                                    {product.description && (
                                        <div className="p-6 rounded-[2rem] bg-muted/20 border border-border/50 mt-2">
                                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-3 italic">Operational Overview</h4>
                                            <p className="text-base font-medium leading-relaxed opacity-80">{product.description}</p>
                                        </div>
                                    )}
                                </motion.div>

                            ) : (
                                <motion.div
                                    key="reviews"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <ProductReviews productId={product.id} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Related Hardware Section */}
                <div className="mt-32 flex flex-col gap-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Synchronized Suggestions</span>
                            <h2 className="text-3xl md:text-4xl font-black font-outfit uppercase tracking-tighter italic">Related <span className="text-primary">Hardware</span></h2>
                        </div>
                        <Link href="/products" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary underline underline-offset-4 decoration-primary/30 transition-all">
                            View All Units
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PRODUCTS.filter(p => p.brand === product.brand && p.id !== product.id).slice(0, 4).map((related) => (
                            <Link href={`/products/${related.id}`} key={related.id} className="group">
                                <Card className="p-6 rounded-[2.5rem] border-border bg-card flex flex-col gap-6 transition-all duration-500 hover:translate-y-[-8px] hover:shadow-2xl hover:shadow-primary/5">
                                    <div className="aspect-square relative bg-muted/40 rounded-[2rem] overflow-hidden p-6">
                                        <Image src={related.image} alt={related.name} fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] font-black uppercase text-primary tracking-widest">{related.brand}</span>
                                        <h4 className="text-sm font-black italic uppercase font-outfit truncate">{related.name}</h4>
                                        <span className="text-lg font-black italic mt-1">${related.price}</span>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
