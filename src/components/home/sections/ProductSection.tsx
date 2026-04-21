"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { ProductCard } from "@/components/products/ProductCard"
import { cn } from "@/lib/utils"

export function ProductSection({ 
    title, 
    products = [], 
    icon: Icon = Sparkles,
    viewAllLink = "/products",
    accentColor = "text-primary",
    banner
}: { 
    title: string, 
    products: any[], 
    icon?: any,
    viewAllLink?: string,
    accentColor?: string,
    banner?: { image?: string, title?: string, subtitle?: string }
}) {
    if (products.length === 0) return null

    return (
        <section className="section-container py-8 md:py-10">
            <div className="flex flex-col gap-12">
                {/* Optional Top Banner */}
                {banner?.image && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="relative w-full h-[250px] md:h-[400px] rounded-[2.5rem] overflow-hidden group shadow-2xl"
                    >
                        <img src={banner.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-12 md:p-20">
                            <div className="flex flex-col gap-4 max-w-2xl">
                                <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none italic">{banner.title}</h3>
                                <Link 
                                    href={viewAllLink}
                                    className="mt-6 w-fit px-8 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all"
                                >
                                    SHOP COLLECTION
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/10 pb-8">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none text-foreground">{title}</h2>
                    
                    <Link 
                        href={viewAllLink}
                        className="group flex items-center gap-4 px-10 py-5 bg-card border border-border rounded-full hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/5"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Explore All Items</span>
                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
                    {products.map((p, idx) => (
                        <motion.div
                            key={p.id || idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                            transition={{ 
                                duration: 0.6, 
                                delay: (idx % 5) * 0.1,
                                ease: [0.23, 1, 0.32, 1]
                            }}
                        >
                            <ProductCard product={p} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
