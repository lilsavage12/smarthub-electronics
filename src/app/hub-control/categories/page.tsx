"use client"

import React, { useState, useEffect } from "react"
import {
    Plus, Search, Smartphone, Edit2, Trash2,
    ArrowRight, Zap, Layers,
    Monitor, Headphones, Watch, X, Upload,
    Tablet, Laptop, Gamepad2, RefreshCcw, ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { useRouter } from "next/navigation"

const INITIAL_CATEGORIES = [
    { id: "1", name: "Smartphones", count: 0, icon: <Smartphone className="text-blue-500" />, type: "Type", color: "bg-blue-50" },
    { id: "2", name: "Tablets", count: 0, icon: <Tablet className="text-purple-500" />, type: "Type", color: "bg-purple-50" },
    { id: "3", name: "Accessories", count: 0, icon: <ShoppingBag className="text-amber-500" />, type: "Type", color: "bg-amber-50" },
    { id: "4", name: "Laptops", count: 0, icon: <Laptop className="text-emerald-500" />, type: "Type", color: "bg-emerald-50" },
    { id: "5", name: "Smart Watches", count: 0, icon: <Watch className="text-rose-500" />, type: "Type", color: "bg-rose-50" },
    { id: "6", name: "Headphones", count: 0, icon: <Headphones className="text-indigo-500" />, type: "Type", color: "bg-indigo-50" },
    { id: "7", name: "Foldables", count: 0, icon: <Layers className="text-cyan-500" />, type: "Type", color: "bg-cyan-50" },
    { id: "8", name: "Gaming", count: 0, icon: <Gamepad2 className="text-orange-500" />, type: "Type", color: "bg-orange-50" },
    { id: "9", name: "Refurbished", count: 0, icon: <RefreshCcw className="text-slate-500" />, type: "Type", color: "bg-slate-50" },
]

export default function CategoriesPage() {
    const router = useRouter()
    const [categories, setCategories] = useState(INITIAL_CATEGORIES)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const loadCounts = async () => {
            try {
                const res = await fetch("/api/products")
                if (!res.ok) return
                const products = await res.json()
                setCategories(prev => prev.map(cat => ({
                    ...cat,
                    count: products.filter((p: any) =>
                        (p.category || "").toLowerCase() === cat.name.toLowerCase()
                    ).length
                })))
            } catch (e) {}
        }
        loadCounts()
    }, [])

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground  uppercase">Product Categories</h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Organize your products by type or brand.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-black  uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 hover:opacity-90 transition-all"
                    >
                        <Plus size={20} />
                        ADD CATEGORY
                    </Button>
                </div>
            </div>

            {/* Structure KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Categories", value: categories.length.toString(), icon: <Layers className="text-emerald-500" />, bg: "bg-emerald-50" },
                    { label: "Product Types", value: "9", icon: <Smartphone className="text-blue-500" />, bg: "bg-blue-50" },
                    { label: "Custom Added", value: Math.max(0, categories.length - 9).toString(), icon: <Plus className="text-amber-500" />, bg: "bg-amber-50" },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card flex items-center gap-6 group hover:shadow-xl transition-all cursor-pointer overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className={cn("p-4 rounded-xl relative z-10", stat.bg)}>
                            {stat.icon}
                        </div>
                        <div className="flex flex-col relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 leading-none mb-1">{stat.label}</span>
                            <span className="text-3xl font-black  tracking-tighter text-foreground leading-none">{stat.value}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* List Control */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search brands or categories..."
                            className="w-full h-12 bg-muted rounded-xl pl-12 pr-4 outline-none text-[10px] font-black uppercase tracking-widest text-foreground placeholder:text-muted-foreground/50 border border-transparent focus:border-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <AnimatePresence>
                        {filteredCategories.map((cat, i) => (
                            <motion.div
                                key={cat.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative overflow-hidden bg-card border border-border rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                            >
                                {/* Colored Banner */}
                                <div className={cn("h-28 w-full relative overflow-hidden", cat.color.replace("bg-", "bg-").replace("-50", "-100"))}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-110 transition-transform duration-700">
                                        {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 80 })}
                                    </div>
                                    <div className="absolute bottom-4 left-6 z-20">
                                        <div className="p-1.5 rounded-lg w-fit mb-1 bg-white/40 backdrop-blur-sm">
                                            {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 14 })}
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <span className={cn("text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/50 backdrop-blur-sm")}>
                                            {cat.count > 0 ? `${cat.count} products` : 'Empty'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 pt-4 flex flex-col gap-4">
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-xl font-black  tracking-tighter text-foreground uppercase">{cat.name}</h3>
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 ">{cat.count} PRODUCT{cat.count !== 1 ? 'S' : ''} IN CATEGORY</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg transition-all">
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-lg transition-all">
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="h-[1px] w-full bg-border" />

                                    <Button
                                        variant="outline"
                                        onClick={() => router.push(`/hub-control/products?category=${cat.name}`)}
                                        className="h-10 w-full rounded-xl font-black  tracking-widest uppercase text-[9px] gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all border-border shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20"
                                    >
                                        VIEW CATEGORY PRODUCTS
                                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add New Category Skeleton Card */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-[280px] border-2 border-dashed border-border rounded-[2.5rem] bg-card flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-muted/50 transition-all group"
                    >
                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <Plus size={28} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Add New Category</span>
                    </button>
                </div>
            </div>

            {/* Add Category Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="w-full max-w-xl bg-card border border-border rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary p-3 rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
                                        <Layers size={22} />
                                    </div>
                                    <h2 className="text-2xl font-black  tracking-tighter text-foreground uppercase">Create Category</h2>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all">
                                    <X size={24} className="text-muted-foreground" />
                                </button>
                            </div>

                            <div className="p-10 flex flex-col gap-8">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4 opacity-60">Category Name</label>
                                    <input
                                        type="text"
                                        className="h-14 bg-muted border border-border/50 rounded-2xl px-6 outline-none focus:border-primary/20 transition-all font-black uppercase  tracking-widest text-[10px] text-foreground placeholder:text-muted-foreground/30"
                                        placeholder="e.g. Foldables / Google"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4 opacity-60">Category Type</label>
                                        <select className="h-14 bg-muted border border-border/50 rounded-2xl px-6 outline-none text-[10px] font-black uppercase tracking-widest text-foreground">
                                            <option>Brand</option>
                                            <option>Type</option>
                                            <option>Seasonal</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4 opacity-60">Icon Identity</label>
                                        <select className="h-14 bg-muted border border-border/50 rounded-2xl px-6 outline-none text-[10px] font-black uppercase tracking-widest text-foreground">
                                            <option>Smartphone</option>
                                            <option>Zap</option>
                                            <option>Layers</option>
                                            <option>Shield</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4 opacity-60">Category Image (Optional)</label>
                                    <label className="h-32 w-full border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-all">
                                        <Upload size={24} className="text-muted-foreground/40" />
                                        <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">DRAG ASSET OR CLICK</span>
                                        <input type="file" className="hidden" />
                                    </label>
                                </div>
                            </div>

                            <div className="p-8 border-t border-border bg-muted/30 flex justify-end gap-4">
                                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-xl font-black uppercase text-[10px] tracking-widest">Abandon</Button>
                                <Button className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black  uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:opacity-90 transition-all">
                                    SAVE CATEGORY
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

