import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Map, ArrowRight, Globe, Shield, Info, Phone, ShoppingCart, Smartphone, Package } from "lucide-react"
import { supabaseAdmin } from "@/lib/supabase"
import Image from "next/image"

export const dynamic = "force-dynamic"

export default async function SitemapPage() {
    // Fetch all active products
    const { data: products } = await supabaseAdmin
        .from('Product')
        .select('*')
        .eq('isActive', true)
        .order('category', { ascending: true })

    const categories = Array.from(new Set((products || []).map(p => p.category || "Uncategorized")))

    const staticLinks = [
        { name: "Home", href: "/", icon: <Globe size={18} /> },
        { name: "All Products", href: "/products", icon: <Package size={18} /> },
        { name: "Shopping Cart", href: "/cart", icon: <ShoppingCart size={18} /> },
        { name: "About Us", href: "/about", icon: <Info size={18} /> },
        { name: "Contact Support", href: "/contact", icon: <Phone size={18} /> },
        { name: "Privacy Policy", href: "/privacy", icon: <Shield size={18} /> },
    ]

    return (
        <div className="min-h-screen bg-background pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col gap-4 mb-20 border-b border-border/50 pb-12">
                    <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px] italic">
                        <Map size={16} />
                        Directory
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter italic leading-none">
                        Site <span className="text-primary italic">Map</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest max-w-2xl leading-relaxed">
                        Navigate through our entire digital catalog. Find every product, collection, and resource across the SmartHub ecosystem.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Left Sidebar: Core Navigation */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <div className="flex flex-col gap-4 p-8 bg-card border border-border rounded-[2.5rem] shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-widest text-primary italic border-b border-border/50 pb-4">Core Directory</h2>
                            <div className="flex flex-col gap-2 pt-2">
                                {staticLinks.map((link) => (
                                    <Link 
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {link.icon}
                                            {link.name}
                                        </div>
                                        <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* XML Link */}
                        <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex flex-col gap-4 italic group hover:bg-primary/10 transition-all cursor-pointer">
                            <Link href="/sitemap.xml" className="flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Crawler Feed</span>
                                <span className="text-sm font-black text-foreground">Sitemap.xml</span>
                                <p className="text-[10px] text-muted-foreground not-italic font-medium leading-relaxed">Raw XML data for search engine bots and automated crawlers.</p>
                            </Link>
                        </div>
                    </div>

                    {/* Main Content: Categorized Products */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {categories.map((category) => (
                                <div key={category} className="flex flex-col gap-6">
                                    <div className="flex items-center justify-between border-b border-border/50 pb-4 px-2">
                                        <h3 className="text-xl font-black font-outfit uppercase italic tracking-tight">{category}</h3>
                                        <span className="text-[10px] font-black text-muted-foreground opacity-50 uppercase tracking-widest">
                                            {(products || []).filter(p => p.category === category).length} Items
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {(products || []).filter(p => p.category === category).map((product) => (
                                            <Link 
                                                key={product.id}
                                                href={`/products/${product.id}`}
                                                className="group p-4 rounded-3xl bg-muted/20 hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all flex items-center gap-4"
                                            >
                                                <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden shrink-0 border border-border/30 p-1 relative shadow-sm">
                                                    <Image 
                                                        src={product.image || "/images/placeholder.png"} 
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black uppercase text-foreground group-hover:text-primary transition-colors leading-tight">
                                                        {product.name}
                                                    </span>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                                        View Product Detail
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {(!products || products.length === 0) && (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-border/50 rounded-[3rem]">
                                    <Smartphone size={48} className="mx-auto mb-4 text-muted-foreground/20" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Logistics are being synchronized... check back soon.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
