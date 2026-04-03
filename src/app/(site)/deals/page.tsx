"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Zap, Clock, TrendingUp, Sparkles, SlidersHorizontal, ArrowRight, Loader2, Package, ShieldCheck } from "lucide-react"
import { ProductCard } from "@/components/products/ProductCard"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export default function DealsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<string>("ALL")
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })

    // Countdown logic
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            const tomorrow = new Date(now)
            tomorrow.setHours(24, 0, 0, 0)
            const diff = tomorrow.getTime() - now.getTime()
            setTimeLeft({
                h: Math.floor(diff / (1000 * 60 * 60)),
                m: Math.floor((diff / (1000 * 60)) % 60),
                s: Math.floor((diff / 1000) % 60)
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const res = await fetch(`/api/products?t=${Date.now()}`)
                if (res.ok) {
                    const data = await res.json()
                    // Filter only products with active promotions
                    const deals = data.filter((p: any) => (p.promotions && p.promotions.length > 0))
                    setProducts(deals)
                }
            } catch (err) {
                console.error("Filter sync error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchDeals()
    }, [])

    const filtered = activeTab === "ALL" 
        ? products 
        : products.filter(p => p.promotions?.some((pr: any) => pr.category === activeTab))

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Synchronizing Live Deals...</span>
        </div>
    )

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* High-Velocity Header */}
            <div className="relative border-b border-border/10 bg-slate-950 pt-24 pb-16 px-6 lg:px-12 overflow-hidden">
                <div className="absolute inset-0 bg-rose-500/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] italic">
                            <Zap className="w-4 h-4 animate-pulse fill-rose-500" /> Authorized Hardware Liquidation
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">
                            Flash <span className="text-rose-500">Deals</span>
                        </h1>
                        <p className="text-sm md:text-base font-bold text-white/40 uppercase tracking-widest italic max-w-xl">
                            Real-time promotional sales. Great deals on top quality electronics.
                        </p>
                    </div>

                    {/* Prominent Timer */}
                    <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] italic md:text-right">Global Reset Terminal</span>
                        <div className="flex items-center gap-3">
                            {[
                                { label: 'HOURS', value: timeLeft.h },
                                { label: 'MINUTES', value: timeLeft.m },
                                { label: 'SECONDS', value: timeLeft.s }
                            ].map((unit, i) => (
                                <div key={i} className="flex flex-col items-center bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 min-w-[110px] backdrop-blur-md shadow-2xl">
                                    <span className="text-3xl md:text-5xl font-black tabular-nums tracking-tighter text-white leading-none">
                                        {unit.value.toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-[9px] font-black text-white/30 mt-2 tracking-widest uppercase">{unit.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Hub */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16">
                <div className="flex flex-col gap-12">
                    {/* Interaction Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/10 pb-12">
                        <div className="flex items-center gap-2 md:gap-4 bg-muted/20 p-2 rounded-2xl border border-border w-fit overflow-x-auto no-scrollbar">
                            {[
                                { id: "ALL", label: "All Hub Access", icon: Package },
                                { id: "FLASH_SALE", label: "Flash Sales", icon: Zap },
                                { id: "DAILY_DEAL", label: "Daily Rituals", icon: Clock },
                                { id: "EXCLUSIVE", label: "Exclusive Deals", icon: ShieldCheck }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${
                                        activeTab === tab.id ? "bg-foreground text-background shadow-xl" : "text-muted-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    <tab.icon size={14} className={activeTab === tab.id ? "animate-pulse" : ""} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">Managed Fleet: {filtered.length} Assets Found</span>
                        </div>
                    </div>

                    {/* Result Matrix */}
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
                            <AnimatePresence mode="popLayout">
                                {filtered.map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <ProductCard product={p} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border rounded-[3rem] bg-muted/5 gap-8">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground opacity-30">
                                <TrendingUp size={40} />
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <h3 className="text-xl font-black uppercase tracking-tighter italic">No Active Deals Synchronized</h3>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Check back for the next high-velocity drop.</p>
                            </div>
                            <Link href="/products">
                                <Button className="h-14 px-10 rounded-2xl font-black italic tracking-widest uppercase text-xs">SCAN FULL CATALOG</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
