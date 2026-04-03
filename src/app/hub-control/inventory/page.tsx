"use client"

import React, { useState, useEffect } from "react"
import {
    Package, Search, Filter, Plus,
    MoreHorizontal, Edit2, Trash2,
    ArrowRight, History, Download,
    Layers, AlertCircle, CheckCircle2,
    RefreshCw, Smartphone, Tag,
    ChevronRight, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

export default function InventoryPage() {
    const [inventory, setInventory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)

    const fetchInventory = async () => {
        try {
            const res = await fetch("/api/products")
            if (res.ok) {
                const data = await res.json()
                setInventory(data)
            }
        } catch (error) {
            toast.error("Failed to load inventory")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInventory()
    }, [])

    const filteredInventory = inventory.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Product Catalog</h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-2">Managing product catalog, stock levels, and inventory updates.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-border font-black italic uppercase tracking-widest text-[10px] gap-2">
                        <History size={18} />
                        ACTIVITY LOGS
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/10 transition-all hover:opacity-90">
                        <Plus size={20} />
                        ADD PRODUCT
                    </Button>
                </div>
            </div>

            {/* Inventory KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total SKUs", value: inventory.length.toString(), icon: <Layers size={20} className="text-primary" />, sub: "Active catalog items" },
                    { label: "Low Stock", value: inventory.filter(i => i.stock < 10).length.toString(), icon: <AlertCircle size={20} className="text-amber-500" />, sub: "Requires attention" },
                    { label: "Out of Stock", value: inventory.filter(i => i.stock === 0).length.toString(), icon: <X size={20} className="text-rose-500" />, sub: "Immediate restock" },
                    { label: "Catalog Health", value: "98.2%", icon: <CheckCircle2 size={20} className="text-emerald-500" />, sub: "Sync accuracy" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card flex flex-col gap-4 group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none">{stat.label}</span>
                                <div className="p-2 bg-muted group-hover:bg-primary/10 rounded-lg group-hover:text-primary transition-colors">{stat.icon}</div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black italic tracking-tighter text-foreground leading-none uppercase">{stat.value}</span>
                                <span className="text-[9px] font-black text-muted-foreground uppercase mt-2 opacity-60 italic leading-none">{stat.sub}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Matrix View */}
            <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card transition-colors">
                <CardHeader className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-xl font-black italic tracking-tight uppercase">Product Matrix</CardTitle>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic leading-none">Real-time stock levels across the catalog</span>
                    </div>
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Find product or SKU..."
                            className="w-full h-11 bg-muted rounded-xl pl-11 pr-4 outline-none border border-transparent focus:border-primary/20 transition-all text-[10px] font-black uppercase tracking-widest"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 text-foreground">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-inter">
                            <thead className="bg-muted">
                                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <th className="px-8 py-5">Product SKU & Name</th>
                                    <th className="px-8 py-5">In Stock</th>
                                    <th className="px-8 py-5">Price Point</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <RefreshCw className="animate-spin text-primary" size={32} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accessing catalog database...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredInventory.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Package className="text-muted-foreground opacity-20" size={48} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No matching products discovered</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredInventory.map((item, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black text-foreground italic uppercase tracking-tight group-hover:text-primary transition-colors">{item.name}</span>
                                                <span className="text-[10px] font-black text-muted-foreground tracking-widest leading-none mt-1 uppercase italic opacity-60">SKU: {item.id.slice(-8).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    "text-sm font-black italic tracking-tight",
                                                    item.stock < 10 ? "text-amber-500" : "text-foreground"
                                                )}>{item.stock}</span>
                                                <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min((item.stock / 50) * 100, 100)}%` }}
                                                        className={cn("h-full", item.stock < 10 ? "bg-amber-500" : "bg-primary")}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-black italic text-sm">
                                            ${item.price.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border leading-none",
                                                item.stock > 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                            )}>
                                                {item.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/5 transition-all">
                                                    <Edit2 size={18} />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-rose-500 rounded-xl hover:bg-rose-500/5 transition-all">
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
