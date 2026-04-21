"use client"

import React from "react"
import { motion } from "framer-motion"
import * as LucideIcons from "lucide-react"

export function TrustBar({ items = [] }: { items: any[] }) {
    if (!items || items.length === 0) return null

    return (
        <div className="section-container mt-12 mb-20">
            <div className="bg-card border border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
                    {items.filter(i => i.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)).map((item, idx) => {
                        const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Activity
                        return (
                            <motion.div 
                                key={item.id || idx} 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 flex items-center gap-5 group hover:bg-muted/30 transition-all cursor-default"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                                    <Icon size={24} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-black uppercase tracking-widest text-foreground">{item.title}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60 font-bold leading-tight">{item.subtitle}</span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
