"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
    Package, Search, Save, RefreshCcw, 
    AlertCircle, CheckCircle2, ChevronRight, 
    Filter, Box, Tag, Smartphone, Zap,
    ClipboardList, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

function ProductFolder({ product, units, totalStock, onUpdate, isSaving }: any) {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden flex flex-col transition-all">
            {/* Folder Header */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-6 sm:p-8 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-muted/50 transition-all text-left cursor-pointer"
            >
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 bg-white rounded-3xl relative overflow-hidden border border-border shadow-inner flex-shrink-0">
                        <Image 
                            src={product.image || "/images/placeholder.png"} 
                            fill 
                            alt="P" 
                            className="object-contain p-2" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{product.brand}</span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">{product.category}</span>
                        </div>
                        <h3 className="text-xl font-black text-foreground tracking-tight uppercase leading-tight">{product.name}</h3>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                                <Box size={14} className="text-muted-foreground opacity-40" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Total: {totalStock} Units</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag size={14} className="text-muted-foreground opacity-40" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    5 SIZES (S · M · L · XL · XXL)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 px-6 border-r border-border/50">
                        {totalStock <= 0 ? (
                            <span className="text-red-600 text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
                        ) : totalStock <= 5 ? (
                            <span className="text-orange-600 text-[10px] font-black uppercase tracking-widest">Replenish Soon</span>
                        ) : (
                            <span className="text-green-600 text-[10px] font-black uppercase tracking-widest">Healthy</span>
                        )}
                    </div>
                    <div className={cn(
                        "p-3 rounded-2xl bg-muted transition-all",
                        isExpanded && "bg-primary text-white rotate-180"
                    )}>
                        <ChevronDown size={20} />
                    </div>
                </div>
            </button>

            {/* Folder Content: 5 Sizes Breakdown */}
            {isExpanded && (
                <div className="flex flex-col gap-6 p-4 sm:p-8 bg-muted/10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Box size={16} className="text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                                Size Inventory Breakdown (S, M, L, XL, XXL)
                            </h4>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                            Total Units: {totalStock}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {units.map((unit: any) => (
                            <StockTile key={unit.id} unit={unit} onUpdate={onUpdate} isSaving={isSaving} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function StockTile({ unit, onUpdate, isSaving }: any) {
    const isOut = unit.stock <= 0
    const isLow = !isOut && unit.stock <= 3

    return (
        <div 
            className={cn(
                "p-5 rounded-[1.5rem] border border-border/50 bg-white dark:bg-[#121215] flex flex-col gap-4 hover:border-primary/40 transition-all group shadow-sm",
                isOut && "bg-red-500/[0.03] border-red-500/20"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-xs text-primary font-f1 tracking-wider">
                        {unit.size || unit.identifier.replace("Size ", "")}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-none">SIZE</span>
                        <span className="text-sm font-black text-foreground tracking-tight uppercase font-f1 mt-0.5">
                            {unit.identifier}
                        </span>
                    </div>
                </div>

                {isOut ? (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 uppercase tracking-widest">Out</span>
                ) : isLow ? (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 uppercase tracking-widest">Low</span>
                ) : (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 uppercase tracking-widest">In Stock</span>
                )}
            </div>

            <div className="h-px w-full bg-border/40" />

            <div className="flex items-center justify-between bg-muted/40 rounded-2xl p-2 border border-border/60 shadow-inner">
                <div className="pl-3 flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 leading-none">Current Stock</span>
                    <span className={cn(
                        "text-xs font-black mt-1 font-mono",
                        isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-emerald-500"
                    )}>
                        {unit.stock} UNITS
                    </span>
                </div>
                <div className="relative">
                    <Input
                        type="number"
                        min="0"
                        defaultValue={unit.stock}
                        className="w-20 h-10 bg-white dark:bg-[#1a1a1f] border-none text-center font-black text-sm rounded-xl focus:ring-2 focus:ring-primary/20 shadow-sm"
                        onBlur={(e) => {
                            const val = parseInt(e.target.value) || 0
                            if (val !== unit.stock) onUpdate(unit, val)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = parseInt((e.target as any).value) || 0
                                onUpdate(unit, val)
                                ;(e.target as any).blur()
                            }
                        }}
                    />
                    {isSaving === unit.id && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 rounded-xl flex items-center justify-center">
                            <RefreshCcw size={14} className="animate-spin text-primary" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function StockManagerPage() {
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSaving, setIsSaving] = useState<string | null>(null) // ID of item being saved
    const [filter, setFilter] = useState<"All" | "In Stock" | "Low Stock" | "Out of Stock">("All")
    const [selectedBrand, setSelectedBrand] = useState("All")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [activeTab, setActiveTab] = useState<"stock" | "ledger" | "insights">("stock")
    const [logs, setLogs] = useState<any[]>([])
    const [logsLoading, setLogsLoading] = useState(false)
    const [orders, setOrders] = useState<any[]>([])

    const fetchProducts = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/products?all=true")
            const data = await res.json()
            setProducts(data)
        } catch (error) {
            toast.error("Failed to load inventory")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchLogs = async () => {
        setLogsLoading(true)
        try {
            const res = await fetch("/api/stock/logs?limit=300")
            const data = await res.json()
            setLogs(Array.isArray(data) ? data : [])
        } catch {}
        finally { setLogsLoading(false) }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    useEffect(() => {
        if (activeTab === "ledger") fetchLogs()
        if (activeTab === "insights") {
            fetchLogs()
            fetch("/api/orders").then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {})
        }
    }, [activeTab])

    const brands = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))].sort(), [products])
    const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))].sort(), [products])

    const SIZES = useMemo(() => ["S", "M", "L", "XL", "XXL"], [])

    // Flattening logic to create Physical Size Stock Units per product
    const stockUnits = useMemo(() => {
        const units: any[] = []

        products.forEach(p => {
            const specs = typeof p.specs === 'string' ? JSON.parse(p.specs || '{}') : (p.specs || {})
            const sizeMap = specs.sizes || {}

            SIZES.forEach(size => {
                const stock = sizeMap[size] !== undefined ? (parseInt(sizeMap[size]) || 0) : 0
                units.push({
                    id: `${p.id}-size-${size}`,
                    productId: p.id,
                    type: "Size Stock",
                    name: p.name,
                    brand: p.brand,
                    category: p.category,
                    image: p.image,
                    stock: stock,
                    size: size,
                    identifier: `Size ${size}`
                })
            })
        })

        return units.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 u.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 (u.identifier || "").toLowerCase().includes(searchQuery.toLowerCase())
            
            const matchesBrand = selectedBrand === "All" || u.brand === selectedBrand
            const matchesCategory = selectedCategory === "All" || u.category === selectedCategory

            if (!matchesBrand || !matchesCategory) return false

            if (filter === "Low Stock") return matchesSearch && u.stock > 0 && u.stock <= 3
            if (filter === "Out of Stock") return matchesSearch && u.stock <= 0
            if (filter === "In Stock") return matchesSearch && u.stock > 0
            return matchesSearch
        })
    }, [products, searchQuery, filter, selectedBrand, selectedCategory, SIZES])

    const handleUpdateStock = async (unit: any, newStock: number) => {
        setIsSaving(unit.id)
        try {
            // Find full product to update
            const product = products.find(p => p.id === unit.productId)
            if (!product) throw new Error("Product not found")

            const specs = typeof product.specs === 'string' ? JSON.parse(product.specs || '{}') : { ...product.specs }
            const currentSizes = { ...(specs.sizes || {}) }
            const cleanStock = Math.max(0, parseInt(newStock as any) || 0)
            
            currentSizes[unit.size] = cleanStock
            specs.sizes = currentSizes

            // Recalculate global product stock as the exact sum of all sizes
            const newTotalStock = SIZES.reduce((acc, s) => acc + (parseInt(currentSizes[s]) || 0), 0)
            product.stock = newTotalStock

            const res = await fetch(`/api/products/${product.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stock: newTotalStock,
                    specs: specs
                })
            })

            if (!res.ok) throw new Error("Update failed")

            // Log the stock change (non-blocking)
            fetch("/api/stock/logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product.id,
                    productName: unit.name,
                    identifier: unit.identifier,
                    previousStock: unit.stock,
                    newStock: cleanStock,
                })
            }).catch(() => {})
            
            // Local update to avoid full refetch
            setProducts(prev => prev.map(p => p.id === product.id ? { ...product, stock: newTotalStock, specs } : p))
            toast.success(`${unit.name} (${unit.identifier}) set to ${cleanStock} units`)
        } catch (error) {
            toast.error("Update failed")
        } finally {
            setIsSaving(null)
        }
    }

    const insightData = useMemo(() => {
        const soldMap: Record<string, { name: string, unitsSold: number, revenue: number, productId: string }> = {}
        orders.forEach((order: any) => {
            (order.items || []).forEach((item: any) => {
                const key = item.productId
                if (!soldMap[key]) soldMap[key] = { name: item.name, unitsSold: 0, revenue: 0, productId: item.productId }
                soldMap[key].unitsSold += item.quantity
                soldMap[key].revenue += item.price * item.quantity
            })
        })
        return Object.values(soldMap).sort((a, b) => b.unitsSold - a.unitsSold)
    }, [orders])

    const slowMovers = useMemo(() => {
        const soldIds = new Set(insightData.map((i: any) => i.productId))
        return products.filter(p => p.stock > 0 && !soldIds.has(p.id)).slice(0, 8)
    }, [products, insightData])

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground uppercase leading-none">Stock Manager</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-80">Manage inventory, track history, and monitor movement.</p>
                </div>
                <Button
                    onClick={fetchProducts}
                    variant="ghost"
                    className="h-10 px-6 rounded-xl border border-border bg-card hover:bg-muted font-bold gap-2 text-[10px] uppercase tracking-widest"
                >
                    <RefreshCcw size={14} className={isLoading ? "animate-spin" : ""} />
                    Sync Warehouse
                </Button>
            </div>

            {/* Stats Overview - always visible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Units", value: stockUnits.reduce((acc, u) => acc + u.stock, 0), icon: <Box size={18} />, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Stock Alerts", value: stockUnits.filter(u => u.stock > 0 && u.stock <= 10).length, icon: <AlertCircle size={18} />, color: "text-orange-500", bg: "bg-orange-500/10" },
                    { label: "Out of Stock", value: stockUnits.filter(u => u.stock <= 0).length, icon: <Zap size={18} />, color: "text-red-500", bg: "bg-red-500/10" },
                    { label: "Physical Variants", value: stockUnits.length, icon: <Package size={18} />, color: "text-green-500", bg: "bg-green-500/10" },
                ].map((stat, i) => (
                    <Card key={i} className="p-6 rounded-[2rem] border-border bg-card flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Snapshot</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</span>
                            <span className="text-2xl font-black text-foreground">{stat.value}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Tab Bar */}
            <div className="flex gap-2 bg-card border border-border rounded-2xl p-1.5">
                {([
                    { id: "stock", label: "Stock Manager", icon: <Package size={14} /> },
                    { id: "ledger", label: "Ledger", icon: <ClipboardList size={14} /> },
                    { id: "insights", label: "Insights", icon: <TrendingUp size={14} /> },
                ] as const).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 flex-1 justify-center h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === tab.id
                                ? "bg-primary text-white shadow"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* STOCK TAB */}
            {activeTab === "stock" && (
                <div className="flex flex-col gap-6">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-6 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 w-full md:max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input
                                    placeholder="Search apparel, team, or size..."
                                    className="w-full h-12 bg-muted border-none pl-12 rounded-xl text-sm font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2 whitespace-nowrap">Show:</span>
                                {(["All", "In Stock", "Low Stock", "Out of Stock"] as any[]).map((f) => (
                                    <Button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={cn(
                                            "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            filter === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        {f}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-4 gap-x-8 pt-4 border-t border-border/50">
                            <div className="flex flex-col gap-2 min-w-[140px]">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Filter by Brand</span>
                                <select
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    className="h-10 bg-muted border-none rounded-xl text-xs font-bold px-4 focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                                >
                                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2 min-w-[140px]">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Filter by Category</span>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="h-10 bg-muted border-none rounded-xl text-xs font-bold px-4 focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {(selectedBrand !== "All" || selectedCategory !== "All" || searchQuery || filter !== "All") && (
                                <Button
                                    variant="ghost"
                                    onClick={() => { setSelectedBrand("All"); setSelectedCategory("All"); setSearchQuery(""); setFilter("All") }}
                                    className="h-10 self-end text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                                >
                                    Reset All
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Stock List */}
                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-24 bg-card rounded-2xl animate-pulse border border-border" />
                            ))
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                                <Package size={48} />
                                <span className="font-bold uppercase text-xs tracking-widest">No products found</span>
                            </div>
                        ) : (
                            products.filter(p => {
                                const units = stockUnits.filter(u => u.productId === p.id)
                                return units.length > 0
                            }).map((product) => {
                                const units = stockUnits.filter(u => u.productId === product.id)
                                const totalStock = units.reduce((acc, u) => acc + u.stock, 0)
                                return (
                                    <ProductFolder key={product.id} product={product} units={units} totalStock={totalStock} onUpdate={handleUpdateStock} isSaving={isSaving} />
                                )
                            })
                        )}
                    </div>
                </div>
            )}

            {/* LEDGER TAB */}
            {activeTab === "ledger" && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight">Stock Ledger</h2>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Complete audit trail of all stock changes</p>
                        </div>
                        <Button onClick={fetchLogs} variant="ghost" className="h-9 px-4 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest gap-2">
                            <RefreshCcw size={12} className={logsLoading ? "animate-spin" : ""} /> Refresh
                        </Button>
                    </div>

                    {logsLoading ? (
                        Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-card rounded-2xl animate-pulse border border-border" />)
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-40">
                            <ClipboardList size={44} />
                            <p className="text-xs font-black uppercase tracking-widest">No entries recorded yet</p>
                            <p className="text-[10px] font-bold text-muted-foreground">Go to Stock Manager and update a value to create your first log</p>
                        </div>
                    ) : (
                        <div className="bg-card rounded-[2rem] border border-border overflow-hidden">
                            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30">
                                {["Product / Variant", "Type", "Change", "Total"].map(h => (
                                    <span key={h} className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{h}</span>
                                ))}
                            </div>
                            {logs.map((log: any, i: number) => (
                                <div key={log.id || i} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors items-center">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-black text-foreground uppercase truncate">{log.productName}</span>
                                        <span className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase tracking-wider">{log.identifier}</span>
                                        <span className="text-[9px] font-bold text-muted-foreground opacity-40">
                                            {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div>
                                        {log.type === "first_entry" && <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-wider whitespace-nowrap">First Entry</span>}
                                        {log.type === "restock" && <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-wider">Restock</span>}
                                        {log.type === "deduction" && <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-600 text-[9px] font-black uppercase tracking-wider">Deduction</span>}
                                        {log.type === "adjustment" && <span className="px-2 py-1 rounded-lg bg-gray-500/10 text-gray-500 text-[9px] font-black uppercase tracking-wider">Adjustment</span>}
                                    </div>
                                    <span className={cn(
                                        "text-sm font-black tabular-nums",
                                        log.quantityChanged > 0 ? "text-green-600" : log.quantityChanged < 0 ? "text-red-600" : "text-muted-foreground"
                                    )}>
                                        {log.quantityChanged > 0 ? "+" : ""}{log.quantityChanged}
                                    </span>
                                    <span className="text-sm font-black text-foreground tabular-nums">{log.newStock}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* INSIGHTS TAB */}
            {activeTab === "insights" && (
                <div className="flex flex-col gap-8">
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight">Stock Insights</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Movement velocity based on live order and stock data</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total Units Sold", value: insightData.reduce((a: number, b: any) => a + b.unitsSold, 0) },
                            { label: "Total Orders", value: orders.length },
                            { label: "Best Seller", value: insightData[0]?.name?.split(' ').slice(0, 2).join(' ') || "—" },
                            { label: "Slow Movers", value: slowMovers.length },
                        ].map((s, i) => (
                            <Card key={i} className="p-5 rounded-[2rem] border-border flex flex-col gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{s.label}</span>
                                <span className="text-xl font-black text-foreground truncate">{s.value}</span>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Fast Movers */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <TrendingUp size={14} /> Fast Movers
                            </h3>
                            {insightData.length === 0 ? (
                                <div className="text-center py-10 opacity-40 text-xs font-black uppercase tracking-widest bg-card rounded-2xl border border-border">No sales data yet</div>
                            ) : insightData.slice(0, 6).map((item: any, i: number) => (
                                <div key={item.productId} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                                    <span className="text-2xl font-black text-primary w-8 text-center opacity-30">#{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black uppercase truncate">{item.name}</p>
                                        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-700"
                                                style={{ width: `${Math.round((item.unitsSold / (insightData[0]?.unitsSold || 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                                        <span className="text-sm font-black text-foreground">{item.unitsSold} sold</span>
                                        <span className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase">KES {item.revenue.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Slow Movers */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                                <AlertCircle size={14} /> Slow Movers <span className="text-muted-foreground opacity-40 normal-case font-bold tracking-normal text-[9px]">(in stock, no sales)</span>
                            </h3>
                            {slowMovers.length === 0 ? (
                                <div className="text-center py-10 opacity-40 text-xs font-black uppercase tracking-widest bg-card rounded-2xl border border-border">All stocked products have sales 🎉</div>
                            ) : slowMovers.map((p: any) => (
                                <div key={p.id} className="bg-card border border-orange-500/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted relative overflow-hidden flex-shrink-0">
                                            <Image src={p.image || "/images/placeholder.png"} fill alt="" className="object-contain p-1" sizes="40px" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase">{p.name}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase">{p.brand} · {p.stock} in stock</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg whitespace-nowrap">0 Sold</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
