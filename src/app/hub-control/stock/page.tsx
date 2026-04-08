"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
    Package, Search, Save, RefreshCcw, 
    AlertCircle, CheckCircle2, ChevronRight, 
    Filter, Box, Tag, Smartphone, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

function ProductFolder({ product, units, totalStock, onUpdate, isSaving }: any) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden flex flex-col transition-all">
            {/* Folder Header */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-6 sm:p-8 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-muted/50 transition-all text-left"
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
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total: {totalStock} Units</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag size={14} className="text-muted-foreground opacity-40" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {Array.from(new Set(units.map((u: any) => u.variantId).filter(Boolean))).length} VARIANTS / {Array.from(new Set(units.map((u: any) => u.colorName).filter(Boolean))).length} COLORS
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 px-6 border-r border-border/50">
                        {totalStock <= 0 ? (
                            <span className="text-red-600 text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
                        ) : totalStock <= 10 ? (
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

            {/* Folder Content (Categorized Selection) */}
            {isExpanded && (
                <div className="flex flex-col gap-8 p-4 sm:p-8 bg-muted/10 animate-in fade-in slide-in-from-top-4 duration-300">
                    {/* Base Model Section */}
                    {units.some((u: any) => u.type === "Base Color") && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 px-2">
                                <Box size={16} className="text-primary" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Base Model Distribution</h4>
                                <div className="h-px flex-1 bg-border/50" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {units.filter((u: any) => u.type === "Base Color").map((unit: any) => (
                                    <StockTile key={unit.id} unit={unit} onUpdate={onUpdate} isSaving={isSaving} showAllocation />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Variants Section */}
                    {units.some((u: any) => u.type === "Variant Color" || u.type === "Variant") && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 px-2">
                                <Zap size={16} className="text-primary" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Hardware Variant Configurations</h4>
                                <div className="h-px flex-1 bg-border/50" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {units.filter((u: any) => u.type === "Variant Color" || u.type === "Variant").map((unit: any) => (
                                    <StockTile key={unit.id} unit={unit} onUpdate={onUpdate} isSaving={isSaving} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function StockTile({ unit, onUpdate, isSaving, showAllocation = false }: any) {
    return (
        <div 
            className={cn(
                "p-5 rounded-[1.5rem] border border-border/50 bg-white flex flex-col gap-4 hover:border-primary/30 transition-all group shadow-sm",
                unit.stock <= 0 && "bg-red-500/[0.02] border-red-500/10"
            )}
        >
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-xl relative overflow-hidden border border-border/40 shrink-0">
                    <Image 
                        src={unit.image || "/images/placeholder.png"} 
                        fill 
                        alt="U" 
                        className="object-contain p-1 group-hover:scale-125 transition-transform duration-500" 
                    />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 leading-none">{unit.type}</span>
                        {unit.stock <= 0 ? (
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        ) : unit.stock <= 10 ? (
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                        )}
                    </div>
                    <span className="text-xs font-black text-foreground tracking-tight uppercase truncate mt-1">{unit.identifier}</span>
                </div>
            </div>

            <div className="h-px w-full bg-border/40" />

            {showAllocation && (
                <div className="flex items-center justify-between px-2 mb-[-8px]">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">
                        POOL TOTAL: {unit.totalPool}
                    </span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">
                        ALLOCATED: {unit.allocated}
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between bg-muted/30 rounded-2xl p-2 border border-border/60 shadow-inner">
                <div className="pl-3 flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 leading-none">In Stock</span>
                    <span className={cn(
                        "text-xs font-black mt-1",
                        unit.stock <= 0 ? "text-red-600" : unit.stock <= 10 ? "text-orange-600" : "text-green-600"
                    )}>
                        {unit.stock} UNITS
                    </span>
                </div>
                <div className="relative">
                    <Input
                        type="number"
                        defaultValue={unit.stock}
                        className="w-20 h-10 bg-white border-none text-center font-black text-sm rounded-xl focus:ring-2 focus:ring-primary/20 shadow-sm"
                        onBlur={(e) => {
                            const val = parseInt(e.target.value)
                            if (val !== unit.stock) onUpdate(unit, val)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = parseInt((e.target as any).value)
                                onUpdate(unit, val)
                                ;(e.target as any).blur()
                            }
                        }}
                    />
                    {isSaving === unit.id && (
                        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
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
    const [filter, setFilter] = useState<"All" | "Low Stock" | "Out of Stock" | "With Variants" | "With Colors">("All")
    const [selectedBrand, setSelectedBrand] = useState("All")
    const [selectedCategory, setSelectedCategory] = useState("All")

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

    useEffect(() => {
        fetchProducts()
    }, [])

    const brands = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))].sort(), [products])
    const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))].sort(), [products])

    // Flattening logic to create "Physical Items" (Stock Units) with Pool Deduction logic
    const stockUnits = useMemo(() => {
        const units: any[] = []

        products.forEach(p => {
            const specs = typeof p.specs === 'string' ? JSON.parse(p.specs || '{}') : (p.specs || {})
            const colors = specs.productColors || []
            const variants = p.variants || []

            const hasColors = colors.length > 0
            const hasVariants = variants.length > 0

            // Property Filtering logic
            if (filter === "With Variants" && !hasVariants) return
            if (filter === "With Colors" && !hasColors) return

            // 1. Capture Hardware Variants First (to know allocations)
            const variantUnits: any[] = []
            if (hasVariants) {
                variants.forEach((v: any) => {
                    const vColors = v.productColors || []
                    if (vColors.length > 0) {
                        vColors.forEach((vc: any, vcIdx: number) => {
                            // Try to find the matching color image from the base specs.productColors pool
                            const matchingBaseColor = colors.find((c: any) => c.color?.toLowerCase() === vc.color?.toLowerCase())
                            variantUnits.push({
                                id: `${v.id}-vc-${vcIdx}`,
                                productId: p.id,
                                variantId: v.id,
                                type: "Variant Color",
                                name: p.name,
                                brand: p.brand,
                                category: p.category,
                                image: vc.image || matchingBaseColor?.image || p.image,
                                stock: parseInt(vc.stock) || 0,
                                identifier: `${v.ram}/${v.storage} - ${vc.color}`,
                                colorName: vc.color,
                                variantObj: v
                            })
                        })
                    } else {
                        variantUnits.push({
                            id: v.id,
                            productId: p.id,
                            variantId: v.id,
                            type: "Variant",
                            name: p.name,
                            brand: p.brand,
                            category: p.category,
                            image: p.image,
                            stock: parseInt(v.stock) || 0,
                            identifier: `${v.ram}/${v.storage}`,
                            variantObj: v
                        })
                    }
                })
            }

            // 2. Capture Top-Level Colors (Base Colors) with Deduction logic
            if (hasColors) {
                colors.forEach((c: any, idx: number) => {
                    // Find all variants of this same color
                    const allocatedToVariants = variantUnits
                        .filter(vu => vu.colorName?.toLowerCase() === c.color?.toLowerCase())
                        .reduce((acc, vu) => acc + vu.stock, 0)
                    
                    const totalPool = parseInt(c.stock) || 0
                    const remainder = Math.max(0, totalPool - allocatedToVariants)

                    units.push({
                        id: `${p.id}-color-${idx}`,
                        productId: p.id,
                        type: "Base Color",
                        name: p.name,
                        brand: p.brand,
                        category: p.category,
                        image: c.image || p.image,
                        stock: remainder, // Show what's left for the base model
                        totalPool: totalPool, // Store the master pool size
                        allocated: allocatedToVariants,
                        identifier: c.color,
                        colorIndex: idx,
                        colorName: c.color
                    })
                })
            }

            // Add the variant units we collected
            units.push(...variantUnits)

            // 3. Fallback to Base Model if nothing else
            if (!hasColors && !hasVariants) {
                units.push({
                    id: p.id,
                    productId: p.id,
                    type: "Standard",
                    name: p.name,
                    brand: p.brand,
                    category: p.category,
                    image: p.image,
                    stock: p.stock,
                    identifier: "Standard",
                    path: "base"
                })
            }
        })

        return units.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 u.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 (u.identifier || "").toLowerCase().includes(searchQuery.toLowerCase())
            
            const matchesBrand = selectedBrand === "All" || u.brand === selectedBrand
            const matchesCategory = selectedCategory === "All" || u.category === selectedCategory

            if (!matchesBrand || !matchesCategory) return false

            if (filter === "Low Stock") return matchesSearch && u.stock > 0 && u.stock <= 10
            if (filter === "Out of Stock") return matchesSearch && u.stock <= 0
            return matchesSearch
        })
    }, [products, searchQuery, filter, selectedBrand, selectedCategory])

    const handleUpdateStock = async (unit: any, newStock: number) => {
        setIsSaving(unit.id)
        try {
            // Find full product to update
            const product = products.find(p => p.id === unit.productId)
            if (!product) throw new Error("Product not found")

            const specs = typeof product.specs === 'string' ? JSON.parse(product.specs || '{}') : { ...product.specs }
            const variants = [...(product.variants || [])]

            if (unit.type === "Standard") {
                product.stock = newStock
            } else if (unit.type === "Base Color") {
                // The 'newStock' provided is the remainder (entry-level base model).
                // We add the allocated variant stock to get the NEW total pool for this color.
                const newTotalPool = newStock + unit.allocated
                specs.productColors[unit.colorIndex].stock = String(newTotalPool)
                
                // Recalculate global product stock from the master color pools
                product.stock = specs.productColors.reduce((acc: number, c: any) => acc + (parseInt(c.stock) || 0), 0)
            } else if (unit.type === "Variant") {
                const vIdx = variants.findIndex(v => v.id === unit.variantId)
                if (vIdx !== -1) {
                    variants[vIdx].stock = String(newStock)
                    product.stock = variants.reduce((acc: number, v: any) => acc + (parseInt(v.stock) || 0), 0)
                }
            } else if (unit.type === "Variant Color") {
                const vIdx = variants.findIndex(v => v.id === unit.variantId)
                if (vIdx !== -1) {
                    const vc = [...(variants[vIdx].productColors || [])]
                    const vcIdx = vc.findIndex(c => c.color === unit.colorName)
                    if (vcIdx !== -1) {
                        const oldVal = parseInt(vc[vcIdx].stock) || 0
                        const diff = newStock - oldVal
                        
                        vc[vcIdx].stock = String(newStock)
                        variants[vIdx].productColors = vc
                        
                        // Recalculate variant's own stock
                        variants[vIdx].stock = vc.reduce((acc: number, c: any) => acc + (parseInt(c.stock) || 0), 0)
                        
                        // Sync with Master Pool in specs if it exists
                        const poolIdx = specs.productColors?.findIndex((c: any) => c.color?.toLowerCase() === unit.colorName?.toLowerCase())
                        if (poolIdx !== -1 && specs.productColors) {
                            const currentPool = parseInt(specs.productColors[poolIdx].stock) || 0
                            specs.productColors[poolIdx].stock = String(currentPool + diff)
                        }

                        // Sync global stock
                        if (specs.productColors?.length > 0) {
                            product.stock = specs.productColors.reduce((acc: number, c: any) => acc + (parseInt(c.stock) || 0), 0)
                        } else {
                            product.stock = variants.reduce((acc: number, v: any) => acc + (parseInt(v.stock) || 0), 0)
                        }
                    }
                }
            }

            const res = await fetch(`/api/products/${product.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stock: product.stock,
                    specs: specs,
                    variants: variants
                })
            })

            if (!res.ok) throw new Error("Update failed")
            
            // Local update to avoid full refetch
            setProducts(prev => prev.map(p => p.id === product.id ? { ...product, specs, variants } : p))
            toast.success(`Stock updated: ${unit.name} (${unit.identifier})`)
        } catch (error) {
            toast.error("Update failed")
        } finally {
            setIsSaving(null)
        }
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground uppercase leading-none">Stock Manager</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-80">Quickly update units for base models and variants.</p>
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

            {/* Stats Overview */}
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

            {/* Toolbar */}
            <div className="flex flex-col gap-6 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Search model, SKU or color..."
                            className="w-full h-12 bg-muted border-none pl-12 rounded-xl text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2 whitespace-nowrap">Show:</span>
                        {(["All", "Low Stock", "Out of Stock", "With Variants", "With Colors"] as any[]).map((f) => (
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
                            onClick={() => {
                                setSelectedBrand("All")
                                setSelectedCategory("All")
                                setSearchQuery("")
                                setFilter("All")
                            }}
                            className="h-10 self-end text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                        >
                            Reset All
                        </Button>
                    )}
                </div>
            </div>

            {/* Stock List - Dynamic Layout */}
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
                        const units = stockUnits.filter(u => u.productId === p.id);
                        return units.length > 0;
                    }).map((product) => {
                        const units = stockUnits.filter(u => u.productId === product.id)
                        const totalStock = units.reduce((acc, u) => acc + u.stock, 0)
                        const isSimple = units.length === 1

                        if (isSimple) {
                            const unit = units[0]
                            return (
                                <div 
                                    key={product.id} 
                                    className={cn(
                                        "group bg-card p-4 rounded-[2rem] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-lg transition-all",
                                        unit.stock <= 0 && "border-red-500/20 bg-red-500/[0.01]"
                                    )}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="h-16 w-16 bg-muted rounded-2xl relative overflow-hidden border border-border flex-shrink-0">
                                            <Image 
                                                src={unit.image || "/images/placeholder.png"} 
                                                fill 
                                                alt="P" 
                                                className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-primary uppercase leading-none">{product.brand}</span>
                                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase bg-slate-100 text-slate-500">Standard</span>
                                            </div>
                                            <h3 className="text-sm font-black text-foreground truncate mt-1 uppercase">{product.name}</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end gap-1 px-4 border-r border-border/50">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Availability</span>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase",
                                                unit.stock <= 0 ? "text-red-500" : unit.stock <= 10 ? "text-orange-500" : "text-green-500"
                                            )}>
                                                {unit.stock <= 0 ? "Out of Stock" : unit.stock <= 10 ? "Low Stock" : "In Stock"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    defaultValue={unit.stock}
                                                    className="w-24 h-12 bg-muted border-none text-center font-black text-lg rounded-xl focus:ring-2 focus:ring-primary/20"
                                                    onBlur={(e) => {
                                                        const val = parseInt(e.target.value)
                                                        if (val !== unit.stock) handleUpdateStock(unit, val)
                                                    }}
                                                />
                                                {isSaving === unit.id && (
                                                    <div className="absolute inset-0 bg-muted/80 rounded-xl flex items-center justify-center">
                                                        <RefreshCcw size={16} className="animate-spin text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <ProductFolder key={product.id} product={product} units={units} totalStock={totalStock} onUpdate={handleUpdateStock} isSaving={isSaving} />
                        )
                    })
                )}
            </div>
        </div>
    )
}
