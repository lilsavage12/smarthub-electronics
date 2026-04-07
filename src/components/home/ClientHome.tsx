"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
    Smartphone, ChevronRight, ChevronLeft, Star,
    Sparkles, Mail, Truck, ShieldCheck, Activity, Box, ArrowRight, TrendingUp, Tag, Clock, MapPin, Zap, Percent
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/components/products/ProductCard"
import { cn } from "@/lib/utils"
import { DynamicProductSection } from "@/components/home/DynamicProductSection"

const BROKEN_UNSPLASH_IDS = [
    "1434493907317-a46b5bc78344",
    "1675243911244-65910b39678c",
    "1707065090150-136746ef9204",
    "1531297484001-80022131f5a1", // Common generic tech that sometimes 404s
    "1519389950473-47ba0277781c"
]

const validateImageUrl = (url: string, fallback: string = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format") => {
    if (!url) return fallback
    let processed = url
    if (typeof url === 'string' && url.trim().startsWith('[') && url.trim().endsWith(']')) {
        try {
            const parsed = JSON.parse(url)
            if (Array.isArray(parsed) && parsed.length > 0) processed = parsed[0]
        } catch (e) { }
    }
    if (typeof processed !== 'string') return fallback
    const isBroken = BROKEN_UNSPLASH_IDS.some(id => processed.includes(id))
    return isBroken ? fallback : processed
}

export function ClientHome({
    allProducts = [],
    cmsData,
    hpConfig
}: {
    allProducts: any[],
    cmsData: any,
    hpConfig: any
}) {
    const [currentSlide, setCurrentSlide] = useState(1)
    const [transDuration, setTransDuration] = useState(0.8)
    const containerRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        if (!containerRef.current) return
        const resizeObserver = new ResizeObserver((entries) => {
            setWidth(entries[0].contentRect.width)
        })
        resizeObserver.observe(containerRef.current)
        return () => resizeObserver.disconnect()
    }, [])

    const handleJump = (target: number) => {
        setTransDuration(0)
        setCurrentSlide(target)
        setTimeout(() => setTransDuration(0.8), 50)
    }

    const nextSlide = () => {
        const banners = cmsData?.banners?.filter((b: any) => b.isActive) || []
        if (banners.length <= 1) return
        setCurrentSlide(prev => prev + 1)
    }

    const prevSlide = () => {
        const banners = cmsData?.banners?.filter((b: any) => b.isActive) || []
        if (banners.length <= 1) return
        setCurrentSlide(prev => prev - 1)
    }

    const {
        newArrivals, featuredProducts, visibleProducts, flashDeals
    } = React.useMemo(() => {
        const visible = allProducts
        if (!visible.length) return {
            newArrivals: [], featuredProducts: [], visibleProducts: [], flashDeals: []
        }

        const isNewArrival = (p: any) => !!p.isNew

        return {
            newArrivals: visible.filter(isNewArrival).slice(0, 20),
            featuredProducts: visible.filter((p: any) => p.isFeatured).slice(0, 15),
            flashDeals: visible.filter((p: any) => p.isSale || p.discount > 0).slice(0, 15),
            visibleProducts: visible
        }
    }, [allProducts])

    const activeBanners = React.useMemo(() => (cmsData?.banners?.filter((b: any) => b.isActive) || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)), [cmsData])
    const { settings } = cmsData || {}
    const trust = React.useMemo(() => (cmsData?.trust || []).filter((t: any) => t.isActive).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)), [cmsData])

    useEffect(() => {
        if (currentSlide > activeBanners.length && activeBanners.length > 0) {
            setCurrentSlide(1)
        }
    }, [activeBanners.length])

    useEffect(() => {
        if (activeBanners.length <= 1) return
        const timer = setInterval(() => {
            setCurrentSlide(prev => {
                if (prev >= activeBanners.length + 1) return prev;
                return prev + 1;
            })
        }, 6000)
        return () => clearInterval(timer)
    }, [activeBanners.length])

    const renderSection = (key: string) => {
        if (key === 'featured' && settings?.showFeatured === false) return null
        const section = hpConfig?.[key]
        if (!section || !section.visible) return null

        let systemTitle = ""
        let systemIcon = null
        let items: any[] = []

        if (key === 'newArrivals') {
            systemTitle = section.title || "NEW ARRIVALS"
            systemIcon = <Box className="w-8 h-8 text-success fill-success" />
            items = newArrivals
        } else if (key === 'flashDeals') {
            systemTitle = section.title || "DISCOUNTS"
            systemIcon = <Percent className="w-8 h-8 text-indigo-500 fill-indigo-500" />
            items = flashDeals
        } else {
            systemTitle = section.title || "BEST SELLERS"
            systemIcon = <Star className="w-8 h-8 text-primary fill-primary" />
            items = featuredProducts
        }

        if (items.length === 0) return null

        return (
            <div key={key} className="flex flex-col gap-12">
                <div className="flex items-center justify-between border-b border-border/10 pb-8">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                            {systemIcon} {systemTitle}
                        </h2>
                    </div>
                </div>
                <div suppressHydrationWarning className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {items.map((p: any, idx: number) => (
                        <motion.div
                            key={p.id || idx}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                            transition={{ 
                                duration: 0.4, 
                                delay: (idx % 5) * 0.05,
                                ease: [0.23, 1, 0.32, 1]
                            }}
                        >
                            <ProductCard key={p.id} product={p} />
                        </motion.div>
                    ))}
                </div>
            </div>
        )
    }

    const combinedVisibleSections = React.useMemo(() => {
        const systemKeys = ['newArrivals', 'featured', 'flashDeals']
        const system = systemKeys
            .map(key => ({
                id: key,
                type: 'system',
                order: hpConfig?.[key]?.order ?? (key === 'newArrivals' ? 1 : key === 'featured' ? 2 : 3),
                title: hpConfig?.[key]?.title || (key === 'newArrivals' ? "NEW ARRIVALS" : key === 'featured' ? "BEST SELLERS" : "DISCOUNTS")
            }))
            .filter(s => hpConfig?.[s.id]?.visible !== false)

        const hS = cmsData?.settings?.homepageSections
        let legacySections = []
        try {
            if (Array.isArray(hS)) {
                legacySections = hS.map((sec: any, i: number) => ({ ...sec, id: `legacy-${i}`, isDynamic: true, order: (sec.order || (10 + i)) }))
            } else if (typeof hS === 'string') {
                legacySections = JSON.parse(hS).map((sec: any, i: number) => ({ ...sec, id: `legacy-${i}`, isDynamic: true, order: (sec.order || (10 + i)) }))
            }
        } catch (e) { }

        const dynamicSource = (hpConfig?.dynamicSections && Array.isArray(hpConfig.dynamicSections) && hpConfig.dynamicSections.length > 0)
            ? hpConfig.dynamicSections
            : (legacySections.length > 0 ? legacySections : [])

        const dynamicFinal = dynamicSource.length > 0 ? dynamicSource : [
            { id: 'def-1', title: 'Top Smartphones', type: 'category', source: 'Smartphones', order: 10, visible: true },
            { id: 'def-2', title: 'Apple Devices', type: 'brand', source: 'Apple', order: 11, visible: true },
            { id: 'def-3', title: 'Samsung Collection', type: 'brand', source: 'Samsung', order: 12, visible: true },
        ]

        return [...system, ...dynamicFinal.map((sec: any) => ({ ...sec, isDynamic: true, title: sec.title || (sec.source || 'Featured Collection') }))]
            .filter((sec: any) => sec.visible !== false)
            .sort((a: any, b: any) => {
                // 1. Group by priority (System vs Dynamic)
                const aRef = a.isDynamic ? 1 : 0;
                const bRef = b.isDynamic ? 1 : 0;
                if (aRef !== bRef) return aRef - bRef;
                
                // 2. Sort by order within groups
                return (a.order || 0) - (b.order || 0);
            })
    }, [hpConfig, cmsData?.settings?.homepageSections])

    return (
        <div className="flex flex-col gap-6 md:gap-10 overflow-x-hidden bg-background text-foreground pb-20" suppressHydrationWarning>
            {/* 1. HERO SECTION */}
            {activeBanners.length > 0 && (
                <div suppressHydrationWarning className="pt-20 lg:pt-28 pb-4">
                    <section ref={containerRef} suppressHydrationWarning className="relative w-full h-[320px] md:h-[480px] bg-slate-950 overflow-hidden flex items-center group/hero shadow-2xl">
                        <div suppressHydrationWarning className="flex h-full w-full">
                            <motion.div
                                className="flex h-full w-full"
                                animate={{ x: -currentSlide * width }}
                                transition={{
                                    type: "tween",
                                    ease: "easeOut",
                                    duration: transDuration,
                                }}
                                onAnimationComplete={() => {
                                    if (currentSlide === 0) handleJump(activeBanners.length);
                                    if (currentSlide === activeBanners.length + 1) handleJump(1);
                                }}
                                style={{ willChange: "transform", width: (activeBanners.length + 2) * width }}
                            >
                                <motion.div
                                    className="flex h-full cursor-grab active:cursor-grabbing"
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.15}
                                    dragMomentum={false}
                                    animate={{ x: 0 }}
                                    onDragEnd={(e: any, info: any) => {
                                        const swipeThreshold = 50;
                                        const swipeVelocity = 500;
                                        const swipe = info.offset.x;
                                        const velocity = info.velocity.x;

                                        if (swipe < -swipeThreshold || velocity < -swipeVelocity) {
                                            nextSlide();
                                        } else if (swipe > swipeThreshold || velocity > swipeVelocity) {
                                            prevSlide();
                                        }
                                    }}
                                    style={{ width: (activeBanners.length + 2) * width }}
                                >
                                    {[activeBanners[activeBanners.length - 1], ...activeBanners, activeBanners[0]].map((slide: any, index: number) => {
                                        if (!slide) return <div key={index} className="min-w-full h-full bg-slate-950" />
                                        return (
                                            <div key={`${slide.id}-${index}`} suppressHydrationWarning className="h-full relative shrink-0" style={{ width: width }}>
                                                <div suppressHydrationWarning className="absolute inset-0 overflow-hidden" style={{ backgroundColor: slide.backgroundColor || '#000000' }}>
                                                    <div suppressHydrationWarning className="hidden md:block absolute inset-0">
                                                        <Image
                                                            src={validateImageUrl(slide.imageUrl)}
                                                            alt={slide.title || "Hero Banner"}
                                                            fill
                                                            priority={index === 1}
                                                            className={cn("transition-transform duration-[2000ms] group-hover/hero:scale-105", slide.scalingMode === "fill" ? "object-cover" : "object-contain")}
                                                            onError={(e: any) => {
                                                                e.target.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&w=1200&q=80"
                                                            }}
                                                        />
                                                    </div>
                                                    <div suppressHydrationWarning className="block md:hidden absolute inset-0">
                                                        <Image
                                                            src={validateImageUrl(slide.mobileUrl || slide.imageUrl)}
                                                            alt={slide.title || "Hero Banner"}
                                                            fill
                                                            priority={index === 1}
                                                            className={cn("transition-transform duration-[2000ms] group-hover/hero:scale-105", slide.scalingMode === "fill" ? "object-cover" : "object-contain")}
                                                            onError={(e: any) => {
                                                                e.target.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&w=800&q=80"
                                                            }}
                                                        />
                                                    </div>
                                                    {slide.useOverlay && <div suppressHydrationWarning className="absolute inset-0 bg-slate-950 z-10" style={{ opacity: slide.overlayOpacity || 0.2 }} />}
                                                </div>
                                                <Link href={slide.buttonLink || "/products"} className="absolute inset-0 z-40">
                                                    <div suppressHydrationWarning className="relative z-30 h-full w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center text-center">
                                                        <div suppressHydrationWarning className={cn("flex flex-col w-full gap-4 md:gap-6", slide.titleAlign === 'left' ? 'items-start text-left' : slide.titleAlign === 'right' ? 'items-end text-right' : 'items-center justify-center text-center')}>
                                                            {slide.title && <motion.h1 className="text-4xl md:text-8xl font-black font-outfit uppercase  tracking-tighter drop-shadow-2xl" style={{ color: slide.titleColor === 'primary' ? 'var(--primary)' : (slide.titleColor || 'white') }}>{slide.title}</motion.h1>}
                                                            {slide.subtitle && <motion.p className="text-lg md:text-2xl font-bold uppercase tracking-[0.3em] opacity-80 " style={{ color: slide.titleColor === 'primary' ? 'var(--primary)' : (slide.titleColor || 'white') }}>{slide.subtitle}</motion.p>}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        )
                                    })}
                                </motion.div>
                            </motion.div>
                        </div>
                        <div suppressHydrationWarning className="absolute inset-x-0 bottom-8 z-50 flex justify-center gap-2">
                            {activeBanners.map((_: any, i: number) => (
                                <button key={i} onClick={() => setCurrentSlide(i + 1)} className={cn("h-1.5 transition-all rounded-full", (currentSlide === i + 1) ? "w-10 bg-primary" : "w-2 bg-white/20")} />
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* 2. TRUST MARKERS */}
            {trust && trust.length > 0 && (
                <section className="px-4 md:px-6 -mt-10 md:-mt-16 relative z-40">
                    <div className="max-w-7xl mx-auto bg-card border border-border shadow-2xl rounded-3xl overflow-hidden">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
                            {trust.map((item: any) => (
                                <div key={item.id} className="p-6 md:p-8 flex items-center gap-4 group hover:bg-muted/50 transition-colors">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                        <Activity size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase  tracking-widest">{item.title}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60 font-bold">{item.subtitle}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 3. DYNAMIC SECTIONS */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-12 mt-10">
                {combinedVisibleSections.map((sec: any) => (
                    <div key={sec.id}>
                        {sec.isDynamic ? (
                            <DynamicProductSection
                                key={sec.id}
                                title={sec.title}
                                type={sec.type}
                                source={sec.source}
                                products={allProducts}
                            />
                        ) : (
                            renderSection(sec.id)
                        )}
                    </div>
                ))}

                {/* 5. OUR PRODUCTS */}
                <div className="flex flex-col gap-12 mt-20 pt-10 border-t border-border/10">
                    <div className="flex items-center justify-between border-b border-border/10 pb-8">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                                <Box className="w-8 h-8 text-primary fill-primary" /> OUR PRODUCTS
                            </h2>
                        </div>
                        <Link 
                            href="/products"
                            className="group flex items-center gap-4 px-8 py-4 bg-muted/20 border border-border/40 rounded-full hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/5"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">Explore All</span>
                            <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {allProducts.slice(0, 20).map((product: any, idx: number) => (
                            <motion.div
                                key={product.id || idx}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                                transition={{ 
                                    duration: 0.4, 
                                    delay: (idx % 5) * 0.05,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                            >
                                <ProductCard key={product.id} product={product} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
