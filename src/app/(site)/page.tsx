"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
    Smartphone, Zap, Clock, ChevronRight, ChevronLeft, Star, 
    Sparkles, Mail, Truck, ShieldCheck, Activity, Box, ArrowRight, TrendingUp, Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/components/products/ProductCard"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import { DynamicProductSection } from "@/components/home/DynamicProductSection"

function StorefrontHome() {
    const [allProducts, setAllProducts] = useState<any[]>([])
    const [cmsData, setCmsData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentSlide, setCurrentSlide] = useState(1)
    const [email, setEmail] = useState("")

    const [hpConfig, setHpConfig] = useState<any>(null)
    const [transDuration, setTransDuration] = useState(0.8)

    const handleJump = (target: number) => {
        setTransDuration(0)
        setCurrentSlide(target)
        setTimeout(() => setTransDuration(0.8), 50)
    }


    useEffect(() => {
        const loadContent = async () => {
            try {
                const [productsRes, cmsRes, configRes] = await Promise.all([
                    fetch(`/api/products?t=${Date.now()}`),
                    fetch(`/api/cms/homepage?t=${Date.now()}`),
                    fetch(`/api/config/homepage?t=${Date.now()}`)
                ])
                if (productsRes.ok) setAllProducts(await productsRes.json())
                if (cmsRes.ok) setCmsData(await cmsRes.json())
                if (configRes.ok) setHpConfig(await configRes.json())
            } catch (err) {
                console.error("Connection failed")
            } finally {
                setIsLoading(false)
            }
        }
        loadContent()
    }, [])

    const { 
        newArrivals, discountedProducts, visibleProducts
    } = React.useMemo(() => {
        const visible = allProducts.filter((p: any) => !p.isHidden && !p.specs?.identity?.isHidden)
        if (!visible.length) return {
            newArrivals: [], discountedProducts: [], visibleProducts: []
        }

        const isNewArrival = (p: any) => p.isNew || (p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))
        const isDiscounted = (p: any) => {
            const hasManualPrice = p.specs?.identity?.discountPrice && parseFloat(p.specs.identity.discountPrice) < p.price;
            const hasPercent = p.discount && p.discount > 0;
            const hasPromo = p.promotions && p.promotions.length > 0;
            return hasManualPrice || hasPercent || hasPromo;
        }
        
        return {
            newArrivals: visible.filter(isNewArrival).slice(0, 20),
            discountedProducts: visible.filter(isDiscounted).sort((a: any, b: any) => (parseInt(b.discount) || 0) - (parseInt(a.discount) || 0)).slice(0, 15),
            visibleProducts: visible
        }
    }, [allProducts])

    const brandLogos = React.useMemo(() => cmsData?.brands?.filter((b: any) => b.isActive) || [], [cmsData])
    const activeBanners = React.useMemo(() => (cmsData?.banners?.filter((b: any) => b.isActive) || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)), [cmsData])
    const { settings } = cmsData || {}
    const categories = React.useMemo(() => (cmsData?.categories || []).filter((c: any) => c.isActive).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)), [cmsData])
    const trust = React.useMemo(() => (cmsData?.trust || []).filter((t: any) => t.isActive).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)), [cmsData])
    const testimonials = React.useMemo(() => (cmsData?.testimonials || []).filter((t: any) => t.isActive), [cmsData])
    
    // Safety: Reset slide if length changes and current is out of bounds
    useEffect(() => {
        if (currentSlide > activeBanners.length && activeBanners.length > 0) {
            setCurrentSlide(1)
        }
    }, [activeBanners.length])

    useEffect(() => {
        if (activeBanners.length <= 1) return
        const timer = setInterval(() => {
            // Safety: If we've reached the clone of the first slide, 
            // wait for onAnimationComplete to reset us back to 1.
            // This prevents index overflow which causes disappearing images.
            setCurrentSlide(prev => {
                if (prev >= activeBanners.length + 1) return prev;
                return prev + 1;
            })
        }, 6000)
        return () => clearInterval(timer)
    }, [activeBanners.length])

    // Section Orchestration Logic: Integrates Prisma-backed toggles with Supabase layout config
    const renderSection = (key: string) => {
        if (key === 'featured' && settings?.showFeatured === false) return null

        const section = hpConfig?.[key]
        if (!section || !section.visible) return null

        switch(key) {
            case 'newArrivals':
                if (newArrivals.length === 0) return null
                return (
                    <div key={key} className="flex flex-col gap-12">
                        <div className="flex items-center justify-between border-b border-border/10 pb-8">
                             <div className="flex flex-col gap-2">
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                                    <Box className="w-8 h-8 text-success fill-success" /> {section.title}
                                </h2>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Our newest arrivals.</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0 border-l border-t border-border/10">
                             {newArrivals.map((p: any) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )
            case 'featured':
                if (discountedProducts.length === 0) return null
                return (
                    <div key={key} className="flex flex-col gap-12">
                        <div className="flex items-center justify-between border-b border-border/10 pb-8">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                                    <Tag className="w-8 h-8 text-primary" /> DISCOUNTED PRODUCTS
                                </h2>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Save big on premium electronics.</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0 border-l border-t border-border/10">
                             {discountedProducts.map((p: any) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    const combinedVisibleSections = React.useMemo(() => {
        const systemKeys = ['newArrivals', 'discounted', 'featured']
        const system = systemKeys
            .map(key => ({ id: key, type: 'system', order: hpConfig?.[key]?.order || 0 }))
            .filter(s => hpConfig?.[s.id]?.visible !== false)

        const dynamic = (hpConfig?.dynamicSections || [])
            .map((sec: any) => ({ ...sec, type: 'dynamic' }))
            .filter((sec: any) => sec.visible)

        return [...system, ...dynamic].sort((a, b) => a.order - b.order)
    }, [hpConfig])

    if (isLoading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-10" suppressHydrationWarning>
            <div className="relative" suppressHydrationWarning>
                <Smartphone className="w-16 h-16 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-ping" suppressHydrationWarning />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Loading...</span>
        </div>
    )

    return (
        <div className="flex flex-col gap-12 md:gap-32 overflow-x-hidden bg-background text-foreground pb-20" suppressHydrationWarning>
            
            {/* 1. HERO SECTION */}
            {activeBanners.length > 0 && (
                <div className="pt-20 lg:pt-28 pb-4">
                    <section className="relative w-full h-[320px] md:h-[480px] bg-slate-950 overflow-hidden flex items-center group/hero shadow-2xl">
                        <div className="flex h-full w-full">
                            <motion.div 
                                className="flex h-full w-full"
                                animate={{ x: `-${currentSlide * 100}%` }}
                                onAnimationComplete={() => {
                                    if (currentSlide === 0) handleJump(activeBanners.length);
                                    if (currentSlide === activeBanners.length + 1) handleJump(1);
                                }}
                                transition={{ 
                                    duration: transDuration,
                                    ease: [0.32, 0.72, 0, 1], // Premium cinematic ease
                                }}
                            >
                                 {/* Render Extended Deck: [Last, ...Original, First] */}
                                {[activeBanners[activeBanners.length - 1], ...activeBanners, activeBanners[0]].map((slide: any, index: number) => {
                                    if (!slide) return <div key={index} className="min-w-full h-full bg-slate-950" />
                                    return (
                                        <div key={`${slide.id}-${index}`} className="min-w-full h-full relative shrink-0">
                                            {/* BACKGROUND LAYER: ASSET SYNCHRONIZATION */}
                                            <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: slide.backgroundColor || '#000000' }}>
                                                {/* Desktop Signature Asset */}
                                                <div className="hidden md:block absolute inset-0">
                                                    <img 
                                                        src={
                                                            (typeof slide.imageUrl === 'string' && slide.imageUrl.trim().length > 0 && slide.imageUrl !== "TEST") ? (
                                                                (slide.imageUrl.startsWith('http') || slide.imageUrl.startsWith('/') || slide.imageUrl.startsWith('data:')) ? slide.imageUrl : `https://${slide.imageUrl}`
                                                            ) : "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format"
                                                        } 
                                                        alt={slide.title || "Storefront Banner"} 
                                                        className={cn(
                                                            "w-full h-full transition-transform duration-[2000ms] group-hover/hero:scale-105",
                                                            slide.scalingMode === "fill" ? "object-cover" : "object-contain"
                                                        )}
                                                        onError={(e: any) => {
                                                            e.target.src = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format"
                                                        }}
                                                    />
                                                </div>
                                                {/* Mobile Signature Asset */}
                                                <div className="block md:hidden absolute inset-0">
                                                    <img 
                                                        src={
                                                            (typeof (slide.mobileUrl || slide.imageUrl) === 'string' && (slide.mobileUrl || slide.imageUrl).trim().length > 0 && (slide.mobileUrl || slide.imageUrl) !== "TEST") ? (
                                                                ((slide.mobileUrl || slide.imageUrl).startsWith('http') || (slide.mobileUrl || slide.imageUrl).startsWith('/') || (slide.mobileUrl || slide.imageUrl).startsWith('data:')) ? (slide.mobileUrl || slide.imageUrl) : `https://${slide.mobileUrl || slide.imageUrl}`
                                                            ) : "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format"
                                                        } 
                                                        alt={slide.title || "Mobile View"} 
                                                        className={cn(
                                                            "w-full h-full transition-transform duration-[2000ms] group-hover/hero:scale-105",
                                                            slide.scalingMode === "fill" ? "object-cover" : "object-contain"
                                                        )}
                                                        onError={(e: any) => {
                                                            e.target.src = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format"
                                                        }}
                                                    />
                                                </div>

                                                {/* OVERLAY PROTOCOL */}
                                                {slide.useOverlay && (
                                                    <div 
                                                        className="absolute inset-0 bg-slate-950 z-10 transition-opacity duration-1000" 
                                                        style={{ opacity: slide.overlayOpacity || 0.2 }} 
                                                    />
                                                )}
                                            </div>

                                             {/* CONTENT LAYER: LAYOUT ARCHITECTURE */}
                                            <Link href={slide.buttonLink || "/products"} className="absolute inset-0 z-40">
                                                <div className="relative z-30 h-full w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center group/content transition-transform duration-500 group-hover/hero:scale-[1.02]">
                                                    <div className={cn(
                                                        "flex flex-col w-full gap-4 md:gap-6",
                                                        slide.titleAlign === 'left' ? 'items-start text-left' : 
                                                        slide.titleAlign === 'right' ? 'items-end text-right' : 
                                                        'items-center justify-center text-center'
                                                    )}>
                                                        {/* Primary Title - Stronger Presence */}
                                                        {(slide.title || slide.subtitle) && (
                                                            <motion.h1 
                                                                initial={{ opacity: 0, y: 20 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                className="text-4xl md:text-6xl lg:text-8xl font-black font-outfit leading-[0.85] italic tracking-tighter uppercase drop-shadow-2xl max-w-5xl" 
                                                                style={{ color: (slide.titleColor === 'primary' ? 'var(--primary)' : (slide.titleColor || 'white')) }}
                                                            >
                                                                {slide.title || slide.subtitle}
                                                            </motion.h1>
                                                        )}
                                                        
                                                        {/* Secondary Subtitle - Only if both exist */}
                                                        {slide.title && slide.subtitle && (
                                                            <motion.p 
                                                                initial={{ opacity: 0, y: 20 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.1 }}
                                                                className="text-lg md:text-2xl font-bold uppercase tracking-[0.3em] opacity-80 drop-shadow-lg italic"
                                                                style={{ color: (slide.titleColor === 'primary' ? 'var(--primary)' : (slide.titleColor || 'white')) }}
                                                            >
                                                                {slide.subtitle}
                                                            </motion.p>
                                                        )}

                                                         {/* Removed the button as requested, the entire banner is now a link */}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    )
                                })}
                            </motion.div>
                        </div>
                        
                        {/* MANUAL CONTROLS: CINEMATIC NAVIGATION */}
                        <div className="absolute inset-x-0 bottom-8 z-50 flex justify-center gap-2 pointer-events-none">
                            {activeBanners.map((_: any, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i + 1)}
                                    className={cn(
                                        "h-1.5 transition-all duration-500 rounded-full pointer-events-auto",
                                        (currentSlide === i + 1 || (currentSlide === 0 && i === activeBanners.length - 1) || (currentSlide === activeBanners.length + 1 && i === 0)) ? "w-10 bg-primary" : "w-2 bg-white/20 hover:bg-white/40"
                                    )}
                                />
                            ))}
                        </div>

                        <div className="absolute inset-y-0 left-6 z-50 flex items-center pointer-events-none">
                            <button 
                                onClick={() => setCurrentSlide(prev => prev - 1)}
                                className="h-14 w-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all pointer-events-auto shadow-2xl opacity-100 md:opacity-0 group-hover/hero:opacity-100"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        </div>

                        <div className="absolute inset-y-0 right-6 z-50 flex items-center pointer-events-none">
                            <button 
                                onClick={() => setCurrentSlide(prev => prev + 1)}
                                className="h-14 w-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all pointer-events-auto shadow-2xl opacity-100 md:opacity-0 group-hover/hero:opacity-100"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {/* 2. CUSTOMER TRUST & RELIABILITY */}
            {trust && trust.length > 0 && (
                <section className="px-4 md:px-6 -mt-10 md:-mt-16 relative z-40">
                    <div className="max-w-7xl mx-auto bg-card border border-border/50 rounded-[2rem] md:rounded-[3rem] p-6 md:p-14 shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                        {trust?.map((item: any) => {
                            const Icon = ({ Truck, ShieldCheck, Activity, Box } as any)[item.iconName] || Star
                            return (
                                <div key={item.id} className="flex items-center gap-6 group hover:translate-y-[-5px] transition-all">
                                    <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase tracking-widest italic">{item.title}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mt-1">{item.subtitle}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}



            {/* 4. FEATURED COLLECTIONS */}
            <section className="px-6 flex flex-col gap-32">
                <div className="max-w-7xl mx-auto w-full flex flex-col gap-32">
                
                {combinedVisibleSections.map(sec => {
                    if (sec.type === 'system') return renderSection(sec.id)
                    return (
                        <DynamicProductSection 
                            key={sec.id}
                            title={sec.titleOverride}
                            products={allProducts}
                            type={sec.type}
                            source={sec.source}
                            limit={sec.limit}
                            sort={sec.sort}
                        />
                    )
                })}


                </div>
            </section>


            {/* 6. PRODUCT CATALOG */}
            <section className="bg-background py-20 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-12">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border/50 pb-10">
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Our Store</span>
                            <h2 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase leading-none font-outfit">Our <span className="text-primary italic">Collections</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic mt-2">Explore our full selection of devices and accessories.</p>
                        </div>
                        <Link href="/products">
                            <Button variant="outline" className="h-14 px-8 rounded-2xl border-border bg-card font-black italic tracking-widest uppercase text-xs hover:border-primary transition-all shadow-xl shadow-black/5">
                                VIEW ALL <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0 border-l border-t border-border/10">
                        {visibleProducts.slice(0, 32).map((product: any) => (
                            <ProductCard key={product.id} product={product} viewMode="grid" />
                        ))}
                    </div>

                    {allProducts.length > 32 && (
                        <div className="flex justify-center mt-12">
                            <Link href="/products">
                                <Button className="h-16 px-16 rounded-2xl bg-foreground text-background font-black italic tracking-widest uppercase text-xs hover:bg-primary hover:text-white transition-all shadow-2xl">
                                    SEE MORE
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default function Home() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Smartphone className="animate-pulse text-primary h-12 w-12" /></div>}>
            <StorefrontHome />
        </Suspense>
    )
}
