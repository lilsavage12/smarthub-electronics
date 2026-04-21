"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function HeroSection({ banners = [] }: { banners: any[] }) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const activeBanners = banners.filter(b => b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0))
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const next = () => setCurrentSlide(prev => (prev + 1) % activeBanners.length)
    const prev = () => setCurrentSlide(prev => (prev - 1 + activeBanners.length) % activeBanners.length)

    useEffect(() => {
        if (activeBanners.length <= 1) return
        timerRef.current = setInterval(next, 8000)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [activeBanners.length])

    if (activeBanners.length === 0) return null

    const slide = activeBanners[currentSlide]

    return (
        <section className="relative w-full h-[300px] md:h-[450px] bg-slate-950 overflow-hidden group">
            <motion.div
                key={slide.id}
                initial={false}
                animate={{ opacity: 1 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                    if (info.offset.x < -100) next()
                    if (info.offset.x > 100) prev()
                }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
                {/* Background Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className={cn(
                            "w-full h-full transition-none",
                            slide.scalingMode === "cover" ? "object-cover" : "object-contain"
                        )}
                        style={{ backgroundColor: slide.backgroundColor }}
                    />
                    {slide.useOverlay && (
                        <div 
                            className="absolute inset-0 bg-slate-950/40" 
                            style={{ opacity: slide.overlayOpacity || 0.4 }} 
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                </div>

                {/* Content Layer */}
                <div className="relative z-20 h-full w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center">
                    <div className={cn(
                        "flex flex-col max-w-3xl gap-6 md:gap-10",
                        slide.titleAlign === 'left' ? 'items-start text-left' : 
                        slide.titleAlign === 'right' ? 'items-end text-right ml-auto' : 
                        'items-center text-center mx-auto'
                    )}>
                        <div className="flex flex-col gap-4">
                            {slide.subtitle && (
                                <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.6em] text-primary drop-shadow-lg">
                                    {slide.subtitle}
                                </span>
                            )}
                            <h1 className="text-5xl md:text-9xl font-black font-outfit uppercase tracking-tighter leading-[0.85] text-white drop-shadow-2xl">
                                {slide.title}
                            </h1>
                            {slide.link && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Link 
                                        href={slide.link}
                                        className={cn(
                                            "mt-6 inline-flex items-center gap-4 px-8 py-4 sm:px-10 sm:py-5 rounded-2xl md:rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 group w-fit",
                                            slide.buttonText ? "bg-white text-black" : "bg-primary text-primary-foreground"
                                        )}
                                        style={slide.primaryColor && slide.buttonText ? { backgroundColor: slide.primaryColor, color: '#fff' } : {}}
                                    >
                                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none">
                                            {slide.buttonText || "DISCOVER NOW"}
                                        </span>
                                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
