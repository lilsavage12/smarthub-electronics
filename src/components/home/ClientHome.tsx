"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
    Smartphone, ChevronRight, ChevronLeft, Star,
    Sparkles, Mail, Truck, ShieldCheck, Activity, Box, ArrowRight, TrendingUp, Tag, Clock, MapPin, Zap, Percent
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/components/products/ProductCard"
import { cn } from "@/lib/utils"
import { DynamicProductSection } from "@/components/home/DynamicProductSection"
import { SectionRenderer } from "./SectionRenderer"

const BROKEN_UNSPLASH_IDS = [
    "1434493907317-a46b5bc78344",
    "1675243911244-65910b39678c",
    "1707065090150-136746ef9204",
    "1531297484001-80022131f5a1", // Common generic tech that sometimes 404s
    "1519389950473-47ba0277781c"
]

const validateImageUrl = (url: string, fallback: string = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format") => {
    if (!url) return fallback
    let processed = url
    if (typeof url === 'string' && url.trim().startsWith('[') && url.trim().endsWith(']')) {
        try {
            const parsed = JSON.parse(url)
            if (Array.isArray(parsed) && parsed.length > 0) processed = parsed[0]
        } catch (e) { }
    }
    if (typeof processed !== 'string') return fallback
    const isBroken = BROKEN_UNSPLASH_IDS.some(id => processed.includes(id))
    return isBroken ? fallback : processed
}



export function ClientHome({
    allProducts = [],
    cmsData,
    hpConfig
}: {
    allProducts: any[],
    cmsData: any,
    hpConfig: any
}) {
    // 1. Resolve Layout Sections
    // If sections aren't defined in config, create a premium default layout
    const sections = React.useMemo(() => {
        if (hpConfig?.sections && Array.isArray(hpConfig.sections) && hpConfig.sections.length > 0) {
            return hpConfig.sections
        }

        // PREMIUM DEFAULT FALLBACK
        return [
            { id: "s1", type: "hero", isActive: true, config: {} },
            { id: "s2", type: "trust_bar", isActive: true, config: {} },
            { id: "s4", type: "categories", isActive: true, title: "SHOP BY CATEGORY", config: {} },
            { id: "s5", type: "featured_products", isActive: true, title: "NEW RELEASES", config: { source: "new", limit: 10, iconType: "newArrivals" } },
            { id: "s6", type: "promo_banner", isActive: true, config: { 
                title: "iPhone 16 Pro", 
                subtitle: "The ultimate iPhone.", 
                imageUrl: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&w=1600&q=80", 
                link: "/products",
                dark: true 
            }},
            { id: "s7", type: "featured_products", isActive: true, title: "BEST SELLERS", config: { source: "featured", limit: 10, iconType: "featured" } },
            { id: "s8", type: "brand_showcase", isActive: true, title: "AUTHENTIC BRANDS", config: {} },
            { id: "s9", type: "featured_products", isActive: true, title: "ALL PRODUCTS", config: { source: "all", limit: 20, iconType: "smartphones" } },
        ]
    }, [hpConfig])

    if (!allProducts || allProducts.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <Smartphone className="w-12 h-12 text-primary/20 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Synchronizing Inventory...</span>
            </div>
        )
    }

    return (
        <main className="flex flex-col bg-background text-foreground pb-20 overflow-x-hidden">
            {/* Render each active section in order */}
            {sections
                .filter((s: any) => s.isActive !== false)
                .map((section: any) => (
                    <SectionRenderer 
                        key={section.id} 
                        section={section} 
                        allProducts={allProducts} 
                        cmsData={cmsData} 
                    />
                ))
            }
        </main>
    )
}

