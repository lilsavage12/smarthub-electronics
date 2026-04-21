"use client"

import React from "react"
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link"

export function BrandShowcase({ brands = [], title = "SHOP BY BRANDS" }: { brands: any[], title?: string }) {
    if (!brands || brands.length === 0) return null;

    return (
        <section className="section-container py-12">
            <div className="flex flex-col gap-10">
                <div className="flex items-center justify-between border-b border-border/10 pb-6">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">{title}</h2>
                    <Link href="/products" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        All Brands <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {brands.filter(b => b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)).map((brand, idx) => (
                        <motion.div
                            key={brand.id || idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link
                                href={brand.link || `/products?brands=${encodeURIComponent(brand.title || brand.name)}`}
                                className="group block relative aspect-square bg-card border border-border rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-700"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:from-primary/10 transition-colors" />

                                <div className="absolute inset-0 p-4 md:p-6 flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 md:w-16 md:h-16 relative group-hover:scale-110 transition-transform duration-700">
                                        <img
                                            src={brand.imageUrl}
                                            alt={brand.title || brand.name}
                                            className="w-full h-full object-contain filter drop-shadow-2xl"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <span className="text-[10px] md:text-xs font-black uppercase tracking-tight text-foreground">{brand.title || brand.name}</span>
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
    );
}
