"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ChevronLeft, ShoppingCart, Heart, Share2, ShieldCheck,
    Truck, Zap, Star, Smartphone, Cpu, Battery, Camera,
    Maximize2, ArrowRight, Package, Box, RefreshCw, X,
    CheckCircle2, AlertCircle, Info, ArrowRightLeft,
    ShieldAlert, ChevronRight, Copy, Check, Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"
import { useAuth } from "@/lib/auth-store"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ProductCard } from "@/components/products/ProductCard"

const BROKEN_UNSPLASH_IDS = [
    "1434493907317-a46b5bc78344",
    "1675243911244-65910b39678c",
    "1707065090150-136746ef9204"
]

const validateImageUrl = (url: string) => {
    const BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    if (!url) return BLANK_IMAGE
    if (typeof url !== 'string') return url
    const isBroken = BROKEN_UNSPLASH_IDS.some(id => url.includes(id))
    return isBroken ? BLANK_IMAGE : url
}

export default function ProductDetailPage() {
    const { id: rawId } = useParams()
    const id = (rawId as string)?.includes('--') ? (rawId as string).split('--').pop() : rawId
    const router = useRouter()
    const { addItem } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const { user } = useAuth()
    
    const [product, setProduct] = useState<any>(null)
    const [relatedProducts, setRelatedProducts] = useState<any[]>([])
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [activeTab, setActiveTab] = useState<'specs'>('specs')
    const [selectedVariant, setSelectedVariant] = useState<any>(null)
    const [selectedColor, setSelectedColor] = useState<string>("")
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [copied, setCopied] = useState(false)
    const formatPrice = (p: number) => `KSh ${Math.round(p).toLocaleString()}`

    const scrollRef = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll()
    const stickyBarOpacity = useTransform(scrollY, [600, 700], [0, 1])
    const stickyBarY = useTransform(scrollY, [600, 700], [100, 0])

    const effectivePromo = React.useMemo(() => {
        if (!product || !product.promotions || product.promotions.length === 0) return null
        return product.promotions.reduce((prev: any, current: any) => {
            return (prev.discount || prev.value || 0) > (current.discount || current.value || 0) ? prev : current
        })
    }, [product])

    const currentPrice = (selectedVariant?.price !== null && selectedVariant?.price !== undefined) 
        ? selectedVariant.price 
        : (product?.price || 0)

    const { discountedPrice, originalPrice, percentOff, savings } = React.useMemo(() => {
        // If a variant is selected, use its price as base.
        const isVariantActive = selectedVariant !== null && selectedVariant !== undefined
        const base = Number(currentPrice || product?.price || 0)
        
        if (!product) return { discountedPrice: base, originalPrice: base, percentOff: 0, savings: 0 }
        
        // 1. Check for manual Discount Price in specs - ONLY for base product, not when variant is active
        const manualDiscountPrice = product.specs?.identity?.discountPrice
        if (!isVariantActive && manualDiscountPrice && !isNaN(parseFloat(manualDiscountPrice))) {
            const dp = parseFloat(manualDiscountPrice)
            return { discountedPrice: dp, originalPrice: base, percentOff: Math.round(((base - dp) / base) * 100), savings: base - dp }
        }

        // 2. Check for manual Discount Percentage
        if (product.discount && product.discount > 0) {
            const dp = base * (1 - product.discount / 100)
            return { discountedPrice: dp, originalPrice: base, percentOff: product.discount, savings: base - dp }
        }

        // 3. Fallback to active Promotions (Applies to variants too)
        if (effectivePromo) {
            const disc = effectivePromo.discount || effectivePromo.value || 0
            const dp = base * (1 - disc / 100)
            return { discountedPrice: dp, originalPrice: base, percentOff: disc, savings: base - dp }
        }

        return { discountedPrice: base, originalPrice: base, percentOff: 0, savings: 0 }
    }, [currentPrice, product, effectivePromo, selectedVariant])

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    
                    // Parse Gallery Assets
                    let galleryAssets = []
                    try { galleryAssets = JSON.parse(data.galleryImages || "[]") } catch(e) {}
                    
                    const normalizedGallery = [data.image, ...galleryAssets].filter(Boolean)
                    const uniqueImages = [...new Set(normalizedGallery)]

                    let parsedSpecs = data.specs
                    if (typeof data.specs === "string") {
                        try { parsedSpecs = JSON.parse(data.specs) } catch (e) {}
                    }

                    const fullProduct = { 
                        ...data, 
                        specs: parsedSpecs,
                        images: uniqueImages.map(validateImageUrl)
                    }
                    setProduct(fullProduct)
                    
                    // Use consolidated related products from same response
                    if (data.relatedProducts) {
                        setRelatedProducts(data.relatedProducts)
                    }
                } else {
                    toast.error("PRODUCT SYNC FAILURE")
                    router.push("/products")
                }
            } catch (error) {
                console.error("Critical Connection Timeout:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [id, router])

    // COLOR-IMAGE SYNC: Automatically switch to the linked color image when selected
    useEffect(() => {
        if (!product || !selectedColor) return
        
        const variantColors = selectedVariant?.productColors || []
        const productColors = product.specs?.productColors || []
        const variantMatch = variantColors.find((c: any) => c.color?.toLowerCase() === selectedColor?.toLowerCase())
        const masterMatch = productColors.find((c: any) => c.color?.toLowerCase() === selectedColor?.toLowerCase())
        const resolvedImage = variantMatch?.image || masterMatch?.image

        if (resolvedImage) {
            const activeImages = product.images || [product.image]
            const imgIndex = activeImages.indexOf(resolvedImage)
            if (imgIndex >= 0) {
                setSelectedImage(imgIndex)
            }
        }
    }, [selectedColor, selectedVariant, product])

    if (loading) {
        return (
             <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden" suppressHydrationWarning>
                <div className="flex flex-col items-center gap-10" suppressHydrationWarning>
                    <div className="relative" suppressHydrationWarning>
                        <Zap className="w-16 h-16 text-primary animate-pulse" />
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-ping" suppressHydrationWarning />
                    </div>
                    <div className="flex flex-col items-center gap-2" suppressHydrationWarning>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground italic" suppressHydrationWarning>Loading Product Details...</span>
                        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden" suppressHydrationWarning>
                            <motion.div 
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="w-full h-full bg-primary"
                                suppressHydrationWarning
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) return null

    // Find stock for selected color from variant-specific color list or master list
    const variantColors = selectedVariant?.productColors || []
    const productColors = product.specs?.productColors || []
    
    // If a variant is selected, we look for stock in its specific color map
    // Metadata (like images) can fallback to the master list if not defined on the variant
    const variantColorMatch = variantColors.find((c: any) => c.color?.toLowerCase() === selectedColor?.toLowerCase())
    const masterColorMatch = productColors.find((c: any) => c.color?.toLowerCase() === selectedColor?.toLowerCase())
    
    // Final color info uses variant-specific stock but favors master list images if local ones are missing
    const colorInfo = variantColorMatch || masterColorMatch
    const colorImage = variantColorMatch?.image || masterColorMatch?.image

    const currentStock = variantColorMatch ? (parseInt(variantColorMatch.stock) || 0) : (masterColorMatch ? parseInt(masterColorMatch.stock) : 0)
    const isOutOfStock = Boolean(selectedColor && currentStock <= 0)
    
    const activeImages = (product.images && Array.isArray(product.images)) ? product.images : [product.image]

    const totalStock = product.specs?.productColors?.reduce((acc: number, c: any) => acc + (parseInt(c.stock) || 0), 0) || product.stock || 0

    const handleAddToCart = () => {
        if (!selectedColor && productColors.length > 0) {
            toast.error("PLEASE SELECT A COLOR")
            return
        }
        addItem({
            id: selectedVariant ? `${product.id}-${selectedVariant.id}-${selectedColor}` : `${product.id}-${selectedColor}`,
            productId: product.id,
            name: `${product.name} (${selectedColor}${selectedVariant ? ` / ${selectedVariant.ram}+${selectedVariant.storage}` : ''})`,
            price: discountedPrice,
            quantity: 1,
            image: colorImage || activeImages[0] || product.image,
            color: selectedColor,
            storage: selectedVariant?.storage,
            ram: selectedVariant?.ram,
            stock: currentStock,
            originalPrice: currentPrice,
            promotions: product.promotions
        }, user?.id)
        toast.success("Added to cart!")
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        toast.success("LINK COPIED TO CLIPBOARD")
        setTimeout(() => setCopied(false), 2000)
    }

    const paginate = (direction: number) => {
        const nextItem = (selectedImage + direction + activeImages.length) % activeImages.length
        setSelectedImage(nextItem)
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-success/10 selection:text-success font-sans" suppressHydrationWarning>
            {/* Navigational Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-6 pt-12">
                <nav className="flex flex-wrap items-center gap-2 text-[10px] md:text-[12px] font-black uppercase tracking-widest text-muted-foreground italic">
                    <Link href="/" className="hover:text-success transition-colors">Home</Link>
                    <ChevronRight size={12} className="opacity-30" />
                    <Link href={`/products?category=${product.category}`} className="hover:text-success transition-colors">{product.category}</Link>
                    <ChevronRight size={12} className="opacity-30" />
                    <Link href={`/products?brand=${product.brand}`} className="hover:text-success transition-colors">{product.brand}</Link>
                    <ChevronRight size={12} className="opacity-30" />
                    <span className="text-foreground border-b-2 border-success/20 pb-0.5">{product.name}</span>
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 lg:grid lg:grid-cols-2 lg:gap-20">
                
                {/* 1. PRODUCT GALLERY (LEFT) */}
                <div className="flex flex-col gap-8 h-fit">
                    <div className="aspect-square relative flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl overflow-hidden group border border-border/50 shadow-sm">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative w-full h-full flex items-center justify-center p-8 active:cursor-grabbing"
                            >
                                <Image
                                    src={validateImageUrl(activeImages[selectedImage])}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                                    priority
                                    onError={(e: any) => {
                                        e.target.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                                    }}
                                />
                                
                                {/* Prev/Next Navigation Overlay */}
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => paginate(-1)} className="w-12 h-12 rounded-full bg-slate-900/60 text-white flex items-center justify-center backdrop-blur-md hover:bg-slate-900 transition-all"><ChevronLeft size={24} /></button>
                                    <button onClick={() => paginate(1)} className="w-12 h-12 rounded-full bg-slate-900/60 text-white flex items-center justify-center backdrop-blur-md hover:bg-slate-900 transition-all"><ChevronRight size={24} /></button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Thumbnail Collection (Left-Aligned like reference) */}
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {activeImages.map((img: string, i: number) => (
                            <button
                                key={i}
                                onClick={() => setSelectedImage(i)}
                                className={cn(
                                    "w-24 h-24 shrink-0 rounded-xl border-2 transition-all p-2 bg-white dark:bg-slate-900 relative group overflow-hidden shadow-sm",
                                    selectedImage === i ? "border-slate-900 dark:border-white scale-105" : "border-border hover:border-slate-300"
                                )}
                            >
                                <Image src={validateImageUrl(img)} alt="" fill className="object-contain p-2" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. PRODUCT DETAILS (RIGHT) */}
                <div className="flex flex-col gap-8 mt-12 lg:mt-0">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-muted-foreground">{product.category}</span>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
                                {product.name}
                            </h1>
                            <Link href={`/products?category=${product.category}`} className="text-[#0088CC] hover:underline text-sm font-medium w-fit">
                                {product.category}
                            </Link>
                        </div>

                        <div className="flex items-center gap-4 py-2 border-y border-border/50">
                        <div>{/* Certified Product badge removed */}</div>
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                            {/* Dynamic Availability: Only shown if stock is low or out */}
                            {(product.stock <= 10) && (
                                 <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">Status:</span>
                                     {product.stock > 0 ? (
                                        <span className="text-warning font-bold uppercase tracking-wider text-[10px] bg-warning/10 py-1 px-3 rounded-full border border-warning/20 shadow-sm shadow-warning/10 animate-pulse italic">
                                            Only {product.stock} left in stock
                                        </span>
                                    ) : (
                                        <span className="text-destructive font-bold uppercase tracking-wider text-[10px] bg-destructive/10 py-1 px-3 rounded-full border border-destructive/20 italic">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Color Specific Low Stock Notification */}
                             {selectedColor && currentStock > 0 && currentStock <= 5 && (
                                <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/10 p-3 rounded-2xl animate-in fade-in slide-in-from-left-2">
                                    <Zap size={14} className="text-destructive fill-destructive animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-destructive italic">
                                        Only {currentStock} left in {selectedColor.toUpperCase()}!
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-8 text-sm mt-2">
                                 <button 
                                    onClick={() => toggleWishlist(product.id, user?.id)}
                                    className={cn("flex items-center gap-2 hover:text-success transition-colors", isInWishlist(product.id) ? "text-success font-bold" : "text-muted-foreground")}
                                >
                                    <Heart size={18} className={isInWishlist(product.id) ? "fill-current" : ""} />
                                    <span>Wishlist</span>
                                </button>
                            </div>
                        </div>

                        {/* QUICK DESCRIPTION (Beside the product) */}
                        <div className="bg-muted/20 p-8 rounded-3xl border border-border/50 mt-6 min-h-[120px]">
                            <ul className="space-y-3">
                                 {(product.specs?.content?.quick || product.description || "No summary available.").split('\n').filter(Boolean).map((line: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-[13px] text-foreground leading-relaxed font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0 shadow-sm shadow-success/20" />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 3. HARDWARE SPEC SELECTION */}
                        <div className="flex flex-col gap-6 mt-6">
                            {product.variants?.length > 0 && (
                                 <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 italic">Choose Option</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {product.variants?.map((v: any) => (
                                            <button
                                                key={v.id}
                                                onClick={() => {
                                                    if (selectedVariant?.id === v.id) {
                                                        setSelectedVariant(null);
                                                        return;
                                                    }
                                                    setSelectedVariant(v);
                                                    // Ensure the currently selected color is available in the new hardware configuration
                                                    const isColorAvailable = v.productColors?.some((c: any) => c.color === selectedColor && (parseInt(c.stock) || 0) > 0);
                                                    if (!isColorAvailable) {
                                                        setSelectedColor("");
                                                    }
                                                }}
                                                 className={cn(
                                                    "w-full h-14 bg-card border-2 rounded-2xl px-8 flex items-center justify-between transition-all group",
                                                    selectedVariant?.id === v.id 
                                                        ? "border-success shadow-lg shadow-success/10" 
                                                        : "border-border hover:border-muted-foreground/30"
                                                )}
                                            >
                                                 <div className="flex items-center gap-4">
                                                    <div className={cn("w-3 h-3 rounded-full border-2 transition-all", selectedVariant?.id === v.id ? "bg-success border-success scale-125" : "border-border")} />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                                                            {v.ram} RAM + {v.storage} Storage
                                                            {Array.isArray(v.customFields) && v.customFields.map((f: any, i: number) => (
                                                                <span key={i}> + {f.value} {f.key}</span>
                                                            ))}
                                                        </span>
                                                    </div>
                                                </div>
                                                 <span className="text-[12px] font-black italic text-price">{formatPrice(parseFloat(v.price) || 0)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Color Selection (Filtered by Variant) */}
                             <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 italic">Select Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {(selectedVariant?.productColors?.filter((c: any) => parseInt(c.stock) > 0).map((c: any) => c.color) || productColors.map((c: any) => c.color)).map((color: string) => (
                                         <button
                                            key={color}
                                            onClick={() => setSelectedColor(selectedColor === color ? "" : color)}
                                            className={cn(
                                                "px-6 py-3 rounded-xl border-2 transition-all text-[11px] font-black uppercase tracking-widest italic",
                                                selectedColor === color 
                                                    ? "bg-foreground border-foreground text-background shadow-xl scale-105" 
                                                    : "bg-card border-border text-muted-foreground hover:border-muted-foreground/30"
                                            )}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                    {productColors.length === 0 && (
                                        <span className="text-[10px] font-bold text-slate-300 italic">No color variants available</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Unit Scarcity Indicators */}
                            <div className="flex flex-col gap-3">
                                {/* Global Catalog Status (Only shown when low) */}
                                 {totalStock > 0 && totalStock <= 20 && (
                                    <div className="flex items-center justify-between px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest italic border shadow-sm bg-warning/5 text-warning border-warning/20">
                                        <div className="flex items-center gap-2">
                                            <Box size={14} className="opacity-50" />
                                            Low stock
                                        </div>
                                        <span className="font-outfit text-sm not-italic ml-auto">{totalStock} Units Remaining</span>
                                    </div>
                                )}

                                {/* Selection Specific Scarcity */}
                                {selectedColor && (
                                     <div className={cn(
                                        "flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest italic animate-in slide-in-from-left duration-500 border shadow-sm",
                                        isOutOfStock ? "bg-destructive/5 text-destructive border-destructive/20" : 
                                        currentStock <= 10 ? "bg-warning/5 text-warning border-warning/20 animate-pulse" :
                                        "bg-success/5 text-success border-success/20"
                                    )}>
                                        {isOutOfStock ? <AlertCircle size={14} /> : currentStock <= 10 ? <Zap size={14} /> : <CheckCircle2 size={14} />}
                                        <div className="flex flex-col">
                                            <span>{selectedColor}: {isOutOfStock ? "Out of stock" : `${currentStock} items left`}</span>
                                            {currentStock > 0 && currentStock <= 10 && <span className="text-[8px] opacity-70">Low stock: Order soon</span>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Variant Custom Specs moved into the button line per user request */}
                        </div>

                        {/* 4. PRICE & ACTION HUB */}
                        <div className="flex flex-col gap-6 mt-8 pt-8 border-t border-border/50">
                              <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                     <div className="flex items-baseline gap-3">
                                         <span className="text-4xl font-black text-price tracking-tighter">
                                             {formatPrice(discountedPrice)}
                                         </span>
                                         {originalPrice > discountedPrice && (
                                             <span className="text-lg font-bold text-muted-foreground line-through opacity-50 decoration-[1.5px]">
                                                 {formatPrice(originalPrice)}
                                             </span>
                                         )}
                                     </div>
                                     {percentOff > 0 && (
                                         <div className="flex items-center gap-2 mt-1">
                                             <span className="text-[10px] font-black bg-success/10 text-success px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                 Save {percentOff}%
                                             </span>
                                             <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                                                 You save {formatPrice(savings)}
                                             </span>
                                         </div>
                                     )}
                                 </div>
                             </div>


                             <div className="flex gap-4">
                                 <Button
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className="flex-1 h-16 rounded-full bg-success hover:bg-success/90 text-success-foreground font-bold text-sm tracking-widest uppercase shadow-success/20 shadow-lg active:scale-95 transition-all"
                                >
                                    ADD TO CART
                                </Button>
                                 <Button
                                    onClick={() => { handleAddToCart(); router.push("/cart"); }}
                                    disabled={isOutOfStock}
                                    className="flex-1 h-16 rounded-full bg-primary text-primary-foreground font-bold text-sm tracking-widest uppercase shadow-xl active:scale-95 transition-all"
                                >
                                    BUY NOW
                                </Button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAILED DESCRIPTION & TECHNICAL PARAMETERS */}
            <div className="max-w-7xl mx-auto px-6 py-20 border-t border-border flex flex-col gap-24">
                {product.specs?.content?.detailed && (
                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-2">
                             <h2 className="text-2xl font-black uppercase italic tracking-tighter text-foreground border-l-4 border-emerald-500 pl-6">Product Information</h2>
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-6 opacity-60 italic">Learn more about this product's features.</span>
                        </div>
                        <div className="text-muted-foreground text-sm leading-8 whitespace-pre-wrap ml-6 bg-muted/10 p-10 rounded-[2.5rem] border border-border/50 italic font-medium">
                            {product.specs.content.detailed}
                        </div>
                    </div>
                )}

                {/* Technical Specifications Registry */}
                {product.specs?.customSpecifications && Object.keys(product.specs.customSpecifications).length > 0 && (
                    <div className="flex flex-col gap-12">
                         <div className="flex flex-col gap-2">
                             <h2 className="text-2xl font-black uppercase italic tracking-tighter text-foreground border-l-4 border-success pl-6">Full Specifications</h2>
                             <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-6 opacity-80 italic">Detailed hardware information.</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 ml-6">
                            {Object.entries(product.specs.customSpecifications).map(([section, fields]: [string, any], sIdx) => {
                                if (!Array.isArray(fields) || fields.length === 0) return null;
                                return (
                                     <div key={sIdx} className="flex flex-col gap-8 p-10 rounded-[3rem] bg-card border border-border group hover:border-success/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-background flex items-center justify-center text-success shadow-sm border border-border">
                                                <Cpu size={18} />
                                            </div>
                                            <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground italic">{section}</h3>
                                        </div>
                                        <div className="flex flex-col gap-6">
                                            {fields.map((f, fIdx) => (
                                                 <div key={fIdx} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{f.field_name}</span>
                                                    <span className="text-[11px] font-black text-foreground uppercase italic text-right">{f.value || '--'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* COMMUNITY FEEDBACK ARCHIVED
            <div className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
                <ProductReviews productId={product.id} />
            </div> 
            */}

            {/* RELATED PRODUCTS */}
            <div className="bg-muted/10 py-24 border-t border-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col gap-12">
                        <h2 className="text-2xl font-bold text-slate-800">You may also like</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
