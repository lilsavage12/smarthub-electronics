"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Zap, X } from "lucide-react"
import Image from "next/image"
import { PRODUCTS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const LOCATIONS = [
    "London, UK", "New York, USA", "Berlin, DE", "Tokyo, JP", 
    "Paris, FR", "Dubai, UAE", "Toronto, CA", "Sydney, AU",
    "Singapore, SG", "Seoul, KR"
]

export const SalesNotification = () => {
    const [visible, setVisible] = useState(false)
    const [currentSale, setCurrentSale] = useState<any>(null)

    useEffect(() => {
        const showRandomSale = () => {
            if (visible) return

            const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]
            const randomLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
            const randomTime = Math.floor(Math.random() * 59) + 1

            setCurrentSale({
                product: randomProduct,
                location: randomLocation,
                time: `${randomTime}m ago`
            })

            setVisible(true)

            // Hide after 5 seconds
            setTimeout(() => {
                setVisible(false)
            }, 5000)
        }

        // Initial delay
        const initialDelay = setTimeout(showRandomSale, 10000)

        // Repeat interval
        const interval = setInterval(showRandomSale, 25000)

        return () => {
            clearTimeout(initialDelay)
            clearInterval(interval)
        }
    }, [visible])

    return (
        <AnimatePresence>
            {visible && currentSale && (
                <motion.div
                    initial={{ opacity: 0, x: -50, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed bottom-6 left-6 z-[100] w-full max-w-[280px]"
                >
                    <div className="bg-card/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 relative group overflow-hidden">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        
                        {/* Close Button */}
                        <button 
                            onClick={() => setVisible(false)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-white transition-colors"
                        >
                            <X size={12} />
                        </button>

                        {/* Product Image */}
                        <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 p-2 shrink-0 relative">
                            <Image 
                                src={currentSale.product.image} 
                                alt="" 
                                fill 
                                className="object-contain p-1"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-0.5 truncate pr-2">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Recent Purchase</span>
                            </div>
                            <p className="text-[10px] font-bold text-foreground truncate uppercase tracking-tight">
                                {currentSale.product.name}
                            </p>
                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">
                                {currentSale.location} • {currentSale.time}
                            </span>
                        </div>

                        {/* Zap Decor */}
                        <div className="absolute -right-1 -bottom-1 opacity-5">
                            <Zap size={40} className="text-primary" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
