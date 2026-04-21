"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function CategoryGrid({ categories = [], title = "EXPLORE CATEGORIES" }: { categories: any[], title?: string }) {
    if (!categories || categories.length === 0) return null

    return (
        <section className="section-container py-12">
            <div className="flex flex-col gap-10">
                <div className="flex items-center justify-between border-b border-border/10 pb-6">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">{title}</h2>
                    <Link href="/products" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        All Collections <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categories.filter(c => c.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)).map((cat, idx) => (
                        <motion.div
                            key={cat.id || idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                                <Link
                                    href={cat.redirectUrl || `/products?categories=${encodeURIComponent(cat.name)}`}
                                    className="group block relative aspect-square bg-card border border-border rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-700"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:from-primary/10 transition-colors" />

                                    <div className="absolute inset-0 p-4 md:p-6 flex flex-col items-center justify-center gap-4">
                                        <div className="w-12 h-12 md:w-20 md:h-20 relative group-hover:scale-110 transition-transform duration-700">
                                            <img
                                                src={cat.imageUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format"}
                                                alt={cat.name}
                                                className="w-full h-full object-contain filter drop-shadow-2xl"
                                            />
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-tight">{cat.name}</span>
                                        </div>
                                    </div>

                                <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center transform translate-y-20 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white">
                                    <ChevronRight size={14} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
