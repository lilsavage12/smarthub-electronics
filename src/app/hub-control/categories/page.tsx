"use client"

import React, { useState } from "react"
import {
    Plus, Search, Tags, Smartphone,
    MoreHorizontal, Edit2, Trash2, Image as ImageIcon,
    ChevronRight, ArrowRight, Zap, Layers,
    Monitor, Headphones, Watch, X, Save, Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { useRouter } from "next/navigation"

const INITIAL_CATEGORIES = [
    { id: "1", name: "Apple", count: 24, icon: <Zap className="text-blue-500" />, type: "Brand", color: "bg-blue-50", banner: "/images/categories/apple.jpg" },
    { id: "2", name: "Samsung", count: 18, icon: <Layers className="text-emerald-500" />, type: "Brand", color: "bg-emerald-50", banner: "/images/categories/samsung.jpg" },
    { id: "3", name: "Smartphones", count: 86, icon: <Smartphone className="text-purple-500" />, type: "Type", color: "bg-purple-50", banner: "/images/categories/phones.jpg" },
    { id: "4", name: "Accessories", count: 142, icon: <Headphones className="text-amber-500" />, type: "Type", color: "bg-amber-50", banner: "/images/categories/audio.jpg" },
    { id: "5", name: "Xiaomi", count: 12, icon: <Zap className="text-orange-500" />, type: "Brand", color: "bg-orange-50" },
    { id: "6", name: "Tablets", count: 34, icon: <Monitor className="text-indigo-500" />, type: "Type", color: "bg-indigo-50" },
]

export default function CategoriesPage() {
    const router = useRouter()
    const [categories, setCategories] = useState(INITIAL_CATEGORIES)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Product Categories</h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Organize your products by type or brand.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 hover:opacity-90 transition-all"
                    >
                        <Plus size={20} />
                        ADD CATEGORY
                    </Button>
                </div>
            </div>

            {/* Structure KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Active Brands", value: "8", icon: <Zap className="text-blue-500" />, bg: "bg-blue-50" },
                    { label: "Core Categories", value: "12", icon: <Layers className="text-emerald-500" />, bg: "bg-emerald-50" },
                    { label: "Unused Categories", value: "2", icon: <AlertTriangle className="text-amber-500" />, bg: "bg-amber-50" },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card flex items-center gap-6 group hover:shadow-xl transition-all cursor-pointer overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className={cn("p-4 rounded-xl relative z-10", stat.bg)}>
                            {stat.icon}
                        </div>
                        <div className="flex flex-col relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 leading-none mb-1">{stat.label}</span>
                            <span className="text-3xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</span>
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
                                {/* Banner Mask */}
                                <div className="h-28 w-full bg-primary relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent z-10" />
                                    {cat.banner ? (
                                        <div className="absolute inset-0 opacity-40 group-hover:scale-110 transition-transform duration-700">
                                            <div className="bg-muted w-full h-full animate-pulse" /> {/* Placeholder for banner */}
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                            <Zap size={100} className="text-primary-foreground fill-primary-foreground" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-6 z-20">
                                        <div className={cn("p-1.5 rounded-lg w-fit mb-1 bg-muted/20 backdrop-blur-md")}>
                                            {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 14 })}
                                        </div>
                                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-primary-foreground italic">TYPE: {cat.type}</span>
                                    </div>
                                </div>

                                <div className="p-6 pt-4 flex flex-col gap-4">
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-xl font-black italic tracking-tighter text-foreground uppercase">{cat.name}</h3>
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 italic">{cat.count} HARDWARE UNITS</span>
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
                                        className="h-10 w-full rounded-xl font-black italic tracking-widest uppercase text-[9px] gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all border-border shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20"
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
                                    <h2 className="text-2xl font-black italic tracking-tighter text-foreground uppercase">Create Category</h2>
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
                                        className="h-14 bg-muted border border-border/50 rounded-2xl px-6 outline-none focus:border-primary/20 transition-all font-black uppercase italic tracking-widest text-[10px] text-foreground placeholder:text-muted-foreground/30"
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
                                <Button className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:opacity-90 transition-all">
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

function AlertTriangle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    )
}
