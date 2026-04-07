
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Smartphone, Zap, Gift, Clock, Sparkles, Filter, ChevronRight, TrendingUp, ShieldCheck, Box } from "lucide-react"
import { ProductCard } from "@/components/products/ProductCard"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { CountdownTimer } from "@/components/products/CountdownTimer"

export default function DealsPage() {
    const params = useParams()
    const router = useRouter()
    const categoryQuery = params.category as string
    
    // Convert url slug to category enum
    const categoryMap: { [key: string]: string } = {
        'daily': 'DAILY_DEAL',
        'flash': 'FLASH_SALE',
        'exclusive': 'EXCLUSIVE',
        'seasonal': 'SEASONAL'
    }
    
    const category = categoryMap[categoryQuery] || 'REGULAR'
    const [promotions, setPromotions] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch promotions of this category
                const pRes = await fetch(`/api/promotions?category=${category}`)
                const pData = await pRes.json()
                setPromotions(pData)

                // Fetch all products to match with promos
                const prodRes = await fetch("/api/products")
                const prodData = await prodRes.json()
                setProducts(prodData)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [category])

    const dealProducts = useMemo(() => {
        return products.filter(p => 
            p.promotions?.some((promo: any) => promo.category === category)
        )
    }, [products, category])

    const activePromo = promotions.find(p => p.isActive)

    const titleMap: { [key: string]: string } = {
        'DAILY_DEAL': "TODAY'S TOP DEALS",
        'FLASH_SALE': "LIVE FLASH SALES",
        'EXCLUSIVE': "WEBSITE EXCLUSIVES",
        'SEASONAL': "SEASONAL CAMPAIGNS"
    }

    const iconMap: { [key: string]: any } = {
        'DAILY_DEAL': <Gift className="w-8 h-8 fill-amber-500 text-white" />,
        'FLASH_SALE': <Zap className="w-8 h-8 fill-rose-600 text-white" />,
        'EXCLUSIVE': <Sparkles className="w-8 h-8 fill-emerald-600 text-white" />,
        'SEASONAL': <TrendingUp className="w-8 h-8 fill-purple-600 text-white" />
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Smartphone className="w-12 h-12 text-primary animate-pulse" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* dynamic deal banner if it exists */}
            {activePromo?.bannerUrl && (
                <div className="relative w-full h-[40vh] overflow-hidden">
                    <img src={activePromo.bannerUrl} alt={activePromo.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute bottom-12 left-12 max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] ">
                                {activePromo.category.replace('_', ' ')}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black font-outfit uppercase  tracking-tighter text-white leading-[0.8] mb-4 drop-shadow-2xl">
                            {activePromo.title}
                        </h1>
                        <p className="text-lg font-medium text-white/80 leading-relaxed drop-shadow-md">
                            {activePromo.description}
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-border pb-8">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-[2rem] bg-card border border-border shadow-xl">
                            {iconMap[category]}
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ">Live Operational Status</span>
                            <h2 className="text-4xl font-black font-outfit uppercase  tracking-tighter leading-none">
                                {titleMap[category] || "ACTIVE DEALS"}
                            </h2>
                        </div>
                    </div>
                    
                    {category === 'FLASH_SALE' && activePromo?.endDate && (
                        <div className="flex flex-col items-end gap-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">EVENT ENDING IN</span>
                             <CountdownTimer endDate={activePromo.endDate} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {dealProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </div>

                {dealProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-muted/20 rounded-[4rem] border border-dashed border-border mt-12">
                        <Box size={64} className="text-muted-foreground/30 mb-8" />
                        <h3 className="text-2xl font-black font-outfit uppercase  mb-4">No active deals found</h3>
                        <p className="text-muted-foreground max-w-md font-medium">Check back soon for new synchronizations in this sector.</p>
                        <Button 
                            className="mt-8 h-14 px-8 rounded-2xl bg-primary text-white font-black  uppercase tracking-widest"
                            onClick={() => router.push("/products")}
                        >
                            BROWSE PRODUCTS
                        </Button>
                    </div>
                )}
            </div>
            
            {/* governance trust footer */}
            <section className="bg-muted/50 py-20 mt-20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                   <div className="flex flex-col gap-4">
                        <ShieldCheck className="text-primary" size={32} />
                        <h4 className="text-xl font-black font-outfit uppercase  tracking-tighter">Verified Hardware</h4>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">Every item in this sale undergoes a full quality check before being listed.</p>
                   </div>
                   <div className="flex flex-col gap-4">
                        <Clock className="text-amber-500" size={32} />
                        <h4 className="text-xl font-black font-outfit uppercase  tracking-tighter">Limited Windows</h4>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">Sale limits are strict. Once the sale period ends, prices return to their original values.</p>
                   </div>
                   <div className="flex flex-col gap-4">
                        <Zap className="text-purple-500" size={32} />
                        <h4 className="text-xl font-black font-outfit uppercase  tracking-tighter">Instant Activation</h4>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">Add any deal unit to your cart to instantly hard-lock the promotional pricing for your session.</p>
                   </div>
                </div>
            </section>
        </div>
    )
}
