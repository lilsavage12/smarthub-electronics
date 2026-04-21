"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Zap, Clock, ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/products/ProductCard"
import { cn } from "@/lib/utils"

export function FlashDeals({ 
    products = [], 
    endTime,
    title = "FLASH DEALS"
}: { 
    products: any[], 
    endTime?: string,
    title?: string
}) {
    const [timeLeft, setTimeLeft] = useState<{h:number, m:number, s:number}>({h:0, m:0, s:0})

    useEffect(() => {
        if (!endTime) return
        const target = new Date(endTime).getTime()
        
        const tick = () => {
            const now = new Date().getTime()
            const diff = target - now
            if (diff <= 0) return
            
            setTimeLeft({
                h: Math.floor(diff / (1000 * 60 * 60)),
                m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((diff % (1000 * 60)) / 1000)
            })
        }
        
        tick()
        const timer = setInterval(tick, 1000)
        return () => clearInterval(timer)
    }, [endTime])

    if (products.length === 0) return null

    return (
        <section className="section-container py-12 md:py-20">
            <div className="bg-slate-950 rounded-[4rem] p-8 md:p-16 border border-white/5 shadow-3xl overflow-hidden relative">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

                <div className="flex flex-col gap-16 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 border-b border-white/10 pb-12">
                        <div className="flex flex-col gap-4">
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none text-white italic">
                                {title}
                            </h2>
                        </div>
                        
                        {endTime && (
                            <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-3xl shadow-2xl">
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl md:text-6xl font-black text-white tabular-nums">{timeLeft.h.toString().padStart(2, '0')}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Hours</span>
                                </div>
                                <span className="text-4xl font-black text-white/20">:</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl md:text-6xl font-black text-white tabular-nums">{timeLeft.m.toString().padStart(2, '0')}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Mins</span>
                                </div>
                                <span className="text-4xl font-black text-white/20">:</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl md:text-6xl font-black text-white tabular-nums">{timeLeft.s.toString().padStart(2, '0')}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Secs</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                        {products.slice(0, 4).map((p, idx) => (
                            <motion.div
                                key={p.id || idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <ProductCard product={p} dark={true} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
