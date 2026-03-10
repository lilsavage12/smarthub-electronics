"use client"

import React, { useState, useEffect } from "react"
import {
    Package, AlertTriangle, TrendingUp, History,
    BarChart3, Smartphone, Search, Filter,
    ArrowRight, Info, Plus, ChevronRight, CheckCircle2,
    Clock, Truck, Layers, Box, Zap, Download, X, RefreshCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function InventoryPage() {
    const router = useRouter()
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
    const [restockAmount, setRestockAmount] = useState(0)

    useEffect(() => {
        const q = query(collection(db, "products"), orderBy("name", "asc"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            // Deduplicate products by ID
            const uniqueProducts = Array.from(new Map(productsData.map((item: any) => [item.id, item])).values())
            setProducts(uniqueProducts)
            setIsLoading(false)
        }, (error) => {
            console.error("Inventory Sync Error:", error)
            toast.error("Critical: Inventory Synchronization Failure")
            setIsLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const handleExport = () => {
        const toastId = toast.loading("Aggregating inventory metrics...")
        try {
            const headers = "ID,Name,Brand,Category,Stock,Price,Total Value\n"
            const rows = filteredProducts.map(p =>
                `${p.id},"${p.name}",${p.brand},${p.category},${p.stock},${p.price},${(p.price * p.stock).toFixed(2)}`
            ).join("\n")
            const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `smarthub_inventory_${new Date().toISOString().split('T')[0]}.csv`)
            link.click()
            toast.success("Inventory metrics exported", { id: toastId })
        } catch (error) {
            toast.error("Export failed", { id: toastId })
        }
    }

    const handleRestock = async (productId: string, amount: number) => {
        if (amount <= 0) return toast.error("Invalid restock quantity")
        const toastId = toast.loading("Updating inventory registers...")
        try {
            const productRef = doc(db, "products", productId)
            await updateDoc(productRef, {
                stock: increment(amount),
                updatedAt: serverTimestamp()
            })
            toast.success(`Inventory updated (+${amount} units)`, { id: toastId })
            setIsRestockModalOpen(false)
            setRestockAmount(0)
        } catch (error) {
            toast.error("Inventory update failed", { id: toastId })
        }
    }

    const handleApproveOrder = async () => {
        const lowStockItems = products.filter(p => p.stock < 10)
        if (lowStockItems.length === 0) return toast.success("No critical stock levels detected")

        const toastId = toast.loading("Running bulk restock...")
        try {
            await Promise.all(lowStockItems.map(p =>
                updateDoc(doc(db, "products", p.id), {
                    stock: increment(20),
                    updatedAt: serverTimestamp()
                })
            ))
            toast.success("Bulk restock authorized (+20 units to all critical SKUs)", { id: toastId })
        } catch (error) {
            toast.error("Bulk restock protocol failed", { id: toastId })
        }
    }

    const filteredProducts = products.filter(p =>
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl lg:text-3xl font-black tracking-tight text-foreground italic uppercase leading-none">Inventory</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage stock levels across all products.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => router.push("/hub-control/products")}
                        variant="outline"
                        className="h-9 px-4 rounded-lg border-border font-black italic tracking-widest uppercase text-[9px] gap-2 hover:bg-muted transition-all"
                    >
                        <Smartphone size={14} />
                        VIEW ALL PRODUCTS
                    </Button>
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="h-9 px-4 rounded-lg border-border font-black italic tracking-widest uppercase text-[9px] gap-2 hover:bg-muted transition-all"
                    >
                        <Download size={14} />
                        EXPORT CSV
                    </Button>
                    <Button
                        onClick={() => toast.success("Stock refresh complete")}
                        className="h-9 px-6 rounded-lg bg-primary text-primary-foreground font-black italic tracking-widest uppercase text-[9px] gap-2 shadow-lg shadow-primary/10 hover:opacity-90 transition-all"
                    >
                        <RefreshCcw size={14} />
                        REFRESH STOCK
                    </Button>
                </div>
            </div>

            {/* Inventory KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Stock",
                        value: filteredProducts.reduce((acc, p) => acc + (p.stock || 0), 0).toLocaleString(),
                        detail: `$${filteredProducts.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0).toLocaleString()} Value`,
                        icon: <Box size={16} className="text-primary" />
                    },
                    {
                        label: "Low Stock",
                        value: `${filteredProducts.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10).length} Models`,
                        detail: "Immediate PO req.",
                        icon: <AlertTriangle size={16} className="text-primary/70" />
                    },
                    {
                        label: "Out of Stock",
                        value: `${filteredProducts.filter(p => (p.stock || 0) === 0).length} Models`,
                        detail: "Require attention",
                        icon: <X size={16} className="text-red-500" />
                    },
                    {
                        label: "Product Categories",
                        value: `${new Set(filteredProducts.map(p => p.brand)).size} Brands`,
                        detail: "Brand variety",
                        icon: <Layers size={16} className="text-primary" />
                    }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-xl border-border shadow-none p-4 bg-card group hover:border-primary/30 transition-all cursor-pointer overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 leading-none">{stat.label}</span>
                            <div className="p-1.5 bg-muted rounded-md group-hover:bg-primary/20 transition-colors text-primary">{stat.icon}</div>
                        </div>
                        <div className="flex flex-col relative z-10">
                            <span className="text-2xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</span>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1.5 opacity-60">{stat.detail}</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Inventory Table */}
                <Card className="xl:col-span-2 rounded-2xl border-border shadow-none overflow-hidden bg-card">
                    <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Layers className="text-primary" size={18} />
                            </div>
                            <div className="flex flex-col">
                                <CardTitle className="text-sm font-black tracking-tight italic uppercase text-foreground">Product Status</CardTitle>
                                <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-60 mt-0.5">Manage models and colors</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={12} />
                                <input
                                    type="text"
                                    placeholder="Quick find..."
                                    className="h-8 pl-8 pr-4 bg-muted border border-border/50 rounded-lg text-[9px] font-black uppercase tracking-widest outline-none focus:border-primary/30 w-32 text-foreground placeholder:text-muted-foreground/30 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-muted">
                                    <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4 text-right">Value</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center font-black italic text-muted-foreground/20 uppercase tracking-[0.3em] text-[10px]">Loading Inventory...</td>
                                        </tr>
                                    ) : filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center font-black italic text-muted-foreground/20 uppercase tracking-[0.3em] text-[10px]">No Products Found</td>
                                        </tr>
                                    ) : filteredProducts.map((item, i) => {
                                        const totalValue = (item.price || 0) * (item.stock || 0);
                                        const status = (item.stock || 0) === 0 ? "Out of Stock" :
                                            (item.stock || 0) < 10 ? "Low Stock" :
                                                (item.stock || 0) > 100 ? "Overstock" : "Healthy";
                                        const statusColor = (item.stock || 0) === 0 ? "text-red-500 bg-red-500/10 border-red-500/20" :
                                            (item.stock || 0) < 10 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
                                                (item.stock || 0) > 100 ? "text-blue-500 bg-blue-500/10 border-blue-500/20" :
                                                    "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";

                                        return (
                                            <tr key={item.id} className="hover:bg-muted/50 transition-all duration-300 group border-b border-border last:border-0 h-16">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-foreground tracking-tight uppercase italic">{item.name}</span>
                                                        <span className="text-[8px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">{item.brand} • {item.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={cn("px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest leading-none border transition-all duration-500", statusColor)}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black italic text-foreground leading-none">{item.stock || 0}</span>
                                                        <div className="h-1 w-12 bg-muted/50 rounded-full overflow-hidden border border-border/10">
                                                            <div
                                                                className={cn("h-full transition-all duration-700", statusColor.split(' ')[0])}
                                                                style={{ width: `${Math.min(100, ((item.stock || 0) / 100) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black italic text-foreground tracking-tighter text-xs">${totalValue.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        onClick={() => { setSelectedProduct(item); setIsRestockModalOpen(true); }}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-border flex justify-center">
                            <Button
                                onClick={() => router.push("/hub-control/audit")}
                                variant="ghost"
                                className="text-[9px] font-black italic text-primary uppercase tracking-widest gap-2 h-8"
                            >
                                VIEW ACTIVITY LOGS
                                <ChevronRight size={12} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Warehouse Insights */}
                <div className="flex flex-col gap-6">
                    <Card className="rounded-2xl border-border shadow-none overflow-hidden bg-card transition-colors">
                        <CardHeader className="p-5 border-b border-border px-6">
                            <div className="flex flex-col gap-0.5">
                                <CardTitle className="text-sm font-black tracking-tight text-foreground uppercase italic leading-none">Inventory Stats</CardTitle>
                                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Product movement trends</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <History size={16} className="text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-tight text-foreground">Stock Flow</span>
                                        <span className="text-[8px] font-bold text-muted-foreground">Weekly cycle</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black italic text-primary">+14%</span>
                            </div>

                            <div className="h-[100px] flex items-end justify-between px-1 gap-1.5">
                                {[30, 60, 45, 90, 65, 80, 75].map((h, i) => (
                                    <div key={i} className="flex-1 bg-muted rounded-t-md transition-all hover:bg-primary/20 cursor-pointer relative group" style={{ height: `${h}%` }}>
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[7px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-black">
                                            {h}u
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-primary rounded-xl text-primary-foreground flex flex-col gap-3 shadow-lg shadow-primary/5 transition-colors">
                                <div className="flex items-center gap-1.5">
                                    <Zap className="text-primary-foreground" size={14} fill="currentColor" />
                                    <span className="text-[8px] font-black uppercase tracking-widest italic opacity-80">Low Stock Alert</span>
                                </div>
                                <p className="text-[10px] font-medium leading-snug">Found <span className="text-primary-foreground font-black">{filteredProducts.filter(p => p.stock < 10).length} critical SKUs</span> requiring immediate attention.</p>
                                <Button
                                    onClick={handleApproveOrder}
                                    className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-9 rounded-lg font-black italic tracking-widest uppercase text-[9px] transition-colors"
                                >
                                    APPROVE BULK RESTOCK
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-none overflow-hidden bg-card transition-colors">
                        <CardHeader className="p-5 border-b border-border px-6">
                            <CardTitle className="text-xs font-black tracking-tight text-foreground uppercase italic leading-none">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="flex flex-col gap-3">
                                {[
                                    { name: "Apple Global", status: "In Transit", time: "3h ago" },
                                    { name: "Samsung Logs", status: "Delayed", time: "8h ago" },
                                ].map((sup, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border group hover:border-primary/20 transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-foreground leading-none">{sup.name}</span>
                                            <span className="text-[8px] font-black text-muted-foreground uppercase mt-0.5 italic">{sup.status}</span>
                                        </div>
                                        <span className="text-[8px] font-black italic text-muted-foreground opacity-60">{sup.time}</span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={() => toast("Redirecting to supplier registry...", { icon: "🏢" })}
                                variant="link"
                                className="w-full mt-2 text-[9px] font-black uppercase text-primary italic tracking-widest h-auto py-1"
                            >
                                Manage Suppliers
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Restock Modal */}
            <AnimatePresence>
                {isRestockModalOpen && selectedProduct && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-black uppercase italic tracking-tight">Manual Restock</h3>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Update stock levels for products</span>
                                </div>
                                <button onClick={() => setIsRestockModalOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all"><X size={20} /></button>
                            </div>

                            <div className="bg-muted/50 p-6 rounded-2xl border border-border flex flex-col gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase text-primary tracking-widest">Product</span>
                                    <span className="text-lg font-black italic">{selectedProduct.name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Current Stock</span>
                                        <span className="text-2xl font-black italic">{selectedProduct.stock}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">New Total</span>
                                        <span className="text-2xl font-black italic text-primary">{Number(selectedProduct.stock) + Number(restockAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Units to Add</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={restockAmount}
                                    onChange={(e) => setRestockAmount(Number(e.target.value))}
                                    className="h-12 bg-muted border border-border rounded-xl px-4 text-sm font-black outline-none focus:border-primary/50 transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-4 mt-2">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => setIsRestockModalOpen(false)}>Abort</Button>
                                <Button
                                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-widest"
                                    onClick={() => handleRestock(selectedProduct.id, restockAmount)}
                                >
                                    Update Stock
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
