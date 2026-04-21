"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function PromoBanner({ 
    title, 
    subtitle, 
    imageUrl, 
    link, 
    buttonText = "SHOP NOW",
    layout = "single", // single, double
    dark = true
}: { 
    title?: string, 
    subtitle?: string, 
    imageUrl: string, 
    link: string, 
    buttonText?: string,
    layout?: "single" | "double",
    dark?: boolean
}) {
    return (
        <section className="section-container py-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={cn(
                    "relative w-full h-[250px] md:h-[350px] rounded-[3rem] overflow-hidden group shadow-2xl border border-border",
                    dark ? "bg-slate-900" : "bg-white"
                )}
            >
                <img 
                    src={imageUrl} 
                    alt={title} 
                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-[5000ms] group-hover:scale-105" 
                />
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-r transition-opacity duration-700",
                    dark ? "from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90" : "from-white/60 via-white/20 to-transparent opacity-40 group-hover:opacity-60"
                )} />
                
                <div className="relative h-full flex flex-col justify-center p-12 md:p-20 max-w-2xl gap-6">
                    <div className="flex flex-col gap-3">
                        {subtitle && <span className={cn("text-[10px] md:text-xs font-black uppercase tracking-[0.4em]", dark ? "text-primary" : "text-primary/80")}>{subtitle}</span>}
                        {title && <h2 className={cn("text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none shadow-sm", dark ? "text-white" : "text-slate-950")}>{title}</h2>}
                    </div>
                    
                    <Link 
                        href={link}
                        className={cn(
                            "w-fit px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all",
                            dark ? "bg-white text-black hover:bg-primary hover:text-white" : "bg-black text-white hover:bg-primary"
                        )}
                    >
                        {buttonText} <ArrowRight size={14} />
                    </Link>
                </div>
            </motion.div>
        </section>
    )
}
